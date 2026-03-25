import { useEffect, useMemo, useRef, useState } from "react";
import { genres } from "./data";

const RAG_DELAY = 1800;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function shuffleQuestions(items) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function buildInitialState(genreId = "") {
  return {
    selectedGenre: genreId,
    questions: [],
    currentIndex: 0,
    selectedOption: "",
    score: 0,
    answers: [],
    isRevealed: false,
    isRagLoading: false,
    quizComplete: false,
    insight: null,
    isLoadingQuestions: true,
    questionLoadError: "",
  };
}

export function useQuiz() {
  const [state, setState] = useState(() => buildInitialState());
  const timeoutRef = useRef(null);

  const currentQuestion = state.questions[state.currentIndex] ?? null;

  useEffect(() => {
    let isCancelled = false;

    if (!state.selectedGenre) {
      setState((prev) => ({
        ...prev,
        isLoadingQuestions: false,
        questionLoadError: "",
        questions: [],
        currentIndex: 0,
        selectedOption: "",
        isRevealed: false,
        isRagLoading: false,
        quizComplete: false,
        insight: null,
      }));
      return () => {
        isCancelled = true;
      };
    }

    async function loadQuestions() {
      setState((prev) => ({
        ...prev,
        isLoadingQuestions: true,
        questionLoadError: "",
        questions: [],
        currentIndex: 0,
        selectedOption: "",
        isRevealed: false,
        isRagLoading: false,
        quizComplete: false,
        insight: null,
      }));

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/questions?genre=${encodeURIComponent(state.selectedGenre)}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to load questions (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No questions available for this genre.");
        }

        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            questions: shuffleQuestions(data),
            isLoadingQuestions: false,
            questionLoadError: "",
          }));
        }
      } catch (error) {
        if (!isCancelled) {
          setState((prev) => ({
            ...prev,
            questions: [],
            isLoadingQuestions: false,
            questionLoadError: error instanceof Error ? error.message : "Failed to load questions.",
          }));
        }
      }
    }

    loadQuestions();
    return () => {
      isCancelled = true;
    };
  }, [state.selectedGenre]);

  useEffect(() => {
    if (!state.isRagLoading || !currentQuestion) return undefined;

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setState((prev) => {
        const question = prev.questions[prev.currentIndex];
        if (!question) {
          return { ...prev, isRagLoading: false };
        }
        const isCorrect = prev.selectedOption === question.answer;

        return {
          ...prev,
          isRagLoading: false,
          score: isCorrect ? prev.score + 1 : prev.score,
          insight: {
            groundedExplanation: question.explanation,
            confidence: question.confidence,
            citations: question.citations,
            isCorrect,
          },
          answers: [
            ...prev.answers,
            {
              questionId: question.id,
              genre: prev.selectedGenre,
              selected: prev.selectedOption || "No answer",
              correct: question.answer,
              isCorrect,
            },
          ],
        };
      });
    }, RAG_DELAY);

    return () => window.clearTimeout(timeoutRef.current);
  }, [state.currentIndex, state.isRagLoading, state.selectedOption]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const actions = useMemo(
    () => ({
      selectGenre(genreId) {
        setState((prev) => ({
          ...prev,
          selectedGenre: genreId,
          score: 0,
          answers: [],
        }));
      },
      selectOption(option) {
        setState((prev) => ({ ...prev, selectedOption: option }));
      },
      submitAnswer() {
        setState((prev) => {
          if (prev.isRevealed || !prev.selectedOption || !prev.questions[prev.currentIndex]) return prev;
          return { ...prev, isRevealed: true, isRagLoading: true };
        });
      },
      nextQuestion() {
        setState((prev) => {
          const nextIndex = prev.currentIndex + 1;
          if (nextIndex >= prev.questions.length) {
            return { ...prev, quizComplete: true };
          }

          return {
            ...prev,
            currentIndex: nextIndex,
            selectedOption: "",
            isRevealed: false,
            isRagLoading: false,
            insight: null,
          };
        });
      },
      restart() {
        setState((prev) => ({
          ...prev,
          questions: shuffleQuestions(prev.questions),
          currentIndex: 0,
          selectedOption: "",
          score: 0,
          answers: [],
          isRevealed: false,
          isRagLoading: false,
          quizComplete: false,
          insight: null,
        }));
      },
    }),
    [state.selectedGenre],
  );

  return {
    ...state,
    currentQuestion,
    progress: state.questions.length ? ((state.currentIndex + 1) / state.questions.length) * 100 : 0,
    totalQuestions: state.questions.length,
    ...actions,
  };
}
