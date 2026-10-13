// TODO: Replace placeholder stats, handles, links, and submissions with verified production data

export interface DsaStatItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
}

export interface DsaPlatformItem {
  id: string;
  name: string;
  solved: string;
  metric: string;
  handle: string;
  url: string;
  isActive: boolean;
}

export interface DsaParadigmItem {
  name: string;
  count: string;
}

export interface DsaSubmissionItem {
  id: string;
  problem: string;
  difficulty: "easy" | "med" | "hard";
  platform: string;
  timestamp: string; // ISO 8601 timestamp
  url: string;
}

export const DSA_DATA = {
  // Identity Block
  eyebrow: "( 04 ) DSA & PROBLEM SOLVING",
  title: "algorithmic rigor",
  statement:
    "writing code with strict time complexity bounds (o(n), o(log n)) and minimal memory footprints, applied directly to systems and machine learning compute pipelines.",
  tagline: "o(n) space bounds · vectorized operations · cache locality",
  profileUrl: "https://codelio.com/profile/Kruxhna/problemSolving",
  profileLinkText: "codelio profile ↗",
  lastSyncedDate: "last synced oct 13, 2026",

  // Block A: Stats
  stats: [
    { id: "total", value: 350, suffix: "+", label: "problems solved" },
    { id: "streak", value: 45, suffix: "d", label: "streak" },
    { id: "easy", value: 142, label: "easy" },
    { id: "medium", value: 176, label: "medium" },
    { id: "hard", value: 32, label: "hard" },
  ] as DsaStatItem[],

  // Block B: Platforms
  platforms: [
    {
      id: "leetcode",
      name: "leetcode",
      solved: "220+ solved",
      metric: "top 15% contestant",
      handle: "@kruxhna",
      url: "https://leetcode.com/u/kruxhna/",
      isActive: true,
    },
    {
      id: "geeksforgeeks",
      name: "geeksforgeeks",
      solved: "90+ solved",
      metric: "active practice",
      handle: "@kruxhna",
      url: "https://auth.geeksforgeeks.org/user/kruxhna",
      isActive: true,
    },
    {
      id: "codechef",
      name: "codechef / codeforces",
      solved: "40+ solved",
      metric: "div 3 practice",
      handle: "@kruxhna",
      url: "https://www.codechef.com/users/kruxhna",
      isActive: false,
    },
  ] as DsaPlatformItem[],

  // Block C: Paradigms Mastered
  paradigms: [
    { name: "Dynamic Programming", count: "65+" },
    { name: "Graphs & Trees", count: "80+" },
    { name: "Binary Search", count: "45+" },
    { name: "Backtracking", count: "30+" },
    { name: "Heaps & Sliding Window", count: "50+" },
    { name: "Bit Manipulation", count: "35+" },
  ] as DsaParadigmItem[],

  // Block D: Recent Submissions (Ledger)
  submissions: [
    {
      id: "two-sum",
      problem: "Two Sum",
      difficulty: "easy",
      platform: "LeetCode",
      timestamp: "2026-10-13T13:30:00Z", // ~2h ago
      url: "https://leetcode.com/problems/two-sum/",
    },
    {
      id: "dijkstra",
      problem: "Dijkstra's Algorithm",
      difficulty: "med",
      platform: "GFG",
      timestamp: "2026-10-13T10:30:00Z", // ~5h ago
      url: "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/",
    },
    {
      id: "n-queens",
      problem: "N-Queens",
      difficulty: "hard",
      platform: "LeetCode",
      timestamp: "2026-10-12T13:30:00Z", // ~1d ago
      url: "https://leetcode.com/problems/n-queens/",
    },
    {
      id: "subarray-sum",
      problem: "Subarray Sum Equals K",
      difficulty: "med",
      platform: "CodeChef",
      timestamp: "2026-10-11T13:30:00Z", // ~2d ago
      url: "https://leetcode.com/problems/subarray-sum-equals-k/",
    },
  ] as DsaSubmissionItem[],
};

// Helper: format ISO timestamp into relative time string
export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay >= 1) return `${diffDay}d ago`;
  if (diffHour >= 1) return `${diffHour}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return "just now";
}
