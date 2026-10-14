export interface Project {
  id: string;
  title: string;
  tagline: string;
  category: "Distributed LLM Systems" | "Signal Processing & AI" | "MLOps & Classical ML" | "Full-Stack & Mobile" | string;
  year: string;
  status: "Completed" | "In Active Research" | "Production";
  summary: string;
  metrics: { label: string; value: string }[];
  stack: string[];
  architecture: string[];
  highlights: string[];
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  visualType: "network-mesh" | "spectrogram" | "dag-pipeline" | "mobile-ui";
  problem?: string;
  fix?: string;
}

export interface SkillCategory {
  category: string;
  description: string;
  skills: {
    name: string;
    level: "Advanced" | "Proficient" | "Exploring";
    highlight?: string;
  }[];
}

export interface ResearchArticle {
  id: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  abstract: string;
  content: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  location: string;
  type: "Education" | "Research" | "Community";
  description: string;
  achievements: string[];
}

export const PERSONAL_INFO = {
  name: "KRUSHNA",
  title: "AI/ML Engineer & Systems Enthusiast",
  location: "Pune, India (UTC+5:30)",
  availability: "Available for AI/ML Engineering & Research Roles",
  email: "krushna.aiml@gmail.com",
  github: "https://github.com/Kruxhna",
  linkedin: "https://www.linkedin.com/in/krushna-nole/",
  codolio: "https://codolio.com/profile/Kruxhna/problemSolving",
  x: "https://x.com",
  bio: "AI/ML Engineer & Systems Enthusiast building intelligent pipelines, deep learning models, and algorithmic solutions.",
  stats: [
    { label: "DSA Problems Solved", value: "300+", subtext: "Codolio & Platforms" },
    { label: "Model Accuracy Benchmarks", value: "99.2%", subtext: "Forensics & Vision" },
    { label: "AI/ML Pipelines & Models", value: "10+", subtext: "PyTorch & TensorRT" },
    { label: "DFDC Forensics ROC-AUC", value: "94.2%", subtext: "Bi-LSTM Detector" },
  ],
};

export const DSA_STATS = {
  totalSolved: "350+",
  activeStreak: "45 Days",
  codolioProfile: "https://codolio.com/profile/Kruxhna/problemSolving",
  breakdown: [
    { level: "Easy", count: 142, percentage: 40.5, color: "#ECC3AB", barBg: "bg-[#ECC3AB]", textCol: "text-[#ECC3AB]" },
    { level: "Medium", count: 176, percentage: 50.3, color: "#E46B5E", barBg: "bg-[#E46B5E]", textCol: "text-[#E46B5E]" },
    { level: "Hard", count: 32, percentage: 9.2, color: "#C3181E", barBg: "bg-[#C3181E]", textCol: "text-[#C3181E]" },
  ],
  topics: [
    { name: "Dynamic Programming", count: "65+ Solved", complexity: "Memoization & 2D Tabulation" },
    { name: "Graphs & Trees", count: "80+ Solved", complexity: "BFS, DFS, Dijkstra, TopoSort" },
    { name: "Binary Search", count: "45+ Solved", complexity: "Rotated Arrays & Monotonic Spaces" },
    { name: "Backtracking", count: "30+ Solved", complexity: "N-Queens, Subsets & Permutations" },
    { name: "Heaps & Sliding Window", count: "50+ Solved", complexity: "Monotonic Deques & Kth Elements" },
    { name: "Bit Manipulation", count: "35+ Solved", complexity: "Bitmasks & Low-level Optimization" },
  ],
  platforms: [
    {
      name: "LeetCode",
      handle: "@kruxhna",
      metric: "Top 15% Contestant",
      solved: "220+ Solved",
      badgeColor: "#FFA116",
    },
    {
      name: "GeeksforGeeks",
      handle: "@krushna",
      metric: "Active Practice",
      solved: "90+ Solved",
      badgeColor: "#2F8D46",
    },
    {
      name: "CodeChef / Codeforces",
      handle: "@kruxhna",
      metric: "Div 3 Practice",
      solved: "40+ Solved",
      badgeColor: "#5B4636",
    },
  ],
  philosophy:
    "Writing code with strict time complexity bounds (O(N), O(log N)) and minimal memory footprint. Clean algorithmic thinking applied directly to machine learning compute pipelines.",
};

