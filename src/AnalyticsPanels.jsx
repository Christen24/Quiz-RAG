import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyticsData } from "./data";

const shellMotion = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function SnapshotPanel() {
  return (
    <motion.section
      variants={shellMotion}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.12 }}
      className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Performance Snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Learning Gap radar</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-cyan-200">
          <LayoutDashboard className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={analyticsData.learningGaps}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="genre" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
            <Radar dataKey="score" stroke="#06b6d4" fill="#6366f1" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {analyticsData.genreSpotlight.map((item) => (
          <div key={item.label} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function TimelinePanel() {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Cognitive Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Speed vs accuracy</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-cyan-200">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData.cognitiveTimeline}>
            <defs>
              <linearGradient id="timelineGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="step" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
              }}
            />
            <Area yAxisId="right" type="monotone" dataKey="response" stroke="#06b6d4" fill="url(#timelineGradient)" strokeWidth={2} />
            <Bar yAxisId="left" dataKey="accuracy" fill="#6366f1" radius={[10, 10, 0, 0]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DashboardPanel() {
  return (
    <motion.section
      variants={shellMotion}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.26 }}
      className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl sm:p-6"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Performance Analytics Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Genre mastery breakdown</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          The dashboard combines learning gaps and timing telemetry so the experience feels more like a coaching surface than a static score report.
        </p>
      </div>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData.learningGaps}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="genre" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "18px",
              }}
            />
            <Bar dataKey="score" fill="#6366f1" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

function AnalyticsPanels({ variant }) {
  if (variant === "snapshot") return <SnapshotPanel />;
  if (variant === "timeline") return <TimelinePanel />;
  return <DashboardPanel />;
}

export default AnalyticsPanels;
