"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitAvailabilityResponse } from "@/app/confirmar/actions";
import { Pill, SectionCard } from "@/components/ui";
import type {
  AttendanceEntry,
  AttendanceSummary,
  AvailabilityOption,
  ClusterPlayer,
  NextMatch,
} from "@/types/domain";

const initialAvailabilityActionState = {
  message: "",
  status: "idle",
} as const;

function SubmitButton({
  disabled,
  mode,
}: {
  disabled: boolean;
  mode: "demo" | "supabase";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Guardando..."
        : mode === "supabase"
          ? "Guardar respuesta"
          : "Probar flujo"}
    </button>
  );
}

export function AvailabilityForm({
  attendanceBoard,
  attendanceSummary,
  availabilityOptions,
  currentMatch,
  currentPlayer,
  lateDropAllowed,
  matchId,
  matchNotes,
  matchStatus,
  mode,
  players,
  submissionsOpen,
}: {
  attendanceBoard: AttendanceEntry[];
  attendanceSummary: AttendanceSummary;
  availabilityOptions: AvailabilityOption[];
  currentMatch: NextMatch;
  currentPlayer?: ClusterPlayer;
  lateDropAllowed: boolean;
  matchId: string;
  matchNotes?: string;
  matchStatus: string;
  mode: "demo" | "supabase";
  players: ClusterPlayer[];
  submissionsOpen: boolean;
}) {
  const [selectedResponse, setSelectedResponse] = useState(
    availabilityOptions[0]?.value ?? "going",
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState(currentPlayer?.id ?? players[0]?.id ?? "");
  const [actionState, formAction] = useActionState(
    submitAvailabilityResponse,
    initialAvailabilityActionState,
  );

  const selectedOption = availabilityOptions.find(
    (option) => option.value === selectedResponse,
  );
  const canEditResponse =
    submissionsOpen || (lateDropAllowed && selectedResponse === "not_going");
  const statusTone =
    currentMatch.rawStatus === "open"
      ? "lime"
      : currentMatch.rawStatus === "suspended"
        ? "accent"
        : "default";
  const statusMessage = submissionsOpen
    ? currentMatch.signupClosesLabel
      ? `La convocatoria esta abierta. Se cierra automaticamente ${currentMatch.signupClosesLabel}, una hora y media antes del partido.`
      : "La convocatoria esta abierta y cualquier cambio impacta en la lista del martes."
    : lateDropAllowed
      ? "La lista ya quedo cerrada para nuevas altas, pero si surge una urgencia todavia podes darte de baja y el primer suplente disponible entra automaticamente."
    : currentMatch.rawStatus === "suspended"
      ? "La fecha esta suspendida. El admin puede dejar una nota, pero no se aceptan nuevas respuestas."
      : "La lista esta cerrada por horario o por decision del admin. Ya no se aceptan respuestas nuevas.";

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <SectionCard eyebrow="Respuesta semanal" title="Elegi tu estado">
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="matchId" value={matchId} />
          <input type="hidden" name="response" value={selectedResponse} />
          {currentPlayer ? <input type="hidden" name="playerId" value={currentPlayer.id} /> : null}

          {currentPlayer ? (
            <div className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Jugador autenticado
              </p>
              <p className="mt-2 text-lg font-extrabold">
                {currentPlayer.name} {" · "} {currentPlayer.role}
              </p>
            </div>
          ) : (
            <label className="grid gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Jugador
              </span>
              <select
                name="playerId"
                value={selectedPlayerId}
                onChange={(event) => setSelectedPlayerId(event.target.value)}
                disabled={!submissionsOpen && !lateDropAllowed}
                className="rounded-[1.2rem] border border-line bg-surface-strong px-4 py-4 text-base font-semibold outline-none transition focus:border-foreground disabled:cursor-not-allowed disabled:opacity-70"
              >
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} {" · "} {player.role}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-3">
            {availabilityOptions.map((option) => {
              const isSelected = selectedResponse === option.value;
              const selectedStyle =
                option.tone === "accent"
                  ? "border-accent bg-accent text-white"
                  : option.tone === "lime"
                    ? "border-lime bg-[#20422f] text-white"
                    : "border-foreground bg-foreground text-white";

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={!submissionsOpen && option.value !== "not_going"}
                  onClick={() => setSelectedResponse(option.value)}
                  className={`rounded-[1.5rem] border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                    isSelected
                      ? selectedStyle
                      : "border-line bg-surface-strong hover:border-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-black">{option.label}</h3>
                    <Pill
                      tone={
                        option.tone === "lime"
                          ? "lime"
                          : option.tone === "accent"
                            ? "accent"
                            : "default"
                      }
                    >
                      {isSelected ? "Seleccionado" : option.label}
                    </Pill>
                  </div>
                  <p
                    className={`mt-3 max-w-xl text-sm leading-6 ${
                      isSelected ? "text-white/80" : "text-muted"
                    }`}
                  >
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                {submissionsOpen ? "Respuesta actual" : "Cambio permitido"}
              </p>
              <p className="mt-2 text-lg font-extrabold">{selectedOption?.label}</p>
            </div>
            <SubmitButton disabled={!canEditResponse} mode={mode} />
          </div>

          {!submissionsOpen && lateDropAllowed ? (
            <div className="rounded-[1.2rem] border border-[#d96d2d]/30 bg-[#f7ddc9] px-4 py-3 text-sm leading-6 text-foreground">
              La convocatoria ya cerro. Desde aca solo se permite marcar `No voy` para registrar una baja tardia.
            </div>
          ) : null}

          {!submissionsOpen && !lateDropAllowed ? (
            <div className="rounded-[1.2rem] border border-accent/40 bg-[#f7ddc9] px-4 py-3 text-sm leading-6 text-foreground">
              {matchStatus === "Partido suspendido"
                ? "La fecha esta suspendida. No se aceptan respuestas nuevas."
                : "La convocatoria ya esta cerrada. El admin puede reabrirla manualmente si hace falta."}
            </div>
          ) : null}

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

      <SectionCard eyebrow="Contexto" title="Como impacta tu respuesta" dark>
        <div className="space-y-4 text-sm leading-6 text-white/78">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                  Estado del partido
                </p>
                <p className="mt-2 text-2xl font-black">
                  {currentMatch.dateLabel} {" · "} {currentMatch.timeLabel}
                </p>
                <p className="mt-1 text-sm text-white/60">{currentMatch.venue}</p>
              </div>
              <Pill tone={statusTone}>{matchStatus}</Pill>
            </div>
            <p className="mt-4 text-white/78">{statusMessage}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Confirmados
              </p>
              <p className="mt-2 text-3xl font-black">{attendanceSummary.confirmed}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Suplentes
              </p>
              <p className="mt-2 text-3xl font-black">{attendanceSummary.backups}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                No van
              </p>
              <p className="mt-2 text-3xl font-black">{attendanceSummary.declined}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Faltan para el ideal
              </p>
              <p className="mt-2 text-3xl font-black">{currentMatch.missing}</p>
            </div>
          </div>

          <p>
            Esta pantalla ya toma el jugador autenticado y guarda la respuesta sobre esa
            identidad. El selector libre queda solo como fallback de desarrollo.
          </p>
          <p>
            {mode === "supabase"
              ? "Esta instancia ya esta lista para guardar respuestas en la base y refrescar el tablero."
              : "Ahora mismo sigue en modo demo. La persistencia queda activada apenas carguemos las variables publicas de Supabase."}
          </p>
          {matchNotes ? (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Nota del admin
              </p>
              <p className="mt-2 text-white/80">{matchNotes}</p>
            </div>
          ) : null}
          <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
              Respuestas recientes
            </p>
            <div className="mt-4 space-y-3">
              {attendanceBoard.map((entry) => (
                <div
                  key={`${entry.name}-${entry.detail}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3"
                >
                  <div>
                    <p className="font-extrabold">{entry.name}</p>
                    <p className="text-sm text-white/60">{entry.detail}</p>
                  </div>
                  <Pill>{entry.status}</Pill>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
