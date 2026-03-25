from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data_pipeline.retriever import generate_followup_response, get_quiz_explanation


class ExplainRequest(BaseModel):
    question_id: str = Field(min_length=1)
    question_text: str = Field(min_length=1)
    user_answer: str = Field(min_length=1)
    genre: str = Field(min_length=1)


class Citation(BaseModel):
    source: str
    page: str
    snippet: str


class ExplainResponse(BaseModel):
    is_correct: bool
    explanation: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    citations: list[Citation]


class FollowupRequest(BaseModel):
    genre: str = Field(min_length=1)
    question_text: str = Field(min_length=1)
    grounded_explanation: str = Field(min_length=1)
    followup_query: str = Field(min_length=1)


class FollowupResponse(BaseModel):
    answer: str
    citations: list[Citation]


class QuestionItem(BaseModel):
    id: str
    genre: str
    prompt: str
    options: list[str]
    answer: str
    explanation: str
    confidence: int = Field(ge=0, le=100)
    citations: list[Citation]


app = FastAPI(title="RAG Quiz Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@lru_cache(maxsize=1)
def _load_dataset() -> list[dict]:
    dataset_path = Path(__file__).resolve().parent.parent / "dataset.json"
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {dataset_path}")
    with dataset_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("dataset.json must be an array.")
    return data


@app.get("/api/questions", response_model=list[QuestionItem])
def get_questions(genre: str) -> list[QuestionItem]:
    try:
        normalized_genre = genre.strip()
        if not normalized_genre:
            raise ValueError("Genre query parameter is required.")

        rows = [row for row in _load_dataset() if str(row.get("genre", "")).strip() == normalized_genre]
        if not rows:
            raise ValueError(f"No questions found for genre '{normalized_genre}'.")

        mapped: list[QuestionItem] = []
        for row in rows:
            source = str(row.get("source", "dataset.json"))
            page = str(row.get("page", "N/A"))
            mapped.append(
                QuestionItem(
                    id=str(row.get("id", "")),
                    genre=normalized_genre,
                    prompt=str(row.get("question", "")),
                    options=[str(option) for option in row.get("options", [])],
                    answer=str(row.get("correct_answer", "")),
                    explanation=str(row.get("explanation_context", "")),
                    confidence=84,
                    citations=[
                        Citation(
                            source=source,
                            page=page,
                            snippet=str(row.get("explanation_context", ""))[:320],
                        )
                    ],
                )
            )

        return mapped
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal server error: {exc}") from exc


@app.post("/api/explain", response_model=ExplainResponse)
def explain_answer(payload: ExplainRequest) -> ExplainResponse:
    try:
        result = get_quiz_explanation(
            question=payload.question_text,
            user_answer=payload.user_answer,
            genre=payload.genre,
            persist_dir=Path("chroma_db"),
        )
        return ExplainResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal server error: {exc}") from exc


@app.post("/api/followup", response_model=FollowupResponse)
def followup_answer(payload: FollowupRequest) -> FollowupResponse:
    try:
        result = generate_followup_response(
            followup_query=payload.followup_query,
            question=payload.question_text,
            genre=payload.genre,
            grounded_explanation=payload.grounded_explanation,
            persist_dir=Path("chroma_db"),
        )
        return FollowupResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal server error: {exc}") from exc
