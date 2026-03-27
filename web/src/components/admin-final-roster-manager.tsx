"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateMatchParticipantStatusByAdmin,
  type ParticipantAdminActionState,
} from "@/app/admin/actions";
import { Pill, SectionCard } from "@/components/ui";
import type { MatchParticipantEntry, MatchParticipantSummary } from "@/types/domain";

const initialParticipantAdminActionState: ParticipantAdminActionState = {
  message: "",
  status: "idle",
};

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0a0f1c] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando" : "Cerrar"}
    </button>
  );
}

function mapRoleLabel(role: MatchParticipantEntry["role"]) {
  switch (role) {
    case "starter":
      return "Titular";
    case "substitute":
      return "Suplente";
    default:
      return "Invitado";
  }
}

function mapAttendanceLabel(status: MatchParticipantEntry["attendanceStatus"]) {
  switch (status) {
    case "played":
      return "Jugo";
    case "late_cancel":
      return "Baja tardia";
    case "no_show":
      return "No-show";
    default:
      return "Pendiente";
  }
}

function FinalRosterRow({
  editable,
  entry,
  matchId,
}: {
  editable: boolean;
  entry: MatchParticipantEntry;
  matchId?: string;
}) {
  const [actionState, formAction] = useActionState(
    updateMatchParticipantStatusByAdmin,
    initialParticipantAdminActionState,
  );

  return (
    <form action={formAction} className="rounded-[1.4rem] border border-line bg-surface-strong p-4">
      <input type="hidden" name="matchId" value={matchId ?? ""} />
      <input type="hidden" name="playerId" value={entry.playerId} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold">{entry.name}</p>
            <Pill tone={entry.role === "starter" ? "lime" : "default"}>
              {mapRoleLabel(entry.role)}
            </Pill>
          </div>
          <p className="mt-1 text-sm text-muted">
            {entry.priorityNote ?? "Lista final consolidada para esta fecha."}
          </p>
        </div>
        <Pill tone={entry.attendanceStatus === "played" ? "lime" : "accent"}>
          {mapAttendanceLabel(entry.attendanceStatus)}
        </Pill>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          name="attendanceStatus"
          defaultValue={entry.attendanceStatus}
          disabled={!editable || !matchId}
          className="w-full rounded-[1rem] border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-accent/40 sm:w-auto sm:min-w-[13rem] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="confirmed">Pendiente</option>
          <option value="played">Jugo</option>
          <option value="late_cancel">Baja tardia</option>
          <option value="no_show">No-show</option>
        </select>
        <div className="w-full sm:w-auto">
          <SaveButton disabled={!editable || !matchId} />
        </div>
      </div>

      {actionState.status !== "idle" ? (
        <div
          className={`mt-3 rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
            actionState.status === "success"
              ? "border-lime/40 bg-lime/[0.1] text-lime"
              : actionState.status === "demo"
                ? "border-accent/30 bg-accent/[0.08] text-accent"
                : "border-red-500/40 bg-red-500/[0.1] text-red-400"
          }`}
        >
          {actionState.message}
        </div>
      ) : null}
    </form>
  );
}

export function AdminFinalRosterManager({
  currentMatchId,
  editable,
  participantSummary,
  participants,
}: {
  currentMatchId?: string;
  editable: boolean;
  participantSummary: MatchParticipantSummary;
  participants: MatchParticipantEntry[];
}) {
  return (
    <SectionCard eyebrow="Cierre real" title="Asistencia final del partido">
      <div className="mb-5 flex flex-wrap gap-2">
        <Pill tone="lime">{participantSummary.played} jugaron</Pill>
        <Pill>{participantSummary.confirmed} pendientes</Pill>
        <Pill tone="accent">{participantSummary.lateCancels} bajas tardias</Pill>
        <Pill tone="accent">{participantSummary.noShow} no-show</Pill>
      </div>

      {!currentMatchId ? (
        <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
          No hay un partido activo para cerrar asistencia real.
        </div>
      ) : !participants.length ? (
        <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
          Primero cerra la convocatoria para consolidar la lista final y despues cargar quien jugo.
        </div>
      ) : !editable ? (
        <div className="mb-4 rounded-[1.2rem] border border-line bg-surface-strong px-4 py-3 text-sm leading-6 text-muted">
          La asistencia final solo se edita con el partido en `Lista cerrada` o `Partido jugado`.
        </div>
      ) : (
        <div className="mb-4 rounded-[1.2rem] border border-lime/30 bg-lime/[0.08] px-4 py-3 text-sm leading-6 text-lime">
          Marca `Jugo`, `Baja tardia` o `No-show` para cerrar la asistencia real antes de cargar
          resultado y estadisticas.
        </div>
      )}

      <div className="space-y-3">
        {participants.map((entry) => (
          <FinalRosterRow
            key={`${entry.playerId}-${entry.attendanceStatus}`}
            editable={editable}
            entry={entry}
            matchId={currentMatchId}
          />
        ))}
      </div>
    </SectionCard>
  );
}
