"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type LoginActionState } from "@/app/login/actions";
import type { ClusterPlayer } from "@/types/domain";

const initialLoginActionState: LoginActionState = {
  message: "",
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-[#0a0f1c] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function LoginForm({
  next,
  players,
}: {
  next: string;
  players: ClusterPlayer[];
}) {
  const [adminMode, setAdminMode] = useState(false);
  const [actionState, formAction] = useActionState(loginAction, initialLoginActionState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="adminMode" value={adminMode ? "true" : "false"} />

      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Jugador
        </span>
        <select
          name="playerId"
          defaultValue={players[0]?.id ?? ""}
          className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-base font-semibold outline-none transition focus:border-foreground"
        >
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name} {" · "} {player.role}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Codigo del grupo
        </span>
        <input
          type="password"
          name="accessCode"
          className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-base font-semibold outline-none transition focus:border-foreground"
          placeholder="Codigo compartido"
        />
      </label>

      <label className="flex items-center gap-3 rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-sm font-semibold">
        <input
          type="checkbox"
          checked={adminMode}
          onChange={(event) => setAdminMode(event.target.checked)}
          className="size-4"
        />
        Entrar en modo admin
      </label>

      {adminMode ? (
        <label className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Codigo admin
          </span>
          <input
            type="password"
            name="adminCode"
            className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-base font-semibold outline-none transition focus:border-foreground"
            placeholder="Codigo admin"
          />
        </label>
      ) : null}

      <div className="flex items-center justify-end gap-3 rounded-[1.5rem] border border-line bg-surface-strong p-4">
        <SubmitButton />
      </div>

      {actionState.status !== "idle" ? (
        <div
          className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-6 ${
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
