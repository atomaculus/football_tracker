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
      className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-surface-dark disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-line bg-surface-strong p-4">
        <p className="text-sm leading-6 text-muted">
          Login simple para el MVP. Mas adelante se puede migrar a OTP o magic link.
        </p>
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
  );
}
