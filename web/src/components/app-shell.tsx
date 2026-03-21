import Link from "next/link";
import { ReactNode } from "react";

import { logoutAction } from "@/app/login/actions";
import { navItemsSeed, nextMatchSeed } from "@/lib/seed-data";
import type { ViewerSession } from "@/lib/auth";
import type { NavItem, NextMatch } from "@/types/domain";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  navItems?: NavItem[];
  nextMatch?: NextMatch;
  viewer?: ViewerSession | null;
};

export function AppShell({
  children,
  title,
  subtitle,
  navItems = navItemsSeed,
  nextMatch = nextMatchSeed,
  viewer = null,
}: AppShellProps) {
  const filteredNavItems = navItems.filter((item) => item.href !== "/admin" || viewer?.isAdmin);

  return (
    <main className="grain min-h-screen px-3 py-4 sm:px-5 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="sticky top-3 z-40">
          <div className="card-shadow rounded-[1.6rem] border border-white/40 bg-[rgba(249,252,246,0.84)] px-4 py-3 backdrop-blur xl:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <span className="fixture-kicker shrink-0 rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em]">
                  La Fecha
                </span>
                {viewer ? (
                  <span className="truncate rounded-full bg-[#efe7d5] px-3 py-1 text-xs font-semibold text-foreground">
                    {viewer.playerName}
                    {viewer.isAdmin ? " · admin" : ""}
                  </span>
                ) : null}
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                {viewer ? (
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-full border border-line bg-background/40 px-4 py-2 text-sm font-semibold transition hover:border-foreground"
                    >
                      Cerrar sesion
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full border border-line bg-background/40 px-4 py-2 text-sm font-semibold transition hover:border-foreground"
                  >
                    Iniciar sesion
                  </Link>
                )}
              </div>

              <details className="relative lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-center rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground">
                  Menu
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 min-w-64 rounded-[1.4rem] border border-white/30 bg-[rgba(250,252,247,0.96)] p-3 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur">
                  <div className="flex flex-col gap-2">
                    <div className="rounded-[1rem] border border-line bg-surface-strong px-3 py-3 text-sm">
                      <p className="font-extrabold text-foreground">{nextMatch.dateLabel}</p>
                      <p className="mt-1 text-muted">
                        {nextMatch.timeLabel} · {nextMatch.venue}
                      </p>
                    </div>
                    {filteredNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-[1rem] border border-line bg-surface-strong px-3 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                    {viewer ? (
                      <form action={logoutAction}>
                        <button
                          type="submit"
                          className="w-full rounded-[1rem] border border-line bg-background/40 px-3 py-3 text-left text-sm font-semibold transition hover:border-foreground"
                        >
                          Cerrar sesion
                        </button>
                      </form>
                    ) : (
                      <Link
                        href="/login"
                        className="rounded-[1rem] border border-line bg-background/40 px-3 py-3 text-sm font-semibold transition hover:border-foreground"
                      >
                        Iniciar sesion
                      </Link>
                    )}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <header className="hero-shell card-shadow overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,rgba(250,253,248,0.86),rgba(236,243,235,0.8))]">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-muted sm:gap-3">
                <span>La Fecha</span>
                <span>7v7</span>
                <span>Fallback 6v6</span>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.95] sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                {subtitle}
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="glass-panel rounded-[1.6rem] border border-white/40 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                      Proximo partido
                    </p>
                    <h2 className="mt-2 text-xl font-extrabold sm:text-2xl">{nextMatch.dateLabel}</h2>
                    <p className="mt-2 text-sm text-muted">
                      {nextMatch.timeLabel} · {nextMatch.venue}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white">
                    {nextMatch.status}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-white/60 bg-[#f4f8ed] p-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      Confirmados
                    </p>
                    <p className="mt-1 text-2xl font-black sm:text-3xl">{nextMatch.confirmed}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-[#f8e3d6] p-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      Suplentes
                    </p>
                    <p className="mt-1 text-2xl font-black sm:text-3xl">{nextMatch.substitutes}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-[#e1eddc] p-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                      Faltan
                    </p>
                    <p className="mt-1 text-2xl font-black sm:text-3xl">{nextMatch.missing}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
