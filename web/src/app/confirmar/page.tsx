import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { availabilityOptions, nextMatch } from "@/lib/mock-data";

export default function ConfirmPage() {
  return (
    <AppShell
      title="Confirmar asistencia"
      subtitle="Pantalla pensada para que cada jugador resuelva en segundos si va, no va o queda como suplente para el martes."
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Respuesta semanal" title="Elegi tu estado">
          <div className="grid gap-3">
            {availabilityOptions.map((option) => (
              <button
                key={option.label}
                className="rounded-[1.5rem] border border-line bg-surface-strong p-5 text-left transition hover:border-foreground"
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
                    {option.tone}
                  </Pill>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                  {option.description}
                </p>
              </button>
            ))}
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
                Proximo partido
              </p>
              <p className="mt-2 text-lg font-extrabold">
                {nextMatch.dateLabel} · {nextMatch.timeLabel}
              </p>
              <p className="mt-1 text-white/70">{nextMatch.venue}</p>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
