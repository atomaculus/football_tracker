"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  addGoalByAdmin,
  assignParticipantTeamByAdmin,
  deleteGoalByAdmin,
  saveMatchTeamsByAdmin,
  type MatchResultAdminActionState,
} from "@/app/admin/actions";
import { Pill, SectionCard } from "@/components/ui";
import type { GoalEntry, MatchParticipantEntry, Team } from "@/types/domain";

const initialMatchResultAdminActionState: MatchResultAdminActionState = {
  message: "",
  status: "idle",
};

function SubmitButton({ disabled, label }: { disabled?: boolean; label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-surface-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando" : label}
    </button>
  );
}

function ActionMessage({ state }: { state: MatchResultAdminActionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div
      className={`rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
        state.status === "success"
          ? "border-lime/40 bg-[#dbe8d8] text-foreground"
          : state.status === "demo"
            ? "border-line bg-[#f1ead8] text-foreground"
            : "border-accent/40 bg-[#f4ddcf] text-foreground"
      }`}
    >
      {state.message}
    </div>
  );
}

function TeamAssignmentRow({
  entry,
  matchId,
  teams,
}: {
  entry: MatchParticipantEntry;
  matchId?: string;
  teams: Team[];
}) {
  const [actionState, formAction] = useActionState(
    assignParticipantTeamByAdmin,
    initialMatchResultAdminActionState,
  );

  return (
    <form action={formAction} className="rounded-[1.2rem] border border-line bg-white/70 p-4">
      <input type="hidden" name="matchId" value={matchId ?? ""} />
      <input type="hidden" name="playerId" value={entry.playerId} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-extrabold">{entry.name}</p>
          <p className="text-sm text-muted">
            {entry.role === "starter" ? "Titular" : "Suplente"} · {entry.attendanceStatus}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="teamId"
            defaultValue={entry.teamId ?? ""}
            className="min-w-[12rem] rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-foreground"
          >
            <option value="">Sin equipo</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <SubmitButton disabled={!matchId || teams.length < 2} label="Asignar" />
        </div>
      </div>
      <div className="mt-3">
        <ActionMessage state={actionState} />
      </div>
    </form>
  );
}

function DeleteGoalRow({ goal }: { goal: GoalEntry }) {
  const [actionState, formAction] = useActionState(
    deleteGoalByAdmin,
    initialMatchResultAdminActionState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-line bg-white/70 px-4 py-4"
    >
      <input type="hidden" name="goalId" value={goal.id} />
      <div>
        <p className="font-extrabold">{goal.scorerName}</p>
        <p className="text-sm text-muted">
          {goal.teamName}
          {goal.minute ? ` · ${goal.minute}'` : ""}
          {goal.isOwnGoal ? " · en contra" : ""}
        </p>
      </div>
      <SubmitButton label="Eliminar" />
      <div className="basis-full">
        <ActionMessage state={actionState} />
      </div>
    </form>
  );
}

export function AdminMatchResultManager({
  goalEntries,
  matchId,
  participants,
  teams,
}: {
  goalEntries: GoalEntry[];
  matchId?: string;
  participants: MatchParticipantEntry[];
  teams: Team[];
}) {
  const [teamsState, saveTeamsAction] = useActionState(
    saveMatchTeamsByAdmin,
    initialMatchResultAdminActionState,
  );
  const [goalsState, addGoalAction] = useActionState(
    addGoalByAdmin,
    initialMatchResultAdminActionState,
  );
  const teamA = teams[0];
  const teamB = teams[1];
  const playableParticipants = participants.filter((participant) =>
    ["confirmed", "played", "no_show"].includes(participant.attendanceStatus),
  );

  return (
    <SectionCard eyebrow="Resultado" title="Equipos y goles">
      {!matchId ? (
        <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
          No hay un partido activo para cargar resultado.
        </div>
      ) : !participants.length ? (
        <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
          Cerra la convocatoria y registra asistencia real antes de cargar equipos y goles.
        </div>
      ) : (
        <div className="space-y-6">
          <form action={saveTeamsAction} className="grid gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <input type="hidden" name="matchId" value={matchId} />
            <input type="hidden" name="teamAId" value={teamA?.id ?? ""} />
            <input type="hidden" name="teamBId" value={teamB?.id ?? ""} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-3 rounded-[1.2rem] border border-line bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Equipo A</p>
                <input
                  name="teamAName"
                  defaultValue={teamA?.name ?? "Verdes"}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                  placeholder="Nombre"
                />
                <select
                  name="teamAColor"
                  defaultValue={teamA?.color ?? "bg-lime text-foreground"}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                >
                  <option value="bg-lime text-foreground">Verde</option>
                  <option value="bg-accent text-white">Naranja</option>
                  <option value="bg-[#0f3b2a] text-white">Bosque</option>
                  <option value="bg-[#f3e6cf] text-foreground">Crema</option>
                </select>
                <input
                  type="number"
                  min="0"
                  name="teamAGoals"
                  defaultValue={teamA?.score ?? 0}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                  placeholder="Goles"
                />
              </div>

              <div className="grid gap-3 rounded-[1.2rem] border border-line bg-white/70 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Equipo B</p>
                <input
                  name="teamBName"
                  defaultValue={teamB?.name ?? "Naranjas"}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                  placeholder="Nombre"
                />
                <select
                  name="teamBColor"
                  defaultValue={teamB?.color ?? "bg-accent text-white"}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                >
                  <option value="bg-accent text-white">Naranja</option>
                  <option value="bg-lime text-foreground">Verde</option>
                  <option value="bg-[#101010] text-white">Negro</option>
                  <option value="bg-[#f3e6cf] text-foreground">Crema</option>
                </select>
                <input
                  type="number"
                  min="0"
                  name="teamBGoals"
                  defaultValue={teamB?.score ?? 0}
                  className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                  placeholder="Goles"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">Carga los dos equipos y el marcador final.</p>
              <SubmitButton label="Guardar equipos" />
            </div>
            <ActionMessage state={teamsState} />
          </form>

          <div className="grid gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Asignacion</p>
                <p className="mt-1 text-lg font-black">Jugadores por equipo</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <Pill key={team.id} tone={team.color.includes("accent") ? "accent" : "lime"}>
                    {team.name}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {playableParticipants.map((entry) => (
                <TeamAssignmentRow
                  key={entry.playerId}
                  entry={entry}
                  matchId={matchId}
                  teams={teams}
                />
              ))}
            </div>
          </div>

          <form action={addGoalAction} className="grid gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <input type="hidden" name="matchId" value={matchId} />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Goles</p>
              <p className="mt-1 text-lg font-black">Registrar gol</p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto]">
              <select
                name="scorerPlayerId"
                className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
              >
                {playableParticipants.map((participant) => (
                  <option key={participant.playerId} value={participant.playerId}>
                    {participant.name}
                  </option>
                ))}
              </select>
              <select
                name="teamId"
                className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="120"
                name="minute"
                className="rounded-[1rem] border border-line bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-foreground"
                placeholder="Min"
              />
              <SubmitButton disabled={!teams.length || !playableParticipants.length} label="Cargar gol" />
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <input type="checkbox" name="isOwnGoal" value="true" className="size-4" />
              Gol en contra
            </label>
            <ActionMessage state={goalsState} />
          </form>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-black">Goles cargados</p>
              <Pill>{goalEntries.length} eventos</Pill>
            </div>
            {goalEntries.length ? (
              goalEntries.map((goal) => <DeleteGoalRow key={goal.id} goal={goal} />)
            ) : (
              <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
                Todavia no hay goles cargados para esta fecha.
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
