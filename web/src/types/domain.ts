export type NavItem = {
  href: string;
  label: string;
};

export type NextMatch = {
  id?: string;
  dateLabel: string;
  isoDate?: string;
  isoTime?: string;
  timeLabel: string;
  venue: string;
  format: string;
  targetPlayers: number;
  fallbackPlayers: number;
  status: string;
  rawStatus?: "scheduled" | "open" | "closed" | "played" | "cancelled" | "suspended";
  notes?: string;
  confirmed: number;
  substitutes: number;
  missing: number;
};

export type AttendanceEntry = {
  name: string;
  status: string;
  detail: string;
};

export type AttendanceSummary = {
  backups: number;
  confirmed: number;
  declined: number;
  totalResponses: number;
};

export type AdminInsight = {
  detail: string;
  label: string;
  tone: "default" | "lime" | "accent";
  value: string;
};

export type LaundryDuty = {
  assigneeName: string;
  assignmentMode: "rotation" | "random";
  dueLabel: string;
  notes: string;
  status: string;
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
  attendanceSummary: AttendanceSummary;
  availabilityOptions: AvailabilityOption[];
  currentMatch: NextMatch;
  currentMode: "demo" | "supabase";
  matchId: string;
  players: ClusterPlayer[];
  matchStatus: string;
  matchNotes?: string;
  submissionsOpen: boolean;
};

export type DashboardData = {
  nextMatch: NextMatch;
  laundryDuty: LaundryDuty;
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
  attendanceBoard: AttendanceEntry[];
  attendanceSummary: AttendanceSummary;
  adminInsights: AdminInsight[];
  currentMatch: NextMatch;
  laundryDuty: LaundryDuty;
};
