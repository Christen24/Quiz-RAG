import {
  Atom,
  BrainCircuit,
  Cpu,
  BookOpen,
  Briefcase,
  FlaskConical,
  Globe2,
  Landmark,
  Map,
  Microscope,
  Rocket,
  ScrollText,
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
    description: "Civilizations, revolutions, and turning points that shaped societies.",
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

export const quizBank = {
  science: [
    {
      id: "s1",
      prompt: "Which principle explains why observing a quantum system can alter its measured state?",
      options: [
        "The uncertainty principle",
        "Observer effect",
        "Wave superposition",
        "Quantum tunneling",
      ],
      answer: "Observer effect",
      explanation:
        "The observer effect captures how measurement interactions can disturb the system being measured. In practical quantum experiments, the act of measuring introduces a physical interaction that changes the state.",
      confidence: 88,
      citations: [
        { title: "Quantum Measurement Notes", page: "p. 14", source: "Lab Handbook" },
        { title: "Foundations of Quantum Theory", page: "p. 211", source: "Course Reader" },
      ],
      responseBenchmark: 14,
    },
    {
      id: "s2",
      prompt: "What best describes superposition in a qubit before measurement?",
      options: [
        "It holds exactly two classical values at once",
        "It exists in a combination of basis states",
        "It randomly switches between 0 and 1",
        "It permanently encodes uncertainty",
      ],
      answer: "It exists in a combination of basis states",
      explanation:
        "A qubit can exist as a linear combination of basis states until measurement collapses it into an observed value.",
      confidence: 92,
      citations: [
        { title: "Qubit State Primer", page: "p. 6", source: "Reference Deck" },
        { title: "Computing with Qubits", page: "p. 37", source: "Research Notes" },
      ],
      responseBenchmark: 18,
    },
    {
      id: "s3",
      prompt: "Which experimental setup is most associated with demonstrating wave-particle duality?",
      options: [
        "Double-slit experiment",
        "Michelson interferometer",
        "Photoelectric chamber",
        "Cloud chamber",
      ],
      answer: "Double-slit experiment",
      explanation:
        "The double-slit experiment demonstrates interference patterns while still producing particle-like detections, highlighting wave-particle duality.",
      confidence: 95,
      citations: [
        { title: "Wave-Particle Duality", page: "p. 22", source: "Physics Archive" },
        { title: "Foundational Experiments", page: "p. 9", source: "Experiment Index" },
      ],
      responseBenchmark: 12,
    },
  ],
  history: [
    {
      id: "h1",
      prompt: "Which factor most directly accelerated the spread of Renaissance ideas across Europe?",
      options: [
        "Expansion of maritime empires",
        "Invention of the printing press",
        "The fall of Constantinople alone",
        "Widespread industrialization",
      ],
      answer: "Invention of the printing press",
      explanation:
        "Printing dramatically reduced the friction of copying and distributing texts, allowing humanist ideas to circulate faster and farther.",
      confidence: 85,
      citations: [
        { title: "Renaissance Networks", page: "p. 31", source: "History Compendium" },
        { title: "Print and Power", page: "p. 78", source: "Archive Essay" },
      ],
      responseBenchmark: 16,
    },
    {
      id: "h2",
      prompt: "The Silk Road is best understood as:",
      options: [
        "A single road connecting China to Rome",
        "A sea route controlled entirely by one empire",
        "A network of trade routes linking regions across Eurasia",
        "A medieval banking treaty",
      ],
      answer: "A network of trade routes linking regions across Eurasia",
      explanation:
        "The Silk Road refers to overlapping land and maritime trade connections enabling exchange of goods, ideas, and technologies.",
      confidence: 91,
      citations: [
        { title: "Trade Networks in Eurasia", page: "p. 18", source: "Survey Reader" },
        { title: "Silk Road Exchanges", page: "p. 44", source: "Document Set" },
      ],
      responseBenchmark: 15,
    },
    {
      id: "h3",
      prompt: "Which document begins with the phrase 'We the People'?",
      options: [
        "The Magna Carta",
        "The United States Constitution",
        "The English Bill of Rights",
        "The Federalist Papers",
      ],
      answer: "The United States Constitution",
      explanation:
        "The preamble to the U.S. Constitution opens with 'We the People,' framing the legitimacy of the government in popular sovereignty.",
      confidence: 97,
      citations: [
        { title: "Constitutional Foundations", page: "p. 2", source: "Primary Source Pack" },
      ],
      responseBenchmark: 10,
    },
  ],
  technology: [
    {
      id: "t1",
      prompt: "In retrieval-augmented generation, retrieval primarily improves:",
      options: [
        "GPU utilization",
        "Response grounding in external knowledge",
        "Animation smoothness",
        "Input tokenization speed",
      ],
      answer: "Response grounding in external knowledge",
      explanation:
        "RAG improves answers by fetching relevant documents at query time, reducing hallucinations and grounding outputs in up-to-date sources.",
      confidence: 94,
      citations: [
        { title: "RAG Architecture Overview", page: "p. 4", source: "Systems Notes" },
        { title: "Grounded Generation", page: "p. 11", source: "AI Reference" },
      ],
      responseBenchmark: 13,
    },
    {
      id: "t2",
      prompt: "Embeddings are most useful for:",
      options: [
        "Compressing images losslessly",
        "Representing semantic similarity numerically",
        "Rendering 3D graphics",
        "Scheduling cron jobs",
      ],
      answer: "Representing semantic similarity numerically",
      explanation:
        "Embeddings map content into vectors so semantically related items cluster close together for search and retrieval.",
      confidence: 89,
      citations: [
        { title: "Vector Search Basics", page: "p. 12", source: "Infra Guide" },
        { title: "Semantic Retrieval", page: "p. 28", source: "ML Handbook" },
      ],
      responseBenchmark: 17,
    },
    {
      id: "t3",
      prompt: "Which UX pattern is best for showing why an AI answer can be trusted?",
      options: [
        "Hide confidence and citations to reduce clutter",
        "Add transparent citations and confidence indicators",
        "Only show a loading spinner",
        "Use stronger shadows on cards",
      ],
      answer: "Add transparent citations and confidence indicators",
      explanation:
        "Trust improves when systems expose grounding, evidence, and calibrated confidence rather than only presenting polished output.",
      confidence: 93,
      citations: [
        { title: "Explainable AI Interfaces", page: "p. 19", source: "Design Memo" },
      ],
      responseBenchmark: 11,
    },
  ],
};

export const analyticsData = {
  learningGaps: [
    { genre: "Science", score: 82 },
    { genre: "History", score: 67 },
    { genre: "AI", score: 91 },
    { genre: "Literature", score: 58 },
    { genre: "Business", score: 74 },
    { genre: "Space", score: 80 },
  ],
  cognitiveTimeline: [
    { step: "Q1", accuracy: 100, response: 11 },
    { step: "Q2", accuracy: 66, response: 18 },
    { step: "Q3", accuracy: 100, response: 9 },
    { step: "Q4", accuracy: 50, response: 23 },
    { step: "Q5", accuracy: 75, response: 14 },
  ],
  genreSpotlight: [
    { label: "Retention", value: "84%" },
    { label: "Avg. Confidence", value: "89" },
    { label: "Fastest Genre", value: "AI Systems" },
  ],
};

export const platformStats = [
  { label: "Knowledge Nodes", value: "1.3K", icon: Globe2 },
  { label: "Live Retrieval", value: "<420ms", icon: Sparkles },
  { label: "Grounded Answers", value: "97.4%", icon: BrainCircuit },
];
