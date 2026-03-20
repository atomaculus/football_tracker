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
import {
  buildProjectedAttendanceBoard,
  getPlayerName,
  type PreviousPlayerInput,
} from "@/lib/match-selection";
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
  MatchParticipantEntry,
  MatchParticipantSummary,
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

type AttendanceQueryRow = {
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  responded_at: string | null;
  response: "going" | "backup" | "not_going" | "dropped";
};

type PreviousPlayerRow = PreviousPlayerInput;
type MatchParticipantRow = {
  attendance_status: "confirmed" | "played" | "late_cancel" | "no_show";
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  priority_note: string | null;
  role: "starter" | "substitute" | "guest";
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

function getMatchStartDate(isoDate?: string, isoTime?: string | null) {
  if (!isoDate) {
    return null;
  }

  const safeTime = isoTime && /^\d{2}:\d{2}(:\d{2})?$/.test(isoTime) ? isoTime : "21:00:00";
  const normalizedTime = safeTime.length === 5 ? `${safeTime}:00` : safeTime;
  const parsedDate = new Date(`${isoDate}T${normalizedTime}-03:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function getSignupCutoffDate(isoDate?: string, isoTime?: string | null) {
  const matchStartDate = getMatchStartDate(isoDate, isoTime);

  if (!matchStartDate) {
    return null;
  }

  return new Date(matchStartDate.getTime() - 90 * 60 * 1000);
}

function formatCutoffLabel(cutoffDate: Date | null) {
  if (!cutoffDate) {
    return undefined;
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(cutoffDate);
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
    nextMatch.rawStatus === "open" &&
    nextMatch.submissionsOpen &&
    confirmed >= nextMatch.targetPlayers
      ? {
          detail: "La convocatoria ya tiene cupo ideal, pero puede seguir entrando gente como suplente hasta el cierre por horario.",
          label: "Siguiente accion",
          tone: "default" as const,
          value: "Seguir sumando suplentes",
        }
      : nextMatch.rawStatus === "open" && !nextMatch.submissionsOpen
        ? {
            detail: "La ventana de anotacion ya cerro por horario. La lista queda congelada hasta el partido.",
            label: "Siguiente accion",
            tone: "default" as const,
            value: "Lista congelada",
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
              detail: "La convocatoria ya esta cerrada. Lo siguiente es registrar quienes jugaron de verdad, las bajas tardias y los no-show.",
              label: "Siguiente accion",
              tone: "default" as const,
              value: "Cerrar asistencia real",
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
  const signupCutoffDate = getSignupCutoffDate(match.match_date, match.start_time);
  const submissionsOpen =
    match.status === "open" &&
    (signupCutoffDate ? Date.now() < signupCutoffDate.getTime() : true);
  const lateDropAllowed = match.status === "open" || match.status === "closed";

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
    signupClosesLabel: formatCutoffLabel(signupCutoffDate),
    status: mapMatchStatus(match.status),
    substitutes,
    submissionsOpen,
    lateDropAllowed,
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

async function getLatestPlayedRoster(currentMatchId?: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  let matchQuery = supabase
    .from("matches")
    .select("id")
    .eq("status", "played")
    .order("match_date", { ascending: false })
    .limit(1);

  if (currentMatchId) {
    matchQuery = matchQuery.neq("id", currentMatchId);
  }

  const { data: latestMatch, error: latestMatchError } = await matchQuery.maybeSingle();

  if (latestMatchError || !latestMatch) {
    return null;
  }

  const { data, error } = await supabase
    .from("match_participants")
    .select("player_id, role, priority_note, players(full_name)")
    .eq("match_id", latestMatch.id)
    .eq("attendance_status", "played")
    .order("role", { ascending: true });

  if (error || !data) {
    return null;
  }

  return data as PreviousPlayerRow[];
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
    .select("response, responded_at, player_id, players(full_name)")
    .eq("match_id", matchId)
    .order("responded_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  const typedData = data as AttendanceQueryRow[];

  const counts = typedData.reduce(
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

  const attendanceEntries: AttendanceEntry[] = typedData.map((item) => {
      return {
        detail: `Respondio ${formatResponseDetail(item.responded_at)}`,
        name: getPlayerName(item.players),
        playerId: item.player_id,
        status: mapAvailabilityResponse(item.response),
        responseValue: item.response as AttendanceEntry["responseValue"],
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

async function getMatchParticipantsForMatch(matchId: string) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("match_participants")
    .select("attendance_status, player_id, priority_note, role, players(full_name)")
    .eq("match_id", matchId)
    .order("priority_score", { ascending: false });

  if (error || !data) {
    return null;
  }

  const participants = (data as MatchParticipantRow[]).map(
    (participant): MatchParticipantEntry => ({
      attendanceStatus: participant.attendance_status,
      name: getPlayerName(participant.players),
      playerId: participant.player_id,
      priorityNote: participant.priority_note ?? undefined,
      role: participant.role,
    }),
  );

  const summary = participants.reduce<MatchParticipantSummary>(
    (accumulator, participant) => {
      if (participant.attendanceStatus === "played") {
        accumulator.played += 1;
      } else if (participant.attendanceStatus === "late_cancel") {
        accumulator.lateCancels += 1;
      } else if (participant.attendanceStatus === "no_show") {
        accumulator.noShow += 1;
      } else {
        accumulator.confirmed += 1;
      }

      return accumulator;
    },
    { confirmed: 0, lateCancels: 0, noShow: 0, played: 0 },
  );

  return {
    participants,
    summary,
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
    lateDropAllowed: dashboardData.nextMatch.lateDropAllowed ?? false,
    submissionsOpen: dashboardData.nextMatch.submissionsOpen ?? !upcomingMatch,
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
  const previousRoster = upcomingMatch ? await getLatestPlayedRoster(upcomingMatch.id) : null;
  const currentParticipants = upcomingMatch
    ? await getMatchParticipantsForMatch(upcomingMatch.id)
    : null;
  const currentMatch = buildNextMatch(upcomingMatch, attendanceData?.counts);
  const attendanceSummary: AttendanceSummary = attendanceData?.attendanceSummary ?? {
    backups: currentMatch.substitutes,
    confirmed: currentMatch.confirmed,
    declined: 0,
    totalResponses: attendanceBoardSeed.length,
  };
  const projectedBoard = buildProjectedAttendanceBoard({
    previousPlayers: previousRoster ?? [],
    responses: attendanceData?.fullAttendanceBoard ?? attendanceBoardSeed,
    targetPlayers: currentMatch.targetPlayers,
  });

  return {
    adminInsights: getAdminInsights(currentMatch, attendanceSummary),
    actualParticipants: currentParticipants?.participants ?? [],
    actualParticipantSummary: currentParticipants?.summary ?? {
      confirmed: 0,
      lateCancels: 0,
      noShow: 0,
      played: 0,
    },
    attendanceBoard: projectedBoard.attendanceBoard,
    attendanceSummary,
    currentMatch,
    laundryDuty: laundryDutySeed,
    projectedStarters: projectedBoard.projectedStarters,
    projectedSubstitutes: projectedBoard.projectedSubstitutes,
  };
}
