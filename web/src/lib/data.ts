import {
  adminActionsSeed,
  attendanceBoardSeed,
  availabilityOptionsSeed,
  clusterPlayersSeed,
  historyMatchesSeed,
  leaderboardSeed,
  navItemsSeed,
  nextMatchSeed,
  scorersSeed,
  teamsSeed,
} from "@/lib/seed-data";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type {
  AdminPageData,
  DashboardData,
  HistoryPageData,
  MatchPageData,
  PlayersPageData,
} from "@/types/domain";

async function getPlayersFromSupabase() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("players")
    .select("full_name, role, is_active")
    .order("full_name", { ascending: true });

  if (error || !data) {
    return null;
  }

  return data.map((player) => ({
    name: player.full_name,
    role: player.role === "admin" ? "Admin" : "Jugador",
    status: player.is_active ? "Activo" : "Inactivo",
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  return {
    nextMatch: nextMatchSeed,
    attendanceBoard: attendanceBoardSeed,
    leaderboard: leaderboardSeed,
    navItems: navItemsSeed,
  };
}

export async function getAvailabilityOptions() {
  return availabilityOptionsSeed;
}

export async function getMatchPageData(): Promise<MatchPageData> {
  return {
    teams: teamsSeed,
    scorers: scorersSeed,
  };
}

export async function getHistoryPageData(): Promise<HistoryPageData> {
  return {
    historyMatches: historyMatchesSeed,
    leaderboard: leaderboardSeed,
  };
}

export async function getPlayersPageData(): Promise<PlayersPageData> {
  const players = await getPlayersFromSupabase();

  return {
    clusterPlayers: players ?? clusterPlayersSeed,
  };
}

export async function getAdminPageData(): Promise<AdminPageData> {
  return {
    adminActions: adminActionsSeed,
    attendanceBoard: attendanceBoardSeed,
  };
}
