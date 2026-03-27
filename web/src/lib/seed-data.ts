import type {
  AdminAction,
  AttendanceEntry,
  AvailabilityOption,
  ClusterPlayer,
  HistoryMatch,
  LeaderboardEntry,
  LaundryDuty,
  NavItem,
  NextMatch,
  Scorer,
  Team,
} from "@/types/domain";

function getNextTuesdaySeedDate() {
  const now = new Date();
  const seedDate = new Date(now);
  const currentDay = seedDate.getDay();
  const daysUntilTuesday = (2 - currentDay + 7) % 7 || 7;
  seedDate.setDate(seedDate.getDate() + daysUntilTuesday);
  return seedDate;
}

function formatSeedMatchDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);
}

function formatSeedIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const seedNextTuesday = getNextTuesdaySeedDate();

export const nextMatchSeed: NextMatch = {
  dateLabel: formatSeedMatchDate(seedNextTuesday),
  isoDate: formatSeedIsoDate(seedNextTuesday),
  isoTime: "19:00:00",
  timeLabel: "19:00",
  venue: "Backyard",
  format: "7v7",
  targetPlayers: 14,
  fallbackPlayers: 12,
  status: "Proxima fecha",
  confirmed: 0,
  substitutes: 0,
  missing: 14,
};

export const attendanceBoardSeed: AttendanceEntry[] = [
  {
    playerId: "seed-lucas-lopez",
    name: "Lucas Lopez",
    status: "Titular",
    detail: "Confirmo lunes 08:07",
    responseValue: "going",
  },
  {
    playerId: "seed-mariano-salama",
    name: "Mariano Salama",
    status: "Titular",
    detail: "Confirmo lunes 08:11",
    responseValue: "going",
  },
  {
    playerId: "seed-ruben-mel",
    name: "Ruben Mel",
    status: "Titular",
    detail: "Confirmo lunes 08:14",
    responseValue: "going",
  },
  {
    playerId: "seed-fidel",
    name: "Fidel",
    status: "Titular",
    detail: "Confirmo lunes 08:31",
    responseValue: "going",
  },
  {
    playerId: "seed-pacho",
    name: "Pacho",
    status: "Suplente",
    detail: "Primero en espera",
    responseValue: "backup",
  },
  {
    playerId: "seed-nico-arquero",
    name: "Nico Arquero",
    status: "No va",
    detail: "Baja avisada 16:40",
    responseValue: "not_going",
  },
];

export const laundryDutySeed: LaundryDuty = {
  assigneeName: "Fidel",
  assignmentMode: "rotation",
  dueLabel: "Entregar el proximo martes",
  notes: "Se lleva las camisetas crema y negras con naranja despues del partido.",
  status: "Asignado",
};

export const availabilityOptionsSeed: AvailabilityOption[] = [
  {
    label: "Voy",
    value: "going",
    tone: "lime",
    description: "Me sumo al partido y entro en la lista de esta semana.",
  },
  {
    label: "Suplente",
    value: "backup",
    tone: "sand",
    description: "Puedo jugar si falta gente o se cae alguno a ultimo momento.",
  },
  {
    label: "No voy",
    value: "not_going",
    tone: "accent",
    description: "Me bajo de esta fecha y libero el cupo.",
  },
];

export const teamsSeed: Team[] = [
  {
    name: "Verdes",
    color: "bg-lime text-foreground",
    score: 7,
    players: [
      "Lucas Lopez",
      "Ruben Mel",
      "Guido Marani",
      "Fidel",
      "Agustin Ferrara",
      "Pacho",
      "Franco",
    ],
  },
  {
    name: "Naranjas",
    color: "bg-accent text-white",
    score: 5,
    players: [
      "Mariano Salama",
      "Esteban Larre",
      "Lucas Vikingo",
      "Guido Muniz",
      "Atilio",
      "Fabrizio Saban",
      "Rodri",
    ],
  },
];

export const scorersSeed: Scorer[] = [
  { name: "Ruben Mel", goals: 3, team: "Verdes" },
  { name: "Lucas Lopez", goals: 2, team: "Verdes" },
  { name: "Mariano Salama", goals: 2, team: "Naranjas" },
  { name: "Fidel", goals: 1, team: "Verdes" },
  { name: "Rodri", goals: 1, team: "Naranjas" },
];

export const historyMatchesSeed: HistoryMatch[] = [
  {
    date: "18 de marzo",
    result: "Verdes 4 - 3 Naranjas",
    attendance: "14 jugadores",
    notes: "Partido completo 7v7, sin bajas tardias",
  },
  {
    date: "11 de marzo",
    result: "Verdes 3 - 3 Naranjas",
    attendance: "12 jugadores",
    notes: "Se jugo 6v6 por dos ausencias",
  },
  {
    date: "4 de marzo",
    result: "Naranjas 5 - 4 Verdes",
    attendance: "14 jugadores",
    notes: "Dos suplentes terminaron entrando",
  },
];

export const leaderboardSeed: LeaderboardEntry[] = [
  { name: "Ruben Mel", presences: 33, goals: 14, laundryLoads: 3, diff: "+14" },
  { name: "Esteban Larre", presences: 7, goals: 4, laundryLoads: 1, diff: "+4" },
  { name: "Fidel", presences: 7, goals: 3, laundryLoads: 2, diff: "+1" },
  { name: "Guido Marani", presences: 3, goals: 2, laundryLoads: 0, diff: "+2" },
];

export const adminActionsSeed: AdminAction[] = [
  "Abrir convocatoria del martes",
  "Mover jugador a suplentes",
  "Cerrar lista final",
  "Asignar equipos manualmente",
  "Cargar resultado y goleadores",
  "Aplicar override por baja tardia",
  "Suspender partido por clima o falta de quorum",
];

export const clusterPlayersSeed: ClusterPlayer[] = [
  { id: "seed-lucas-lopez", name: "Lucas Lopez", role: "Jugador", status: "Activo" },
  { id: "seed-mariano-salama", name: "Mariano Salama", role: "Admin", status: "Activo" },
  { id: "seed-ruben-mel", name: "Ruben Mel", role: "Jugador", status: "Activo" },
  { id: "seed-fidel", name: "Fidel", role: "Jugador", status: "Activo" },
  { id: "seed-pacho", name: "Pacho", role: "Jugador", status: "Activo" },
  { id: "seed-esteban-larre", name: "Esteban Larre", role: "Jugador", status: "Activo" },
  { id: "seed-guido-marani", name: "Guido Marani", role: "Jugador", status: "Activo" },
  { id: "seed-guido-muniz", name: "Guido Muniz", role: "Jugador", status: "Activo" },
  { id: "seed-fabrizio-saban", name: "Fabrizio Saban", role: "Jugador", status: "Activo" },
  { id: "seed-atilio", name: "Atilio", role: "Jugador", status: "Activo" },
  { id: "seed-franco", name: "Franco", role: "Jugador", status: "Activo" },
  { id: "seed-nico-arquero", name: "Nico Arquero", role: "Jugador", status: "Inactivo" },
];

export const navItemsSeed: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/confirmar", label: "Confirmar" },
  { href: "/partido", label: "Partido" },
  { href: "/historial", label: "Historial" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/admin", label: "Admin" },
];
