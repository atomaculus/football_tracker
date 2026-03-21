export type NavItem = {
  href: string;
  label: string;
};

export type NextMatch = {
  id?: string;
  dateLabel: string;
  isoDate?: string;
  isoTime?: string;
  signupClosesLabel?: string;
  submissionsOpen?: boolean;
  lateDropAllowed?: boolean;
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
  playerId?: string;
  name: string;
  status: string;
  detail: string;
  isPriority?: boolean;
  projectedRole?: "starter" | "substitute" | "out";
  responseValue?: "going" | "backup" | "not_going" | "dropped";
};

export type AttendanceSummary = {
  backups: number;
  confirmed: number;
  declined: number;
  totalResponses: number;
};

export type MatchParticipantEntry = {
  playerId: string;
  name: string;
  role: "starter" | "substitute" | "guest";
  teamId?: string | null;
  attendanceStatus: "confirmed" | "played" | "late_cancel" | "no_show";
  priorityNote?: string;
};

export type MatchParticipantSummary = {
  confirmed: number;
  played: number;
  lateCancels: number;
  noShow: number;
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
  id?: string;
  name: string;
  color: string;
  score: number;
  players: string[];
};

export type Scorer = {
  id?: string;
  minute?: number;
  name: string;
  goals: number;
  team: string;
};

export type GoalEntry = {
  id: string;
  minute?: number;
  scorerName: string;
  teamId?: string | null;
  teamName: string;
  isOwnGoal: boolean;
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
  laundryLoads?: number;
  diff: string;
  draws?: number;
  losses?: number;
  successRate?: string;
  wins?: number;
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
  currentPlayer?: ClusterPlayer;
  currentMode: "demo" | "supabase";
  matchId: string;
  players: ClusterPlayer[];
  matchStatus: string;
  matchNotes?: string;
  submissionsOpen: boolean;
  lateDropAllowed: boolean;
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
  actualParticipants: MatchParticipantEntry[];
  actualParticipantSummary: MatchParticipantSummary;
  goalEntries: GoalEntry[];
  matchTeams: Team[];
  projectedStarters: number;
  projectedSubstitutes: number;
};
