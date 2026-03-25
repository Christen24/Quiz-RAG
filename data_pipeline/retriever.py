from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma

try:
    from data_pipeline.embeddings import get_embedding_function
except ModuleNotFoundError:
    from embeddings import get_embedding_function

# Disable noisy Chroma telemetry warnings in local/dev runs.
os.environ["ANONYMIZED_TELEMETRY"] = "False"
os.environ["CHROMA_TELEMETRY_IMPL"] = "none"

DEFAULT_PERSIST_DIR = Path("chroma_db")


def _normalize_collection_name(raw_name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", raw_name.strip().lower())
    cleaned = cleaned.strip("_-")
    if not cleaned:
        cleaned = "default"
    if len(cleaned) < 3:
        cleaned = f"{cleaned}_qa"
    return cleaned[:63]


def _require_api_key() -> str:
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GOOGLE_API_KEY. Set it in environment or .env.")
    return api_key


def _optional_api_key() -> str | None:
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    return api_key if api_key else None


def _safe_parse_json(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    if not match:
        raise ValueError("Model response did not contain JSON.")

    return json.loads(match.group(0))


def _clamp_confidence(value: Any) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        numeric = 0.5
    return max(0.0, min(1.0, numeric))


def _build_context_chunks(docs: list[Any]) -> tuple[str, list[dict[str, str]]]:
    if not docs:
        return "", []

    context_lines: list[str] = []
    citations: list[dict[str, str]] = []

    for idx, doc in enumerate(docs, start=1):
        metadata = doc.metadata or {}
        source = str(metadata.get("source", metadata.get("id", "unknown_source")))
        page = str(metadata.get("page", "N/A"))
        snippet = " ".join(doc.page_content.split())[:320]

        context_lines.append(
            f"[{idx}] source={source} page={page}\n"
            f"question={metadata.get('question', '')}\n"
            f"correct_answer={metadata.get('correct_answer', '')}\n"
            f"context={metadata.get('explanation_context', '')}"
        )
        citations.append(
            {
                "source": source,
                "page": page,
                "snippet": snippet,
            }
        )

    return "\n\n".join(context_lines), citations


def get_quiz_explanation(
    question: str,
    user_answer: str,
    genre: str,
    persist_dir: Path = DEFAULT_PERSIST_DIR,
) -> dict[str, Any]:
    if not question.strip():
        raise ValueError("Question text is required.")
    if not user_answer.strip():
        raise ValueError("User answer is required.")
    if not genre.strip():
        raise ValueError("Genre is required.")

    api_key = _optional_api_key()

    embeddings = get_embedding_function()

    collection_name = _normalize_collection_name(genre)
    vectorstore = Chroma(
        collection_name=collection_name,
        persist_directory=str(persist_dir),
        embedding_function=embeddings,
    )

    docs = vectorstore.similarity_search(question, k=2)
    if not docs:
        return {
            "is_correct": False,
            "explanation": (
                "I could not find grounded context for this question in the current knowledge base. "
                "Please ingest data for this genre first."
            ),
            "confidence_score": 0.0,
            "citations": [],
        }

    context, citations = _build_context_chunks(docs)
    generation_provider = os.getenv("GENERATION_PROVIDER", "auto").strip().lower()

    prompt = f"""
You are an expert quiz tutor.
Use ONLY the retrieved context to evaluate the student's answer.
If context is insufficient, clearly say so and lower confidence.

Question:
{question}

User Answer:
{user_answer}

Retrieved Context:
{context}

Return ONLY valid JSON with this exact schema:
{{
  "is_correct": boolean,
  "explanation": string,
  "confidence_score": number
}}

Rules:
- confidence_score must be between 0.0 and 1.0
- explanation must be grounded in retrieved context only
- do not include markdown
""".strip()

    try:
        if generation_provider == "local":
            raise RuntimeError("GENERATION_PROVIDER=local, skipping live generation.")

        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY unavailable for live generation.")

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.2,
        )
        llm_response = llm.invoke(prompt)
        llm_content = llm_response.content if hasattr(llm_response, "content") else str(llm_response)
        parsed = _safe_parse_json(llm_content)

        return {
            "is_correct": bool(parsed.get("is_correct", False)),
            "explanation": str(parsed.get("explanation", "No explanation generated.")),
            "confidence_score": _clamp_confidence(parsed.get("confidence_score", 0.5)),
            "citations": citations,
        }
    except Exception as exc:  # noqa: BLE001
        # Offline-safe fallback when generation API is temporarily unreachable.
        top_meta = docs[0].metadata or {}
        expected = str(top_meta.get("correct_answer", "")).strip().lower()
        normalized_user = user_answer.strip().lower()
        is_correct = expected != "" and normalized_user == expected
        explanation = (
            "Live model generation is temporarily unavailable, so this fallback uses retrieved context only. "
            f"Expected answer from top retrieved record: '{top_meta.get('correct_answer', 'unknown')}'. "
            f"Context summary: {top_meta.get('explanation_context', 'No context available.')}"
        )
        print(f"[retriever] Gemini generation unavailable, fallback used: {exc}")
        return {
            "is_correct": is_correct,
            "explanation": explanation,
            "confidence_score": 0.45,
            "citations": citations,
        }


def generate_followup_response(
    followup_query: str,
    question: str,
    genre: str,
    grounded_explanation: str,
    persist_dir: Path = DEFAULT_PERSIST_DIR,
) -> dict[str, Any]:
    if not followup_query.strip():
        raise ValueError("Follow-up query is required.")
    if not question.strip():
        raise ValueError("Question text is required.")
    if not genre.strip():
        raise ValueError("Genre is required.")

    embeddings = get_embedding_function()
    collection_name = _normalize_collection_name(genre)
    vectorstore = Chroma(
        collection_name=collection_name,
        persist_directory=str(persist_dir),
        embedding_function=embeddings,
    )

    retrieval_query = f"{question}\n{followup_query}"
    docs = vectorstore.similarity_search(retrieval_query, k=2)
    context, citations = _build_context_chunks(docs)

    api_key = _optional_api_key()
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is required for follow-up generation.")

    prompt = f"""
You are a helpful quiz tutor.
Answer the user's follow-up question clearly using the provided grounded explanation and retrieved context.
If context is missing, state that briefly and still answer conservatively.

Original Question:
{question}

Grounded Explanation:
{grounded_explanation}

User Follow-up:
{followup_query}

Retrieved Context:
{context}

Response rules:
- Keep answer concise and useful (4-8 sentences).
- Stay factual and avoid speculation.
- Do not use markdown headings.
""".strip()

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=api_key,
        temperature=0.3,
    )
    llm_response = llm.invoke(prompt)
    answer = llm_response.content if hasattr(llm_response, "content") else str(llm_response)

    return {
        "answer": str(answer).strip(),
        "citations": citations,
    }
