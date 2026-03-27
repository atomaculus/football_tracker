"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  overrideLaundryAssignmentByAdmin,
  type LaundryAdminActionState,
} from "@/app/admin/actions";
import { Pill } from "@/components/ui";
import type { MatchParticipantEntry } from "@/types/domain";

const initialLaundryAdminActionState: LaundryAdminActionState = {
  message: "",
  status: "idle",
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-full bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0a0f1c] transition hover:bg-accent-strong sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando" : "Aplicar override"}
    </button>
  );
}

export function AdminLaundryOverrideManager({
  currentMatchId,
  currentAssigneeName,
  participants,
}: {
  currentMatchId?: string;
  currentAssigneeName: string;
  participants: MatchParticipantEntry[];
}) {
  const [actionState, formAction] = useActionState(
    overrideLaundryAssignmentByAdmin,
    initialLaundryAdminActionState,
  );

  const eligibleParticipants = participants.filter((participant) =>
    participant.attendanceStatus === "played" || participant.attendanceStatus === "confirmed",
  );

  return (
    <form action={formAction} className="mt-5 grid gap-4 rounded-[1.4rem] border border-line bg-background/40 p-4">
      <input type="hidden" name="matchId" value={currentMatchId ?? ""} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Override manual
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Si las camisetas no se las lleva el asignado automatico, reasignalas desde aca.
          </p>
        </div>
        <Pill>{currentAssigneeName}</Pill>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          name="playerId"
          defaultValue=""
          disabled={!currentMatchId || !eligibleParticipants.length}
          className="w-full rounded-[1rem] border border-white/[0.1] bg-[#101a2b] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-accent/40 sm:min-w-[16rem] sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="" className="bg-[#101a2b] text-white">
            Elegir jugador
          </option>
          {eligibleParticipants.map((participant) => (
            <option
              key={participant.playerId}
              value={participant.playerId}
              className="bg-[#101a2b] text-white"
            >
              {participant.name}
            </option>
          ))}
        </select>
        <SubmitButton disabled={!currentMatchId || !eligibleParticipants.length} />
      </div>

      {actionState.status !== "idle" ? (
        <div
          className={`rounded-[1rem] border px-4 py-3 text-sm leading-6 ${
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
