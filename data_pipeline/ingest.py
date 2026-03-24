from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

REQUIRED_FIELDS = {
    "id",
    "genre",
    "question",
    "options",
    "correct_answer",
    "explanation_context",
}
DEFAULT_PERSIST_DIR = Path("chroma_db")


def _normalize_collection_name(raw_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", raw_name.strip().lower())
    cleaned = cleaned.strip("_-")
    if not cleaned:
        cleaned = "default"
    if len(cleaned) < 3:
        cleaned = f"{cleaned}_qa"
    return cleaned[:63]


def _load_json_rows(dataset_path: Path) -> list[dict[str, Any]]:
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")

    with dataset_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    if not isinstance(payload, list):
        raise ValueError("Dataset JSON must be an array of question objects.")

    validated_rows: list[dict[str, Any]] = []
    for index, row in enumerate(payload):
        if not isinstance(row, dict):
            raise ValueError(f"Row {index} is not an object.")

        missing = REQUIRED_FIELDS - set(row.keys())
        if missing:
            raise ValueError(f"Row {index} missing required fields: {sorted(missing)}")

        if not isinstance(row["options"], list) or not row["options"]:
            raise ValueError(f"Row {index} must contain a non-empty 'options' array.")

        validated_rows.append(row)

    return validated_rows


def _build_documents(rows: list[dict[str, Any]]) -> dict[str, tuple[list[Document], list[str]]]:
    grouped: dict[str, tuple[list[Document], list[str]]] = {}

    for row in rows:
        genre = str(row["genre"]).strip()
        collection_name = _normalize_collection_name(genre)

        text_for_embedding = (
            f"Question: {row['question']}\n"
            f"Correct Answer: {row['correct_answer']}\n"
            f"Explanation Context: {row['explanation_context']}"
        )

        metadata = {
            "id": str(row["id"]),
            "genre": genre,
            "question": str(row["question"]),
            "options": json.dumps(row["options"], ensure_ascii=True),
            "correct_answer": str(row["correct_answer"]),
            "explanation_context": str(row["explanation_context"]),
            "source": str(row.get("source", f"{genre}_dataset")),
            "page": str(row.get("page", "N/A")),
        }

        doc = Document(page_content=text_for_embedding, metadata=metadata)
        doc_id = f"{collection_name}::{metadata['id']}"

        if collection_name not in grouped:
            grouped[collection_name] = ([], [])

        grouped[collection_name][0].append(doc)
        grouped[collection_name][1].append(doc_id)

    return grouped


def ingest_dataset(dataset_path: Path, persist_dir: Path) -> None:
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GOOGLE_API_KEY. Set it in environment or .env.")

    rows = _load_json_rows(dataset_path)
    grouped_docs = _build_documents(rows)

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=api_key,
    )

    persist_dir.mkdir(parents=True, exist_ok=True)

    total_docs = 0
    for collection_name, (documents, ids) in grouped_docs.items():
        vectorstore = Chroma(
            collection_name=collection_name,
            persist_directory=str(persist_dir),
            embedding_function=embeddings,
        )

        existing = vectorstore.get(include=[])  # ids only
        existing_ids = existing.get("ids", []) if existing else []
        if existing_ids:
            vectorstore.delete(ids=existing_ids)

        vectorstore.add_documents(documents=documents, ids=ids)
        total_docs += len(documents)
        print(f"[ingest] Collection '{collection_name}': {len(documents)} documents")

    print(f"[ingest] Complete. Indexed {total_docs} total documents.")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest quiz JSON into ChromaDB by genre.")
    parser.add_argument(
        "--dataset",
        type=Path,
        default=Path("dataset.json"),
        help="Path to dataset JSON file.",
    )
    parser.add_argument(
        "--persist-dir",
        type=Path,
        default=DEFAULT_PERSIST_DIR,
        help="Persistent Chroma directory.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    try:
        ingest_dataset(args.dataset, args.persist_dir)
    except Exception as exc:
        print(f"[ingest] Failed: {exc}")
        raise
