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
  paradigm: string;
  difficulty: "easy" | "med" | "hard";
  platform: string;
  timeAgo: string;
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
    { name: "Heaps & Sliding Window", count: "50+" },
    { name: "Divide & Conquer", count: "30+" },
    { name: "Bit Manipulation", count: "35+" },
  ] as DsaParadigmItem[],

  // Block D: Recent Submissions (Ledger)
  submissions: [
    {
      id: "min-interval",
      problem: "Minimum Interval to Include Each Query",
      paradigm: "Heaps & Sliding Window",
      difficulty: "hard",
      platform: "LeetCode",
      timeAgo: "16h ago",
      timestamp: "2026-10-13T19:30:00Z",
      url: "https://leetcode.com/problems/minimum-interval-to-include-each-query/",
    },
    {
      id: "reverse-pairs",
      problem: "Reverse Pairs",
      paradigm: "Divide & Conquer",
      difficulty: "hard",
      platform: "LeetCode",
      timeAgo: "19h ago",
      timestamp: "2026-10-13T16:30:00Z",
      url: "https://leetcode.com/problems/reverse-pairs/",
    },
    {
      id: "dijkstra",
      problem: "Dijkstra's Shortest Path",
      paradigm: "Graphs & Trees",
      difficulty: "med",
      platform: "GFG",
      timeAgo: "1d ago",
      timestamp: "2026-10-12T10:30:00Z",
      url: "https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/",
    },
    {
      id: "max-product",
      problem: "Maximum Product Subarray",
      paradigm: "Dynamic Programming",
      difficulty: "med",
      platform: "LeetCode",
      timeAgo: "2d ago",
      timestamp: "2026-10-11T13:30:00Z",
      url: "https://leetcode.com/problems/maximum-product-subarray/",
    },
    {
      id: "subarray-sum",
      problem: "Subarray Sum Equals K",
      paradigm: "Heaps & Sliding Window",
      difficulty: "med",
      platform: "CodeChef",
      timeAgo: "3d ago",
      timestamp: "2026-10-10T13:30:00Z",
      url: "https://leetcode.com/problems/subarray-sum-equals-k/",
    },
  ] as DsaSubmissionItem[],
};

// Helper: format ISO timestamp into relative time string
export function formatRelativeTime(isoString: string, nowMs?: number | null): string {
  if (!nowMs) {
    return "recent";
  }
  const diffMs = nowMs - new Date(isoString).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay >= 1) return `${diffDay}d ago`;
  if (diffHour >= 1) return `${diffHour}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return "just now";
}
