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
    <main className="grain min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="hero-shell card-shadow overflow-hidden rounded-[2.4rem] border border-white/20 bg-[linear-gradient(180deg,rgba(250,253,248,0.86),rgba(236,243,235,0.8))]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-muted">
                <span className="fixture-kicker rounded-full px-3 py-1">
                  Football Tracker
                </span>
                <span>2 admins</span>
                <span>7v7</span>
                <span>Fallback 6v6</span>
                {viewer ? (
                  <span className="rounded-full bg-[#efe7d5] px-3 py-1 text-foreground">
                    {viewer.playerName}
                    {viewer.isAdmin ? " · admin" : ""}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                {subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {filteredNavItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="glass-panel rounded-[1.8rem] border border-white/40 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                      Proximo partido
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">
                      {nextMatch.dateLabel}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {nextMatch.timeLabel} · {nextMatch.venue}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    {nextMatch.status}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/60 bg-[#f4f8ed] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Confirmados
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.confirmed}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-[#f8e3d6] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Suplentes
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.substitutes}</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-[#e1eddc] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Faltan
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.missing}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
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
              </div>
            </div>
          </div>
        </header>

        <nav className="card-shadow sticky top-4 z-10 overflow-x-auto rounded-[1.6rem] border border-white/30 bg-[rgba(250,252,247,0.72)] px-3 py-3 backdrop-blur">
          <div className="flex min-w-max gap-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-line bg-surface-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {children}
      </div>
    </main>
  );
}
