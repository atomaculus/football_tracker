"use client";

import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { availabilityOptions, nextMatch } from "@/lib/mock-data";

export default function ConfirmPage() {
  const [selected, setSelected] = useState("Voy");
  const selectedOption = availabilityOptions.find((option) => option.label === selected);

  return (
    <AppShell
      title="Confirmar asistencia"
      subtitle="Pantalla pensada para que cada jugador resuelva en segundos si va, no va o queda como suplente para el martes."
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Respuesta semanal" title="Elegi tu estado">
          <div className="grid gap-3">
            {availabilityOptions.map((option) => {
              const isSelected = selected === option.label;
              const selectedStyle =
                option.tone === "accent"
                  ? "border-accent bg-accent text-white"
                  : option.tone === "lime"
                    ? "border-lime bg-[#20422f] text-white"
                    : "border-foreground bg-foreground text-white";

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setSelected(option.label)}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${
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
                      {isSelected ? "Seleccionado" : option.tone}
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

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Respuesta actual
              </p>
              <p className="mt-2 text-lg font-extrabold">{selected}</p>
            </div>
            <button
              type="button"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              Guardar respuesta
            </button>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Contexto" title="Como impacta tu respuesta" dark>
          <div className="space-y-4 text-sm leading-6 text-white/78">
            <p>
              Si respondes temprano, el admin ve mejor la lista real y puede cerrar titulares
              y suplentes sin usar el Excel.
            </p>
            <p>
              Si te bajas tarde, el sistema puede aplicar penalizacion y dejar el motivo
              registrado para esa fecha.
            </p>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Estado elegido
              </p>
              <p className="mt-2 text-lg font-extrabold">{selected}</p>
              <p className="mt-1 text-white/70">{selectedOption?.description}</p>
              <p className="mt-3 text-white/70">
                {nextMatch.dateLabel} · {nextMatch.timeLabel} · {nextMatch.venue}
              </p>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
