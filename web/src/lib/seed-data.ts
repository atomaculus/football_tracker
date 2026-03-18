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

export const nextMatchSeed: NextMatch = {
  dateLabel: "Martes 25 de marzo",
  timeLabel: "21:00",
  venue: "Open Gallo",
  format: "7v7",
  targetPlayers: 14,
  fallbackPlayers: 12,
  status: "Convocatoria abierta",
  confirmed: 11,
  substitutes: 2,
  missing: 3,
};

export const attendanceBoardSeed: AttendanceEntry[] = [
  { name: "Lucas Lopez", status: "Titular", detail: "Confirmo lunes 08:07" },
  { name: "Mariano Salama", status: "Titular", detail: "Confirmo lunes 08:11" },
  { name: "Ruben Mel", status: "Titular", detail: "Confirmo lunes 08:14" },
  { name: "Fidel", status: "Titular", detail: "Confirmo lunes 08:31" },
  { name: "Pacho", status: "Suplente", detail: "Primero en espera" },
  { name: "Nico Arquero", status: "No va", detail: "Baja avisada 16:40" },
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
  { name: "Ruben Mel", presences: 33, goals: 14, diff: "+14" },
  { name: "Esteban Larre", presences: 7, goals: 4, diff: "+4" },
  { name: "Fidel", presences: 7, goals: 3, diff: "+1" },
  { name: "Guido Marani", presences: 3, goals: 2, diff: "+2" },
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
