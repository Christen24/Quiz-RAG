import {
  BookOpen,
  BrainCircuit,
  Cpu,
  FlaskConical,
  Globe2,
  Landmark,
  Map,
  Rocket,
  Sparkles,
} from "lucide-react";

export const genres = [
  {
    id: "ai_systems",
    name: "AI Systems",
    icon: Cpu,
    difficulty: "Adaptive",
    coverage: "120 Documents",
    description: "Core AI ideas, model behavior, and practical system design insights.",
    accent: "from-indigo-400/60 to-cyan-400/50",
  },
  {
    id: "world_history",
    name: "World History",
    icon: Landmark,
    difficulty: "Intermediate",
    coverage: "110 Documents",
    description: "Civilizations, revolutions, and turning points with strong Indian history alignment.",
    accent: "from-amber-400/50 to-cyan-400/40",
  },
  {
    id: "indian_literature",
    name: "Indian Literature",
    icon: BookOpen,
    difficulty: "Foundational",
    coverage: "98 Documents",
    description: "Classical to modern works, themes, and major literary voices.",
    accent: "from-rose-400/50 to-indigo-400/40",
  },
  {
    id: "space_cosmology",
    name: "Space & Cosmology",
    icon: Rocket,
    difficulty: "Advanced",
    coverage: "104 Documents",
    description: "Planets, stars, cosmic evolution, and modern space exploration.",
    accent: "from-sky-400/50 to-indigo-400/50",
  },
  {
    id: "general_science",
    name: "General Science",
    icon: FlaskConical,
    difficulty: "Adaptive",
    coverage: "130 Documents",
    description: "Physics, chemistry, biology, and everyday scientific reasoning.",
    accent: "from-emerald-400/50 to-cyan-400/40",
  },
  {
    id: "geography",
    name: "Geography",
    icon: Map,
    difficulty: "Intermediate",
    coverage: "102 Documents",
    description: "Landforms, climate zones, and human-environment relationships.",
    accent: "from-cyan-400/50 to-emerald-400/40",
  },
];

export const platformStats = [
  { label: "Knowledge Nodes", value: "613+", icon: Globe2 },
  { label: "Live Retrieval", value: "RAG + Local", icon: Sparkles },
  { label: "Grounded Answers", value: "Evidence-First", icon: BrainCircuit },
];
