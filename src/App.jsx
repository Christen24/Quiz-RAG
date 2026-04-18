import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  Brain,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Layers3,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { genres } from "./data";
import { useQuiz } from "./useQuiz";
import answerLogo from "../answer.svg";

const shellMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function GenreCard({ genre, active, onClick }) {
  const Icon = genre.icon;

  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex flex-col items-start rounded-3xl border p-6 text-left transition-all duration-500 min-h-[180px] ${active
          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
          : "border-white/10 bg-slate-900/40 backdrop-blur-xl hover:border-indigo-400/30 hover:bg-slate-800/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${genre.accent} opacity-5 blur-3xl`} />

      <div className="relative flex w-full items-start justify-between">
        <div className={`rounded-xl border p-2.5 transition-colors duration-500 ${active ? "border-indigo-400 bg-indigo-500 text-white" : "border-white/10 bg-white/5 text-slate-300"
          }`}>
          <Icon className="h-5 w-5" />
        </div>

        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${active ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100" : "border-white/10 bg-white/5 text-slate-400"
          }`}>
          {genre.difficulty}
        </span>
      </div>

      <div className="relative mt-auto space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">{genre.name}</h3>
        <p className="text-sm leading-relaxed text-slate-400 font-medium line-clamp-2">
          {genre.description}
        </p>
      </div>

      {active && (
        <motion.div
          layoutId="selection-glow"
          className="absolute -inset-1 rounded-[2.2rem] border-2 border-indigo-500/50 blur-[2px]"
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.button>
  );
}

function ShimmerInsight() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-indigo-500/30 bg-white/[0.02] p-5 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
      <div className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#818cf8_100%)] opacity-30" />
      <div className="absolute inset-[1px] rounded-[27px] bg-[#0a0a0b] bg-opacity-90" />
      <div className="relative z-10 space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/5" />
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-2xl bg-white/5" />
          <div className="h-20 rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function StreamingText({ content, speed = 15 }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    if (!content) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + content.charAt(i));
      i++;
      if (i >= content.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [content, speed]);

  return <span>{displayedText}</span>;
}

function InsightPanel({ insight, loading, questionText, genre }) {
  const [followupQuery, setFollowupQuery] = useState("");
  const [followupAnswer, setFollowupAnswer] = useState("");
  const [followupCitations, setFollowupCitations] = useState([]);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState("");

  useEffect(() => {
    setFollowupQuery("");
    setFollowupAnswer("");
    setFollowupCitations([]);
    setFollowupError("");
    setIsFollowupLoading(false);
  }, [insight?.groundedExplanation, questionText, genre]);

  async function askFollowup() {
    if (!followupQuery.trim() || !insight?.groundedExplanation || !questionText || !genre) return;

    setIsFollowupLoading(true);
    setFollowupError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre,
          question_text: questionText,
          grounded_explanation: insight.groundedExplanation,
          followup_query: followupQuery.trim(),
        }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.detail || `Follow-up request failed (${response.status})`);
      }
      const data = await response.json();
      setFollowupAnswer(data.answer || "");
      setFollowupCitations(Array.isArray(data.citations) ? data.citations : []);
      setFollowupQuery("");
    } catch (error) {
      setFollowupError(error instanceof Error ? error.message : "Failed to get follow-up response.");
    } finally {
      setIsFollowupLoading(false);
    }
  }

  if (!loading && !insight) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-indigo-200">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">AI Insight</p>
            <p className="text-xs text-slate-400">Retrieval evidence appears after you submit an answer</p>
          </div>
        </div>
        <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-slate-950/50 p-5">
          <p className="text-sm leading-7 text-slate-300">
            This drawer will show grounded explanations, confidence scoring, and mini citation cards tied to the current answer.
          </p>
        </div>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-indigo-200">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">AI Insight</p>
          <p className="text-xs text-slate-400">Grounded retrieval and reasoning summary</p>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <ShimmerInsight />
        ) : (
          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Grounded Explanation</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                <StreamingText content={insight?.groundedExplanation} />
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Ask a Follow-up</p>
                <p className="mt-2 text-sm text-slate-300">
                  Ask your own question about this explanation.
                </p>
                <textarea
                  value={followupQuery}
                  onChange={(event) => setFollowupQuery(event.target.value)}
                  placeholder="Example: Can you simplify this with a real-world analogy?"
                  className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-500/30 min-h-24"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{followupQuery.length} characters</span>
                  <button
                    onClick={askFollowup}
                    disabled={!followupQuery.trim() || isFollowupLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isFollowupLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Ask AI"}
                  </button>
                </div>

                {followupError && (
                  <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                    {followupError}
                  </p>
                )}

                {followupAnswer && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 max-h-64 overflow-y-auto">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Response</p>
                    <p className="mt-2 text-sm leading-7 text-slate-100">{followupAnswer}</p>
                    {followupCitations.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {followupCitations.map((citation) => (
                          <div
                            key={`${citation.source}-${citation.page}-${citation.snippet?.slice(0, 16)}`}
                            className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
                          >
                            <p className="text-xs font-medium text-cyan-100">{citation.source}</p>
                            <p className="mt-1 text-xs text-slate-300">{citation.snippet}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Confidence Score</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${insight?.confidence ?? 0}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Model certainty</span>
                  <span className="font-semibold text-white">{insight?.confidence}%</span>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 px-5 py-4 text-center">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Result</p>
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle2
                    className={`h-5 w-5 ${insight?.isCorrect ? "text-emerald-300" : "text-amber-300"}`}
                  />
                  <span className="text-sm font-medium text-white">
                    {insight?.isCorrect ? "Correctly grounded" : "Needs reinforcement"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Citations</p>
              <div className="mt-3 grid gap-3">
                {insight?.citations?.map((citation) => (
                  <div
                    key={`${citation.source}-${citation.page}`}
                    className="rounded-[22px] border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{citation.source}</p>
                        <p className="mt-1 text-sm text-slate-400">{citation.snippet}</p>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                        {citation.page}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.aside>
  );
}

function App() {
  const quiz = useQuiz();
  const activeGenre = genres.find((genre) => genre.id === quiz.selectedGenre);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, 30, -30, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/4 top-1/4 h-[35rem] w-[35rem] rounded-full bg-indigo-600/20 blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -40, 40, 0], y: [0, -40, 40, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-600/15 blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/3 bottom-1/3 h-[25rem] w-[25rem] rounded-full bg-fuchsia-600/15 blur-[140px]"
        />
      </div>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <motion.section
          variants={shellMotion}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-200">
                <img src={answerLogo} alt="Answer Logo" className="h-4 w-4 object-contain" />
                RAG-Powered Intelligent Quiz Platform
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="mt-5 font-['Geist'] text-4xl font-semibold tracking-tight text-white sm:text-5xl"
              >
                Start with the domain. Let the quiz adapt around it.
              </motion.h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                The experience is intentionally centered on knowledge-domain selection, then moves into a focused,
                retrieval-backed quiz flow with grounded explanations after each answer.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Active Domain</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {activeGenre?.name ?? "Select a Domain"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Quiz Flow</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-white">Interactive + grounded</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={shellMotion}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.08 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-400 font-bold">Selection Hub</p>
              <h2 className="mt-3 text-4xl font-bold text-white tracking-tight">Choose the knowledge domain first</h2>
              <p className="mt-3 text-slate-400 text-base max-w-xl">
                Select a domain to initialize the RAG knowledge loop. Your choice determines the grounding sources and AI explanation context.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-300">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              Context Aware
            </div>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                active={quiz.selectedGenre === genre.id}
                onClick={() => quiz.selectGenre(genre.id)}
              />
            ))}
          </div>
        </motion.section>

        <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
          <motion.section
            variants={shellMotion}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.18 }}
            className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6"
          >
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Active Quiz Interface</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {activeGenre?.name ?? "Choose a domain to begin"}
                  </h2>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>Quiz progress</span>
                  <span>{Math.round(quiz.progress)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/8">
                  <motion.div
                    animate={{ width: `${quiz.progress}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {quiz.isLoadingQuestions ? (
                  <motion.div
                    key="loading-questions"
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 w-32 rounded-full bg-white/10" />
                      <div className="h-8 w-2/3 rounded-full bg-white/10" />
                      <div className="h-16 rounded-2xl bg-white/8" />
                      <div className="h-16 rounded-2xl bg-white/8" />
                    </div>
                  </motion.div>
                ) : quiz.questionLoadError ? (
                  <motion.div
                    key="question-error"
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="rounded-[28px] border border-amber-400/30 bg-amber-400/10 p-5"
                  >
                    <p className="text-sm uppercase tracking-[0.25em] text-amber-200">Question Load Error</p>
                    <p className="mt-3 text-sm leading-7 text-amber-50">{quiz.questionLoadError}</p>
                  </motion.div>
                ) : quiz.currentQuestion ? (
                  <motion.div
                    key={quiz.currentQuestion.id}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Question</p>
                        <h3 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-white">
                          {quiz.currentQuestion.prompt}
                        </h3>
                      </div>
                      <div className="hidden rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3 text-indigo-200 sm:block">
                        <BookOpenText className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {quiz.currentQuestion.options.map((option, index) => {
                        const isSelected = quiz.selectedOption === option;
                        const isCorrect = quiz.insight && option === quiz.currentQuestion.answer;
                        const isIncorrectSelected =
                          quiz.insight && isSelected && option !== quiz.currentQuestion.answer;
                        const letter = String.fromCharCode(65 + index);

                        return (
                          <motion.label
                            key={option}
                            whileHover={quiz.insight ? undefined : { scale: 1.01, y: -2 }}
                            whileTap={quiz.insight ? undefined : { scale: 0.99 }}
                            className={`flex cursor-pointer items-start gap-4 rounded-[24px] border p-4 transition ${isCorrect
                              ? "border-emerald-400/40 bg-emerald-400/10"
                              : isIncorrectSelected
                                ? "border-amber-400/40 bg-amber-400/10"
                                : isSelected
                                  ? "border-indigo-400/50 bg-linear-to-r from-indigo-500/20 to-cyan-400/10 shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_18px_45px_rgba(99,102,241,0.12)]"
                                  : "border-white/10 bg-slate-950/50 hover:border-cyan-400/30 hover:bg-white/[0.06]"
                              }`}
                          >
                            <input
                              type="radio"
                              name={quiz.currentQuestion.id}
                              className="mt-1 h-5 w-5 accent-indigo-500"
                              checked={isSelected}
                              onChange={() => quiz.selectOption(option)}
                              disabled={quiz.isRagLoading || quiz.insight}
                            />
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${isCorrect
                                ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                                : isIncorrectSelected
                                  ? "border-amber-300/40 bg-amber-400/15 text-amber-100"
                                  : isSelected
                                    ? "border-indigo-300/40 bg-indigo-400/20 text-indigo-100"
                                    : "border-white/10 bg-white/5 text-slate-200"
                                }`}
                            >
                              {letter}
                            </div>
                            <span className="flex-1 text-base leading-7 text-slate-100">{option}</span>
                            {!quiz.insight && isSelected && (
                              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                                Selected
                              </span>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-400">
                        {quiz.insight
                          ? `Score: ${quiz.score} / ${quiz.totalQuestions}`
                          : "Select an answer to trigger retrieval-backed interpretation."}
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={quiz.submitAnswer}
                          disabled={!quiz.selectedOption || quiz.isRagLoading || !!quiz.insight}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {quiz.isRagLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleGauge className="h-4 w-4" />}
                          Analyze Answer
                        </button>
                        <button
                          onClick={quiz.insight ? quiz.nextQuestion : quiz.restart}
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
                        >
                          {quiz.insight ? "Next Question" : "Reset"}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-questions"
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <p className="text-sm leading-7 text-slate-300">
                      {quiz.selectedGenre
                        ? "No questions were loaded for this domain yet. Please run backend ingestion and retry."
                        : "Select your interested domain from above to load your quiz questions."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          <motion.div
            variants={shellMotion}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.22 }}
            className="space-y-6"
          >
            <InsightPanel
              insight={quiz.insight}
              loading={quiz.isRagLoading}
              questionText={quiz.currentQuestion?.prompt ?? ""}
              genre={quiz.selectedGenre}
            />

            {quiz.quizComplete && (
              <section className="rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5 backdrop-blur-2xl sm:p-6">
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-200">Session Complete</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">You completed the {quiz.selectedGenre} track.</h2>
                <p className="mt-3 max-w-lg text-sm leading-7 text-emerald-50/90">
                  Final score: {quiz.score} out of {quiz.totalQuestions}. Restart the track or switch genres to continue exploring new grounded question sets.
                </p>
              </section>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default App;
