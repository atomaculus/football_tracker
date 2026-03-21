"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateAttendanceResponseByAdmin,
  type AttendanceAdminActionState,
} from "@/app/admin/actions";
import { Pill, SectionCard } from "@/components/ui";
import type { AttendanceEntry } from "@/types/domain";

const initialAttendanceAdminActionState: AttendanceAdminActionState = {
  message: "",
  status: "idle",
};

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-[#edf3e4] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando" : "Aplicar"}
    </button>
  );
}

function AttendanceRow({
  entry,
  editable,
  lateDropAllowed,
  matchId,
}: {
  entry: AttendanceEntry;
  editable: boolean;
  lateDropAllowed: boolean;
  matchId?: string;
}) {
  const [actionState, formAction] = useActionState(
    updateAttendanceResponseByAdmin,
    initialAttendanceAdminActionState,
  );
  const canEditThisRow = editable || (lateDropAllowed && entry.responseValue !== "not_going");
  const defaultValue = editable ? (entry.responseValue ?? "going") : "not_going";
  const isLateDropOnlyMode = !editable && lateDropAllowed;

  return (
    <form
      action={formAction}
      className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4"
    >
      <input type="hidden" name="matchId" value={matchId ?? ""} />
      <input type="hidden" name="playerId" value={entry.playerId ?? ""} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold">{entry.name}</p>
            {entry.isPriority ? <Pill tone="lime">Prioridad</Pill> : null}
          </div>
          <p className="text-sm text-white/60">{entry.detail}</p>
        </div>
        <Pill>{entry.status}</Pill>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          name="response"
          defaultValue={defaultValue}
          disabled={!canEditThisRow || !matchId || !entry.playerId}
          className="w-full rounded-[1rem] border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white/40 sm:w-auto sm:min-w-[12rem] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!isLateDropOnlyMode ? (
            <option value="going" className="text-foreground">
              Titular
            </option>
          ) : null}
          {!isLateDropOnlyMode ? (
            <option value="backup" className="text-foreground">
              Suplente
            </option>
          ) : null}
          <option value="not_going" className="text-foreground">
            No va
          </option>
        </select>
        <div className="w-full sm:w-auto">
          <SaveButton disabled={!canEditThisRow || !matchId || !entry.playerId} />
        </div>
      </div>

      {actionState.status !== "idle" ? (
        <div
          className={`mt-3 rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
            actionState.status === "success"
              ? "border-lime/40 bg-[#dbe8d8] text-foreground"
              : actionState.status === "demo"
                ? "border-white/12 bg-white/8 text-white/78"
                : "border-accent/40 bg-[#f4ddcf] text-foreground"
          }`}
        >
          {actionState.message}
        </div>
      ) : null}
    </form>
  );
}

export function AdminAttendanceManager({
  attendanceBoard,
  attendanceSummary,
  currentMatchId,
  editable,
  lateDropAllowed,
  projectedStarters,
  projectedSubstitutes,
}: {
  attendanceBoard: AttendanceEntry[];
  attendanceSummary: { backups: number; confirmed: number; declined: number };
  currentMatchId?: string;
  editable: boolean;
  lateDropAllowed: boolean;
  projectedStarters: number;
  projectedSubstitutes: number;
}) {
  return (
    <SectionCard eyebrow="Lista operativa" title="Jugadores de esta fecha" dark>
      <div className="mb-5 flex flex-wrap gap-2">
        <Pill tone="lime">{projectedStarters} titulares proyectados</Pill>
        <Pill tone="accent">{projectedSubstitutes} suplentes proyectados</Pill>
        <Pill>{attendanceSummary.declined} bajas</Pill>
      </div>

      {!currentMatchId ? (
        <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/78">
          No hay un partido activo para editar respuestas desde admin.
        </div>
      ) : !editable && lateDropAllowed ? (
        <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/78">
          La lista ya cerro para nuevas altas. Desde admin solo conviene marcar bajas tardias.
        </div>
      ) : !editable ? (
        <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/78">
          La lista queda congelada mientras la convocatoria no este abierta.
        </div>
      ) : null}

      <div className="space-y-3">
        {attendanceBoard.map((entry) => (
          <AttendanceRow
            key={`${entry.playerId ?? entry.name}-${entry.detail}`}
            entry={entry}
            editable={editable}
            lateDropAllowed={lateDropAllowed}
            matchId={currentMatchId}
          />
        ))}
      </div>
    </SectionCard>
  );
}
