import { useEffect, useMemo, useRef, useState } from "react";
import { genres, quizBank } from "./data";

const RAG_DELAY = 1800;

function buildInitialState(genreId = genres[0].id) {
  return {
    selectedGenre: genreId,
    questions: quizBank[genreId] ?? quizBank.science,
    currentIndex: 0,
    selectedOption: "",
    score: 0,
    answers: [],
    isRevealed: false,
    isRagLoading: false,
    quizComplete: false,
    insight: null,
  };
}

export function useQuiz() {
  const [state, setState] = useState(() => buildInitialState());
  const timeoutRef = useRef(null);

  const currentQuestion = state.questions[state.currentIndex];

  useEffect(() => {
    if (!state.isRagLoading) return undefined;

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setState((prev) => {
        const question = prev.questions[prev.currentIndex];
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
        setState(buildInitialState(genreId));
      },
      selectOption(option) {
        setState((prev) => ({ ...prev, selectedOption: option }));
      },
      submitAnswer() {
        setState((prev) => {
          if (prev.isRevealed || !prev.selectedOption) return prev;
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
        setState(buildInitialState(state.selectedGenre));
      },
    }),
    [state.selectedGenre],
  );

  return {
    ...state,
    currentQuestion,
    progress: ((state.currentIndex + 1) / state.questions.length) * 100,
    totalQuestions: state.questions.length,
    ...actions,
  };
}
