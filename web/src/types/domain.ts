export type NavItem = {
  href: string;
  label: string;
};

export type NextMatch = {
  dateLabel: string;
  timeLabel: string;
  venue: string;
  format: string;
  targetPlayers: number;
  fallbackPlayers: number;
  status: string;
  confirmed: number;
  substitutes: number;
  missing: number;
};

export type AttendanceEntry = {
  name: string;
  status: string;
  detail: string;
};

export type AvailabilityOption = {
  label: string;
  value: "going" | "backup" | "not_going";
  tone: "lime" | "sand" | "accent";
  description: string;
};

export type Team = {
  name: string;
  color: string;
  score: number;
  players: string[];
};

export type Scorer = {
  name: string;
  goals: number;
  team: string;
};

export type HistoryMatch = {
  date: string;
  result: string;
  attendance: string;
  notes: string;
};

export type LeaderboardEntry = {
  name: string;
  presences: number;
  goals: number;
  diff: string;
};

export type AdminAction = string;

export type ClusterPlayer = {
  id: string;
  name: string;
  role: string;
  status: string;
};

export type AvailabilityPageData = {
  attendanceBoard: AttendanceEntry[];
  availabilityOptions: AvailabilityOption[];
  currentMode: "demo" | "supabase";
  matchId: string;
  players: ClusterPlayer[];
};

export type DashboardData = {
  nextMatch: NextMatch;
  attendanceBoard: AttendanceEntry[];
  leaderboard: LeaderboardEntry[];
  navItems: NavItem[];
};

export type MatchPageData = {
  teams: Team[];
  scorers: Scorer[];
};

export type HistoryPageData = {
  historyMatches: HistoryMatch[];
  leaderboard: LeaderboardEntry[];
};

export type PlayersPageData = {
  clusterPlayers: ClusterPlayer[];
};

export type AdminPageData = {
  adminActions: AdminAction[];
  attendanceBoard: AttendanceEntry[];
};