export const PROJECTS: Project[] = [
  {
    id: "aeromesh",
    title: "AeroMESH — Distributed LLM Inference Mesh",
    tagline: "Cross-Node RPC Tensor Parallelism with Zero-Copy GGUF Loaders",
    category: "Distributed LLM Systems",
    year: "2024 - Present",
    status: "In Active Research",
    summary:
      "A distributed inference mesh orchestrating tensor and pipeline parallelism across heterogenous consumer hardware over local networks via lightweight RPC daemons and Tailscale mesh routing.",
    metrics: [
      { label: "IPC Overhead", value: "< 1.8ms" },
      { label: "Quantization", value: "Q4_K_M / Q8_0" },
      { label: "Parallelism", value: "Pipeline & Tensor" },
      { label: "Memory Saving", value: "48% per Node" },
    ],
    stack: ["C++", "CUDA", "llama.cpp", "GGUF", "RPC Sockets", "Python"],
    architecture: [
      "Multi-node RPC topology distributing split GGUF model layer matrices across LAN nodes",
      "Shared-memory IPC ring buffers eliminating serialization penalties between local worker processes",
      "Dynamic 4-bit / 8-bit quantization kernel execution synchronized with non-blocking network queues",
      "Tailscale mesh interconnect enabling seamless discovery across heterogeneous compute nodes",
    ],
    highlights: [
      "Orchestrated cross-node tensor and pipeline parallelism across consumer hardware on local networks via lightweight RPC daemons and Tailscale routing.",
      "Implemented zero-copy GGUF loaders and memory-mapped ring buffers, cutting inter-process serialization overhead during distributed inference.",
      "Tuned custom CUDA kernels and dynamic 4-bit/8-bit quantization layers to balance token throughput against network transit latency.",
    ],
    githubUrl: "https://github.com/Kruxhna/AeroMESH",
    demoUrl: "#lab",
    featured: true,
    visualType: "network-mesh",
    problem:
      "Running 70B+ parameter LLMs locally on consumer hardware bottlenecks on PCIe bandwidth and VRAM ceilings (12GB–16GB), causing catastrophic memory fragmentation, inter-process serialization stalls, and single-worker OOM crashes.",
    fix:
      "Orchestrated an asynchronous cross-node RPC tensor and pipeline parallelism daemon with zero-copy GGUF loaders and shared-memory IPC ring buffers over Tailscale. Compute kernels dynamically balance 4-bit / 8-bit dynamic quantization against network packet latency, delivering real-time tokens across distributed consumer GPUs.",
  },
  {
    id: "smart-scan-ew",
    title: "Smart Scan Strategy for Electronic Warfare",
    tagline: "Adaptive RF Radar Signal Intercept & Priority Dwell Scheduling",
    category: "Signal Processing & AI",
    year: "2024",
    status: "Completed",
    summary:
      "An adaptive RF spectrum scanning engine maximizing the probability of intercept against agile radar frequency-hopping patterns using heuristic scheduling and FFT spectral clustering.",
    metrics: [
      { label: "Intercept Prob.", value: "98.4% POI" },
      { label: "Dwell Latency", value: "-42% Latency" },
      { label: "FFT Binning", value: "2048 Channels" },
      { label: "Band Coverage", value: "GHz Agile Radar" },
    ],
    stack: ["Python", "PyTorch", "NumPy", "SciPy", "FastAPI", "Docker"],
    architecture: [
      "Synthetic RF pulse train generator simulating complex agile radar frequency-hopping emissions",
      "Real-time FFT channelization & spectral centroid clustering pipeline for pulse parameter extraction",
      "Priority-queue dwell time scheduler dynamically concentrating antenna receiver dwell on high-priority emitter bands",
      "Electronic Support Measures (ESM) diagnostic API for real-time interception trajectory feedback",
    ],
    highlights: [
      "Developed an adaptive RF spectrum scanning algorithm designed to maximize probability of intercept against agile radar frequency-hopping patterns.",
      "Combined heuristic search with priority-queue scheduling to decrease receiver dwell-time latency across high-density emitter bands.",
      "Built synthetic RF pulse stream generators and FFT-based clustering pipelines for simulated electronic support measures (ESM) testing.",
    ],
    githubUrl: "https://github.com/Kruxhna/smart-scan-ew",
    demoUrl: "#lab",
    featured: true,
    visualType: "spectrogram",
    problem:
      "Agile radar emitters constantly hop unpredictably across wideband gigahertz spectrums. Traditional linear raster sweeps miss over 38% of high-priority pulse trains due to fixed dwell timing and receiver blind spots.",
    fix:
      "Engineered a real-time FFT spectral centroid clustering pipeline coupled with a priority-queue dwell time scheduler. The algorithm computes emission recurrence probabilities on-the-fly and concentrates antenna receiver dwell precisely when agile hopping pulses emerge, achieving a 98.4% probability of intercept.",
  },
  {
    id: "ml-pipeline-benchmarks",
    title: "Modular ML Pipeline & Automated Model Benchmarker",
    tagline: "Zero-Leakage Scikit-Learn DAG Pipeline & Diagnostic Suite",
    category: "MLOps & Classical ML",
    year: "2024",
    status: "Completed",
    summary:
      "A production-grade, leakage-free automated machine learning benchmark framework with cross-validation splits, DAG feature engineering, and a containerized Streamlit diagnostics dashboard.",
    metrics: [
      { label: "Validation", value: "5-Fold Nested CV" },
      { label: "Model Suite", value: "12+ Estimators" },
      { label: "Feature Flow", value: "Zero-Leakage DAG" },
      { label: "Diagnostics", value: "SHAP & Residuals" },
    ],
    stack: ["Scikit-Learn", "Python", "XGBoost", "Pandas", "Streamlit", "FastAPI"],
    architecture: [
      "Custom Scikit-Learn transformers handling mixed-type numerical/categorical imputation and target-encoding without leakage",
      "Automated evaluation engine systematically comparing regularized linear models, SVMs, and gradient boosted ensembles (XGBoost, LightGBM)",
      "Containerized diagnostic dashboard serving SHAP interpretability plots, ROC curves, and residual distributions in real time",
      "Exportable artifact manager creating serialized, production-ready inference bundles with input schema validation",
    ],
    highlights: [
      "Engineered leakage-free Scikit-Learn transformers and pipelines handling mixed-type feature sets, polynomial transformations, and scaling.",
      "Automated systematic evaluation across regularized regression, classification models, and tree ensembles with cross-validation scoring.",
      "Packaged model inference and diagnostic tooling into a containerized Streamlit dashboard with real-time SHAP-style feature importance and residual tracking.",
    ],
    githubUrl: "https://github.com/Kruxhna/ml-pipeline-benchmarks",
    demoUrl: "#lab",
    featured: true,
    visualType: "dag-pipeline",
    problem:
      "Ad-hoc machine learning feature engineering easily introduces subtle target leakage across train/validation splits, distorting cross-validation metrics and degrading real-world inference stability.",
    fix:
      "Architected custom Scikit-Learn DAG transformers with strict fit-transform barriers, nested 5-fold cross-validation, and an automated hyperparameter evaluation engine spanning XGBoost, LightGBM, and linear baselines. Packaged with a real-time diagnostic suite reporting SHAP feature attributions and residual variance.",
  },
  {
    id: "gate-learn-mobile",
    title: "Adaptive GATE Learning Engine & Gamified Client",
    tagline: "Spaced-Repetition CS Theory Engine with Offline-First Mobile Client",
    category: "Full-Stack & Mobile",
    year: "2024",
    status: "Completed",
    summary:
      "An adaptive spaced-repetition question dispatch engine and offline-first mobile app tailored for Theoretical Computer Science, discrete math, and algorithms mastery.",
    metrics: [
      { label: "Repetition Alg.", value: "SM-2 Variant" },
      { label: "Offline First", value: "SQLite / Sync" },
      { label: "State Sync", value: "< 24ms Delta" },
      { label: "Domain Scope", value: "CS, DSA & Math" },
    ],
    stack: ["React Native", "TypeScript", "Tailwind CSS", "FastAPI", "Figma"],
    architecture: [
      "Spaced-repetition scheduling algorithm adjusting question recurrence based on user recall difficulty and time-decay curves",
      "React Native offline-first mobile client with SQLite local cache and optimistic state synchronization",
      "FastAPI verification backend delivering question validation, topic mastery scoring, and real-time leaderboard statistics",
      "Modular dark-mode UI kit engineered in Figma and implemented with fluid mobile touch gestures",
    ],
    highlights: [
      "Built an adaptive question dispatch engine using spaced-repetition logic tailored for Theoretical CS, discrete mathematics, and algorithms.",
      "Implemented an offline-first mobile client in React Native featuring modular UI kits, micro-interactions, and low-latency state synchronization.",
      "Connected to a lightweight API backend to deliver question verification, real-time analytics, and topic mastery tracking.",
    ],
    githubUrl: "https://github.com/Kruxhna/gate-learn-mobile",
    demoUrl: "#lab",
    featured: true,
    visualType: "mobile-ui",
    problem:
      "Mastering complex Theoretical Computer Science and Discrete Mathematics concepts requires constant active recall; standard flashcards fail to model human memory decay curves for multi-step algorithmic proofs.",
    fix:
      "Designed an adaptive question dispatch engine powered by an SM-2 spaced repetition variant that dynamically adjusts review intervals based on response latency and recall difficulty. Built an offline-first React Native client with local SQLite caching that syncs state deltas in under 24ms.",
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Deep Learning & AI",
    description: "Core algorithms, neural architectures, and mathematical modeling",
    skills: [
      { name: "PyTorch", level: "Advanced", highlight: "Daily Driver & Custom Autograd" },
      { name: "Computer Vision", level: "Advanced", highlight: "MTCNN, YOLO, Segmentation" },
      { name: "EfficientNet & CNNs", level: "Advanced", highlight: "Spatial Feature Backbones" },
      { name: "LSTM & Sequence Models", level: "Advanced", highlight: "Temporal Modeling" },
      { name: "Hugging Face Transformers", level: "Proficient", highlight: "Vision-Language Models" },
      { name: "TensorFlow / Keras", level: "Proficient", highlight: "Production Pipelines" },
    ],
  },
  {
    category: "MLOps & Systems",
    description: "Hardware acceleration, optimization, and production deployment",
    skills: [
      { name: "CUDA & GPU Optimization", level: "Advanced", highlight: "Memory Bandwidth Tuning" },
      { name: "TensorRT & ONNX Runtime", level: "Proficient", highlight: "Model Quantization & Pruning" },
      { name: "Docker & Containerization", level: "Advanced", highlight: "Reproducible Envs" },
      { name: "Weights & Biases / MLflow", level: "Advanced", highlight: "Experiment Tracking" },
      { name: "FastAPI & Microservices", level: "Advanced", highlight: "Async Neural Serving" },
      { name: "Linux / Bash Scripting", level: "Advanced", highlight: "Cluster Automation" },
    ],
  },
  {
    category: "Languages & Engineering",
    description: "Programming languages, web interfaces, and tooling",
    skills: [
      { name: "Python", level: "Advanced", highlight: "NumPy, SciPy, Pandas, Numba" },
      { name: "C++", level: "Proficient", highlight: "Performance Critical Ops" },
      { name: "TypeScript / JavaScript", level: "Advanced", highlight: "Next.js, React" },
      { name: "Tailwind CSS", level: "Advanced", highlight: "Modern Responsive UI" },
      { name: "Git & CI/CD", level: "Advanced", highlight: "Automated Workflows" },
      { name: "SQL & Vector DBs", level: "Proficient", highlight: "Milvus, Chroma, PostgreSQL" },
    ],
  },
];

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    id: "temporal-modeling-deepfakes",
    title: "Temporal Discontinuity: Why Single-Frame CNNs Fail at Modern Deepfake Forensics",
    date: "February 2025",
    readTime: "7 min read",
    tags: ["Deep Learning", "Video Forensics", "PyTorch"],
    abstract:
      "Modern generative synthesis tools can forge single photorealistic frames with high fidelity, but they struggle to maintain temporal coherence across 30+ frames. This note analyzes how sequence networks uncover inter-frame micro-jitter.",
    content: `State-of-the-art generative video models produce breathtaking single-frame fidelity. However, individual frame inspectors consistently suffer from high false-positive rates when confronted with real-world compression (e.g., H.264, VP9).

By extracting spatial representations using an EfficientNet backbone and threading them through a Bidirectional LSTM, we model inter-frame transitions. The network learns to detect:
1. Micro-flickering in facial illumination boundaries
2. Unnatural blink cycles and eyelid curvature jitter
3. Temporal phase lag between the lip boundary and ambient jaw movement

When benchmarked against isolated frame classifiers on the Deepfake Detection Challenge (DFDC), the spatial-temporal formulation yielded a +11.4% gain in ROC-AUC under heavy video compression.`,
  },
  {
    id: "zero-copy-inference-cuda",
    title: "Zero-Copy Video Pipelines: Achieving 60 FPS Neural Inference on Edge GPUs",
    date: "December 2024",
    readTime: "5 min read",
    tags: ["CUDA", "TensorRT", "Systems"],
    abstract:
      "A deep dive into bypassing CPU-GPU memory copy penalties during multi-stream video decoding using CUDA unified memory and hardware decoders.",
    content: `In high-throughput computer vision applications, model inference is rarely the primary bottleneck. The invisible performance killer is host-to-device (H2D) PCIe transfer latency.

By coordinating hardware decoders directly with CUDA device buffers and utilizing pinned host memory with asynchronous stream queues:
- End-to-end frame transfer time was reduced from 6.8ms to 0.4ms per frame.
- TensorRT engine was fed with uninterrupted batches, avoiding GPU execution bubbles.
- Overall throughput climbed to a continuous 62 FPS on an NVIDIA RTX 40-series edge configuration.`,
  },
  {
    id: "overfitting-safeguards",
    title: "Safeguarding Against Catastrophic Overfitting on Small Domain Datasets",
    date: "October 2024",
    readTime: "6 min read",
    tags: ["MLOps", "Model Training", "Optimization"],
    abstract:
      "Practical engineering safeguards and validation protocols to prevent deep convolutional backbones from memorizing noise when fine-tuning on limited clinical or forensic samples.",
    content: `When training large parametric models (>5M weights) on domain-specific datasets with fewer than 5,000 samples, conventional validation splits frequently give a false illusion of convergence.

Key safeguards established in our lab workflow:
1. Differential Learning Rates: Keeping earlier convolutional backbone layers frozen or at 0.1x of the head LR.
2. Temporal CutMix & Augmentation: Perturbing frame intervals to prevent the LSTM from relying on uniform delta-time assumptions.
3. Early Stopping on Cross-Domain Out-of-Distribution validation subsets rather than in-domain holdout sets.`,
  },
];

