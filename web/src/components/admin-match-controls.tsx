"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateMatchStatus } from "@/app/admin/actions";
import { SectionCard } from "@/components/ui";
import type { NextMatch } from "@/types/domain";

const initialMatchAdminActionState = {
  message: "",
  status: "idle",
} as const;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-surface-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Actualizar estado"}
    </button>
  );
}

export function AdminMatchControls({ currentMatch }: { currentMatch: NextMatch }) {
  const [actionState, formAction] = useActionState(
    updateMatchStatus,
    initialMatchAdminActionState,
  );

  return (
    <SectionCard eyebrow="Estado real" title="Control del partido">
      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="matchId" value={currentMatch.id ?? ""} />

        <div className="rounded-[1.5rem] border border-line bg-surface-strong p-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Partido actual
          </p>
          <p className="mt-2 text-2xl font-black">
            {currentMatch.dateLabel} {" · "} {currentMatch.timeLabel}
          </p>
          <p className="mt-2 text-sm text-muted">{currentMatch.venue}</p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Estado
          </span>
          <select
            name="status"
            defaultValue={currentMatch.rawStatus ?? "scheduled"}
            className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-base font-semibold outline-none transition focus:border-foreground"
          >
            <option value="scheduled">Programado</option>
            <option value="open">Convocatoria abierta</option>
            <option value="closed">Lista cerrada</option>
            <option value="suspended">Partido suspendido</option>
            <option value="played">Partido jugado</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Nota o motivo
          </span>
          <textarea
            name="notes"
            defaultValue={currentMatch.notes ?? ""}
            rows={4}
            className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-sm leading-6 outline-none transition focus:border-foreground"
            placeholder="Ejemplo: se suspende por lluvia o se cierra la lista por cupo completo."
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
              Estado visible
            </p>
            <p className="mt-2 text-lg font-extrabold">{currentMatch.status}</p>
          </div>
          <SubmitButton />
        </div>

        {actionState.status !== "idle" ? (
          <div
            className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
              actionState.status === "success"
                ? "border-lime bg-[#dae8db] text-foreground"
                : actionState.status === "demo"
                  ? "border-line bg-[#f1ead8] text-foreground"
                  : "border-accent/40 bg-[#f7ddc9] text-foreground"
            }`}
          >
            {actionState.message}
          </div>
        ) : null}
      </form>
    </SectionCard>
  );
}
