from __future__ import annotations

import hashlib
import math
import os
import re
from typing import Iterable

from dotenv import load_dotenv
from langchain_core.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings


class LocalHashEmbeddings(Embeddings):
    """Deterministic local embeddings fallback that requires no network access."""

    def __init__(self, dimensions: int = 384) -> None:
        self.dimensions = dimensions

    def _tokenize(self, text: str) -> Iterable[str]:
        return re.findall(r"[a-zA-Z0-9_]+", text.lower())

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimensions
        tokens = list(self._tokenize(text))
        if not tokens:
            return vector

        for token in tokens:
            digest = hashlib.blake2b(token.encode("utf-8"), digest_size=16).digest()
            index = int.from_bytes(digest[:8], byteorder="big") % self.dimensions
            sign = 1.0 if (digest[8] & 1) == 0 else -1.0
            magnitude = 1.0 + (digest[9] / 255.0)
            vector[index] += sign * magnitude

        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]
        return vector

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)


def get_embedding_function() -> Embeddings:
    """
    Returns embedding function based on EMBEDDING_PROVIDER:
    - google: force Google embeddings (requires key and network)
    - local: force local hash embeddings (offline-safe)
    - auto (default): try Google first, fallback to local on failure
    """
    load_dotenv()

    provider = os.getenv("EMBEDDING_PROVIDER", "auto").strip().lower()
    api_key = os.getenv("GOOGLE_API_KEY")

    if provider == "local":
        print("[embeddings] Using local hash embeddings (EMBEDDING_PROVIDER=local).")
        return LocalHashEmbeddings()

    if provider == "google":
        if not api_key:
            raise RuntimeError("EMBEDDING_PROVIDER=google but GOOGLE_API_KEY is missing.")
        print("[embeddings] Using Google embeddings (EMBEDDING_PROVIDER=google).")
        return GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-001",
            google_api_key=api_key,
        )

    # auto mode
    if api_key:
        try:
            emb = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-001",
                google_api_key=api_key,
            )
            emb.embed_query("connectivity check")
            print("[embeddings] Google embeddings available. Using Google provider.")
            return emb
        except Exception as exc:  # noqa: BLE001
            print(f"[embeddings] Google embeddings unavailable ({exc}). Falling back to local.")

    print("[embeddings] Using local hash embeddings (auto fallback).")
    return LocalHashEmbeddings()
