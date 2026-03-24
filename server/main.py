from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data_pipeline.retriever import get_quiz_explanation


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