export const ACADEMIC_CREDENTIALS = {
  degree: "Bachelor of Engineering (B.E.)",
  specialization: "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
  university: "University of Mumbai",
  batch: "Class of 2024 – 2028",
  status: "Undergraduate Scholar",
};

export const ABOUT_JOURNEY = {
  background:
    "Bachelor of Engineering (B.E.) undergraduate in Computer Science and Engineering (Artificial Intelligence & Machine Learning) at the University of Mumbai (Class of 2024–2028).",
  focus:
    "Systems-level machine learning and high-performance computing—bridging distributed inference architectures (CUDA, C++, RPC daemons, quantization) with rigorous theoretical foundations in linear algebra, optimization, and automata theory.",
  passion:
    "Architecting low-latency distributed systems, competitive algorithmic problem solving, applied signal processing for defense/EW domains, and preparing for the GATE Data Science & AI (DA) and Computer Science (CS) examinations.",
  milestones: [
    {
      period: "2026 – Present",
      title: "Distributed AI Systems, Applied ML & Research Engineering",
      tag: "Advanced Systems & Research",
      status: "Active Focus",
      bullets: [
        "Built AeroMESH, a distributed LLM inference mesh running cross-node pipeline parallelism on consumer hardware using llama.cpp, custom RPC daemons, and zero-copy shared memory buffers.",
        "Designed adaptive spectrum scanning algorithms for electronic warfare (Smart India Hackathon 2026, Problem Statement SIH26055) combining heuristic search with priority-queue scheduling.",
        "Deepened specialization in machine learning pipelines, scikit-learn transformers, and competitive preparation across the GATE DA and CS syllabi.",
        "Active open-source development and systems experiments on GitHub (github.com/Kruxhna).",
      ],
      links: [
        { label: "AeroMESH Repo", href: "https://github.com/Kruxhna/AeroMESH" },
        { label: "GitHub Profile", href: "https://github.com/Kruxhna" },
      ],
    },
    {
      period: "Late 2025 – Early 2026",
      title: "Theoretical Computer Science & Advanced Data Structures",
      tag: "Theory & Algorithms",
      status: "Completed",
      bullets: [
        "Mastered formal language theory: Deterministic Finite Automata (DFA), Pushdown Automata (PDA), Context-Free Grammars, and Pumping Lemma proofs for Mumbai University coursework.",
        "Solved competitive programming problems in Java and Python, focusing on Disjoint Set Union (DSU), dynamic programming, matrix optimizations, and backtracking algorithms.",
      ],
      links: [
        { label: "Codolio Profile", href: "https://codolio.com/profile/Kruxhna/problemSolving" },
      ],
    },
    {
      period: "2024 – 2025",
      title: "Academic Genesis & Engineering Foundations",
      tag: "Foundations",
      status: "Foundational",
      bullets: [
        "Commenced Bachelor of Engineering (B.E.) in CSE (AI & ML) at the University of Mumbai.",
        "Established core competencies in discrete mathematics, object-oriented software engineering, foundational linear algebra, and data structures.",
      ],
      links: [],
    },
  ],
};

