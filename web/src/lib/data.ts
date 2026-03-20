import {
  attendanceBoardSeed,
  availabilityOptionsSeed,
  clusterPlayersSeed,
  historyMatchesSeed,
  leaderboardSeed,
  laundryDutySeed,
  navItemsSeed,
  nextMatchSeed,
  scorersSeed,
  teamsSeed,
} from "@/lib/seed-data";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type {
  AdminPageData,
  AdminInsight,
  AttendanceEntry,
  AttendanceSummary,
  AvailabilityPageData,
  ClusterPlayer,
  DashboardData,
  HistoryPageData,
  MatchPageData,
  NextMatch,
  PlayersPageData,
} from "@/types/domain";

type MatchRow = {
  fallback_players: number;
  format_label: string;
  id: string;
  location: string | null;
  match_date: string;
  notes: string | null;
  start_time: string | null;
  status: string;
  target_players: number;
};

function formatMatchDate(date: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(parsedDate);
}

function formatMatchTime(time: string | null) {
  if (!time) {
    return "Horario a definir";
  }

  return time.slice(0, 5);
}

function mapMatchStatus(status: string) {
  switch (status) {
    case "open":
      return "Convocatoria abierta";
    case "closed":
      return "Lista cerrada";
    case "played":
      return "Partido cargado";
    case "suspended":
      return "Partido suspendido";
    case "cancelled":
      return "Suspendido";
    default:
      return "Programado";
  }
}

function mapPlayerRole(role: string) {
  return role === "admin" ? "Admin" : "Jugador";
}

function mapPlayerStatus(isActive: boolean) {
  if (!isActive) {
    return "Inactivo";
  }

  return "Activo";
}

function mapAvailabilityResponse(response: string) {
  switch (response) {
    case "going":
      return "Titular";
    case "backup":
      return "Suplente";
    case "not_going":
    case "dropped":
      return "No va";
    default:
      return "Pendiente";
  }
}

function formatResponseDetail(timestamp: string | null) {
  if (!timestamp) {
    return "Sin horario";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(timestamp));
}

function getAdminInsights(nextMatch: NextMatch, attendanceSummary: AttendanceSummary): AdminInsight[] {
  const { backups, confirmed } = attendanceSummary;

  const formatInsight =
    confirmed >= nextMatch.targetPlayers
      ? {
          detail: `${confirmed} confirmados. Se llega al objetivo ideal sin depender de suplentes.`,
          label: "Formato recomendado",
          tone: "lime" as const,
          value: nextMatch.format,
        }
      : confirmed >= nextMatch.fallbackPlayers
        ? {
            detail: `${confirmed} confirmados. No llega a ${nextMatch.targetPlayers}, pero alcanza para jugar sin romper la regla operativa.`,
            label: "Formato recomendado",
            tone: "default" as const,
            value: "6v6",
          }
        : confirmed + backups >= nextMatch.fallbackPlayers
          ? {
              detail: `${confirmed} confirmados y ${backups} suplentes. Solo se salva la fecha si entran suplentes.`,
              label: "Formato recomendado",
              tone: "accent" as const,
              value: "Depende de suplentes",
            }
          : {
              detail: `${confirmed} confirmados y ${backups} suplentes. No alcanza el minimo de ${nextMatch.fallbackPlayers}.`,
              label: "Formato recomendado",
              tone: "accent" as const,
              value: "Suspender",
            };

  const quorumInsight =
    confirmed >= nextMatch.fallbackPlayers
      ? {
          detail: `El minimo operativo ya esta cubierto. Si se cae alguien, quedan ${backups} suplentes como red.`,
          label: "Quorum",
          tone: "lime" as const,
          value: "Cubierto",
        }
      : confirmed + backups >= nextMatch.fallbackPlayers
        ? {
            detail: `Faltan ${nextMatch.fallbackPlayers - confirmed} para el minimo, pero los suplentes todavia sostienen la fecha.`,
            label: "Quorum",
            tone: "default" as const,
            value: "Franco",
          }
        : {
            detail: `Faltan ${nextMatch.fallbackPlayers - (confirmed + backups)} jugadores para llegar al minimo incluso contando suplentes.`,
            label: "Quorum",
            tone: "accent" as const,
            value: "En riesgo",
          };

  const adminActionInsight =
    nextMatch.rawStatus === "open" && confirmed >= nextMatch.targetPlayers
      ? {
          detail: "La convocatoria ya tiene cupo ideal. El siguiente paso logico es cerrar la lista o pasar suplentes a espera.",
          label: "Siguiente accion",
          tone: "lime" as const,
          value: "Cerrar lista",
        }
      : nextMatch.rawStatus === "open" && confirmed < nextMatch.fallbackPlayers
        ? {
            detail: "La fecha sigue abierta, pero conviene monitorear bajas y definir si se sostiene con suplentes o se suspende.",
            label: "Siguiente accion",
            tone: "accent" as const,
            value: "Revisar quorum",
          }
        : nextMatch.rawStatus === "closed"
          ? {
              detail: "La convocatoria ya esta cerrada. Lo siguiente es ordenar lista final, camisetas y armado de equipos.",
              label: "Siguiente accion",
              tone: "default" as const,
              value: "Armar fecha",
            }
          : {
              detail: "El admin ya puede mover el estado del partido. El siguiente bloque natural es conectar armado de lista y equipos.",
              label: "Siguiente accion",
              tone: "default" as const,
              value: "Seguir operando",
            };

  return [formatInsight, quorumInsight, adminActionInsight];
}

