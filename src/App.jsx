import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenText,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Layers3,
  LibraryBig,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { genres } from "./data";
import { useQuiz } from "./useQuiz";

const shellMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function GenreCard({ genre, active, onClick }) {
  const Icon = genre.icon;

  return (
    <motion.button
      whileHover={{ rotateX: -6, rotateY: 6, y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition ${
        active
          ? "border-indigo-400/60 bg-white/12 shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_18px_50px_rgba(6,182,212,0.12)]"
          : "border-white/10 bg-white/[0.06] hover:border-cyan-400/40"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${genre.accent} opacity-20 blur-2xl`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-indigo-300">
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
          {genre.coverage}
        </span>
      </div>
      <div className="relative mt-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{genre.name}</h3>
          <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-slate-200">
            {genre.difficulty}
          </span>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-300">{genre.description}</p>
      </div>
    </motion.button>
  );
}

function ShimmerInsight() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded-full bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/8" />
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-20 rounded-2xl bg-white/8" />
          <div className="h-20 rounded-2xl bg-white/8" />
        </div>
      </div>
    </div>
  );
}

function InsightPanel({ insight, loading }) {
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
              <p className="mt-3 text-sm leading-7 text-slate-200">{insight?.groundedExplanation}</p>
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
                    key={`${citation.title}-${citation.page}`}
                    className="rounded-[22px] border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{citation.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{citation.source}</p>
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
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[22rem] w-[22rem] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute left-0 top-1/3 h-[18rem] w-[18rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
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
                <LibraryBig className="h-4 w-4" />
                RAG-Powered Intelligent Quiz Platform
              </div>
              <h1 className="mt-5 font-['Geist'] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Start with the domain. Let the quiz adapt around it.
              </h1>
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
                <p className="mt-3 text-2xl font-semibold text-white">{activeGenre?.name}</p>
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
          className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Domain Selection Hub</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Choose the knowledge domain first</h2>
            </div>
            <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:block">
              Domain choice drives the quiz experience
            </div>
          </div>

          <div className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Each domain changes the question set, grounding sources, and explanation context. This is the primary control surface of the product.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <h2 className="mt-2 text-2xl font-semibold text-white">{activeGenre?.name}</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Question {quiz.currentIndex + 1} of {quiz.totalQuestions}
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
                          className={`flex cursor-pointer items-start gap-4 rounded-[24px] border p-4 transition ${
                            isCorrect
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
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${
                              isCorrect
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
            <InsightPanel insight={quiz.insight} loading={quiz.isRagLoading} />

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