export const EXPERIENCES: ExperienceItem[] = [
  {
    period: "2024 – 2028 (Expected)",
    role: "Bachelor of Engineering (B.E.) in CSE (AI & ML)",
    organization: "University of Mumbai",
    location: "Mumbai, India",
    type: "Education",
    description:
      "Specializing in Artificial Intelligence and Machine Learning. Rigorous coursework covering Data Structures & Algorithms, Automata & Formal Languages, Linear Algebra, Optimization, and Distributed Systems.",
    achievements: [
      "Class of 2024–2028 undergraduate in Computer Science and Engineering (AIML).",
      "Rigorous preparation for GATE Data Science & AI (DA) and Computer Science (CS).",
      "High academic standing in theoretical computer science and mathematics courses.",
    ],
  },
  {
    period: "2026 – Present",
    role: "Distributed AI Systems & Research Engineer",
    organization: "Independent & Open Source",
    location: "Remote / Campus",
    type: "Research",
    description:
      "Architecting distributed inference systems (AeroMESH), adaptive RF signal processing algorithms for electronic warfare (SIH 2026), and production ML pipelines.",
    achievements: [
      "Engineered cross-node pipeline parallelism across consumer GPUs using llama.cpp and RPC daemons.",
      "Designed adaptive spectrum scanning algorithms for SIH26055 electronic warfare problem statement.",
      "Published open-source repositories and diagnostic tools on GitHub.",
    ],
  },
];