function buildNextMatch(
  match: MatchRow | null,
  counts?: { backup: number; going: number; notGoing: number },
): NextMatch {
  if (!match) {
    return nextMatchSeed;
  }

  const confirmed = counts?.going ?? 0;
  const substitutes = counts?.backup ?? 0;
  const remaining = Math.max(match.target_players - confirmed, 0);

  return {
    confirmed,
    id: match.id,
    dateLabel: formatMatchDate(match.match_date),
    fallbackPlayers: match.fallback_players,
    format: match.format_label,
    isoDate: match.match_date,
    isoTime: match.start_time ?? undefined,
    missing: remaining,
    notes: match.notes ?? undefined,
    rawStatus: match.status as NextMatch["rawStatus"],
    status: mapMatchStatus(match.status),
    substitutes,
    targetPlayers: match.target_players,
    timeLabel: formatMatchTime(match.start_time),
    venue: match.location ?? "Cancha a definir",
  };
}

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
    .select("id, full_name, role, is_active, is_guest")
    .order("full_name", { ascending: true });

  if (error || !data) {
    return null;
  }

  return data.map(
    (player): ClusterPlayer => ({
      id: player.id,
      name: player.full_name,
      role: mapPlayerRole(player.role),
      status: mapPlayerStatus(player.is_active),
    }),
  );
}

async function getUpcomingMatchFromSupabase() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, match_date, location, start_time, target_players, fallback_players, format_label, status, notes",
    )
    .in("status", ["scheduled", "open", "closed", "suspended"])
    .order("match_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as MatchRow;
}

async function getAttendanceForMatch(matchId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("availability_responses")
    .select("response, responded_at, players(full_name)")
    .eq("match_id", matchId)
    .order("responded_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  const counts = data.reduce(
    (accumulator, item) => {
      if (item.response === "going") {
        accumulator.going += 1;
      } else if (item.response === "backup") {
        accumulator.backup += 1;
      } else if (item.response === "not_going" || item.response === "dropped") {
        accumulator.notGoing += 1;
      }

      return accumulator;
    },
    { backup: 0, going: 0, notGoing: 0 },
  );

  const attendanceEntries: AttendanceEntry[] = data.map((item) => {
      const playerData = Array.isArray(item.players) ? item.players[0] : item.players;
      const fullName =
        playerData && typeof playerData === "object" && "full_name" in playerData
          ? String(playerData.full_name)
          : "Jugador";

      return {
        detail: `Respondio ${formatResponseDetail(item.responded_at)}`,
        name: fullName,
        status: mapAvailabilityResponse(item.response),
      };
    });

  return {
    attendanceBoard: attendanceEntries.slice(0, 8),
    attendanceSummary: {
      backups: counts.backup,
      confirmed: counts.going,
      declined: counts.notGoing,
      totalResponses: data.length,
    },
    fullAttendanceBoard: attendanceEntries,
    counts,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const upcomingMatch = await getUpcomingMatchFromSupabase();
  const attendanceData = upcomingMatch
    ? await getAttendanceForMatch(upcomingMatch.id)
    : null;

  return {
    attendanceBoard:
      attendanceData?.attendanceBoard.length
        ? attendanceData.attendanceBoard
        : attendanceBoardSeed,
    leaderboard: leaderboardSeed,
    laundryDuty: laundryDutySeed,
    navItems: navItemsSeed,
    nextMatch: buildNextMatch(upcomingMatch, attendanceData?.counts),
  };
}

export async function getAvailabilityPageData(): Promise<AvailabilityPageData> {
  const [dashboardData, players, upcomingMatch] = await Promise.all([
    getDashboardData(),
    getPlayersFromSupabase(),
    getUpcomingMatchFromSupabase(),
  ]);
  const attendanceData = upcomingMatch
    ? await getAttendanceForMatch(upcomingMatch.id)
    : null;
  const attendanceSummary: AttendanceSummary = attendanceData?.attendanceSummary ?? {
    backups: dashboardData.nextMatch.substitutes,
    confirmed: dashboardData.nextMatch.confirmed,
    declined: 0,
    totalResponses: dashboardData.attendanceBoard.length,
  };

  return {
    attendanceBoard: dashboardData.attendanceBoard,
    attendanceSummary,
    availabilityOptions: availabilityOptionsSeed,
    currentMatch: dashboardData.nextMatch,
    currentMode: hasSupabaseEnv() && upcomingMatch ? "supabase" : "demo",
    matchId: upcomingMatch?.id ?? "seed-next-match",
    matchNotes: dashboardData.nextMatch.notes,
    matchStatus: dashboardData.nextMatch.status,
    players: players ?? clusterPlayersSeed.filter((player) => player.status !== "Inactivo"),
    submissionsOpen: dashboardData.nextMatch.rawStatus === "open" || !upcomingMatch,
  };
}

export async function getMatchPageData(): Promise<MatchPageData> {
  return {
    scorers: scorersSeed,
    teams: teamsSeed,
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
  const upcomingMatch = await getUpcomingMatchFromSupabase();
  const attendanceData = upcomingMatch
    ? await getAttendanceForMatch(upcomingMatch.id)
    : null;
  const currentMatch = buildNextMatch(upcomingMatch, attendanceData?.counts);
  const attendanceSummary: AttendanceSummary = attendanceData?.attendanceSummary ?? {
    backups: currentMatch.substitutes,
    confirmed: currentMatch.confirmed,
    declined: 0,
    totalResponses: attendanceBoardSeed.length,
  };

  return {
    adminInsights: getAdminInsights(currentMatch, attendanceSummary),
    attendanceBoard: attendanceData?.fullAttendanceBoard.length
      ? attendanceData.fullAttendanceBoard
      : attendanceBoardSeed,
    attendanceSummary,
    currentMatch,
    laundryDuty: laundryDutySeed,
  };
}
