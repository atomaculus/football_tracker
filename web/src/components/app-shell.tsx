import Link from "next/link";
import { ReactNode } from "react";

import { navItems, nextMatch } from "@/lib/mock-data";

type AppShellProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  return (
    <main className="grain min-h-screen px-4 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="card-shadow overflow-hidden rounded-[2rem] border border-line bg-surface">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-muted">
                <span className="rounded-full bg-lime px-3 py-1 text-foreground">
                  Football Tracker
                </span>
                <span>2 admins</span>
                <span>7v7</span>
                <span>Fallback 6v6</span>
              </div>
              <h1 className="mt-5 text-4xl font-black sm:text-5xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                {subtitle}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-line bg-surface-strong p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                      Proximo partido
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">
                      {nextMatch.dateLabel}
                    </h2>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    {nextMatch.status}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#f1ead8] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Confirmados
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.confirmed}</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7ddc9] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Suplentes
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.substitutes}</p>
                  </div>
                  <div className="rounded-2xl bg-[#dae8db] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Faltan
                    </p>
                    <p className="mt-1 text-3xl font-black">{nextMatch.missing}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <nav className="card-shadow sticky top-4 z-10 overflow-x-auto rounded-[1.6rem] border border-line bg-surface/95 px-3 py-3 backdrop-blur">
          <div className="flex min-w-max gap-2">
            {navItems.map((item) => (
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