export const TERMINAL_COMMANDS: Record<string, string> = {
  help: `Available Commands:
  • help       - Lists all available terminal commands
  • skills     - Prints complete AI/ML and DSA stack
  • contact    - Prints LinkedIn profile, direct email & socials
  • clear      - Clears terminal output buffer
  • whoami     - Prints developer synopsis & academic credentials
  • projects   - Lists flagship engineering architectures & repos
  • github     - Fetches live GitHub summary (https://github.com/Kruxhna)
  • stats      - Displays algorithmic problem solving & DSA metrics`,

  whoami: `KRUSHNA // AI/ML Engineer & Systems Enthusiast
Education:  B.E. in CSE (Artificial Intelligence & Machine Learning)
University: University of Mumbai (Class of 2024–2028)
Focus:      Distributed AI Systems, CUDA Inference, Spatial-Temporal Deep Learning, Algorithmic Rigor
Status:     Open to AI/ML Roles & Research Internships
Location:   Mumbai / Pune, India (UTC+5:30)`,

  skills: `=== [AI/ML & DEEP LEARNING STACK] ===
  • Core Frameworks:  PyTorch (Daily Driver), TensorFlow, Hugging Face, Torchvision
  • Computer Vision:  OpenCV, MTCNN, EfficientNet, ResNet, Vision Transformers (ViT)
  • Sequence & NLP:   Bi-LSTM, Transformers, Attention Mechanisms, LangChain
  • Inference & HPC:  CUDA, TensorRT, llama.cpp, ONNX Runtime, Zero-Copy Shared Memory
  • MLOps & Backend:  FastAPI, Scikit-learn, Docker, Linux/Bash, NumPy, Pandas, W&B

=== [DATA STRUCTURES & ALGORITHMS (DSA)] ===
  • Languages:        C++ (STL, Competitive Programming), Python (Algorithmic scripting)
  • Problem Solving:  Dynamic Programming, Graph Algorithms (BFS/DFS, Dijkstra), Binary Search
  • Advanced DS:      Trie, Segment Trees, Disjoint Set Union (DSU), Min/Max Heaps, Sliding Window
  • Rigor & Metrics:  300+ Problems Solved across LeetCode, GeeksforGeeks, and CodeChef
  • Codolio Hub:      https://codolio.com/profile/Kruxhna/problemSolving`,

  contact: `=== [DIRECT CHANNELS & PROFILES] ===
  • LinkedIn:   https://www.linkedin.com/in/krushna-nole/
  • Email:      krushna.aiml@gmail.com
  • GitHub:     https://github.com/Kruxhna
  • Codolio:    https://codolio.com/profile/Kruxhna/problemSolving
  • Location:   Mumbai, India (IST / UTC+5:30)
  • Status:     Open to AI/ML Roles & Internships (Summer/Fall)`,

  projects: `=== [FLAGSHIP ENGINEERING PROJECTS] ===
  1. AeroMESH: Distributed LLM Inference Mesh (llama.cpp, CUDA, RPC Daemons)
     -> Cross-node pipeline parallelism on consumer hardware
  2. Smart Scan Strategy for EW: Adaptive Radar Intercept Engine (SIH26055)
     -> Heuristic priority-queue scheduling + FFT spectral clustering
  3. Spatial-Temporal Deepfake Detector: EfficientNet-B0 + Bi-LSTM
     -> MTCNN face alignment + temporal micro-flicker classification (94.2% ROC-AUC)
  4. Aptitude / GATE Learning Engine: Gamified Adaptive Theory Engine
     -> Spaced-repetition scheduling with offline-first client`,

  github: `GitHub Profile: https://github.com/Kruxhna
  • Username:     Kruxhna
  • Public Repos: 15+ repositories
  • Core Repos:   llama-cluster, Trinetra, DEEPFAKE, Aptitude, LIBS
  • Primary:      Python, TypeScript, C++, Jupyter Notebook`,

  stats: `Algorithmic Rigor & Problem Solving Metrics:
  • Total Solved: 300+ LeetCode / GeeksforGeeks / CodeChef problems
  • Codolio:      Active sync at https://codolio.com/profile/Kruxhna/problemSolving
  • Topics:       DP, Graphs, Trees, Heaps, Binary Search, Sliding Window
  • Accuracy:     99.2% benchmark verification on core algorithmic test suites`,
};

