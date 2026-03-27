import { ReactNode } from "react";

export function SectionCard({
  eyebrow,
  title,
  children,
  dark = false,
  collapsible = false,
  defaultOpen = true,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const cardClassName = `card-shadow stadium-divider rounded-[2rem] border p-6 ${
    dark
      ? "dark-panel border-white/10 text-white"
      : "glass-panel border-line text-foreground"
  }`;
  const eyebrowClassName = `text-xs font-bold uppercase tracking-[0.24em] ${
    dark ? "text-white/60" : "text-muted"
  }`;

  if (collapsible) {
    return (
      <details open={defaultOpen} className={`group ${cardClassName}`}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
          <div>
            <p className={eyebrowClassName}>{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black">{title}</h2>
          </div>
          <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-muted transition group-open:rotate-180">
            ▼
          </span>
        </summary>
        <div className="mt-6">{children}</div>
      </details>
    );
  }

  return (
    <article className={cardClassName}>
      <p className={eyebrowClassName}>
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-black">{title}</h2>
      <div className="mt-6">{children}</div>
    </article>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "lime" | "accent";
}) {
  const tones = {
    default: "bg-white/[0.08] text-foreground border border-white/[0.1]",
    lime: "bg-lime/20 text-lime border border-lime/30",
    accent: "bg-accent/20 text-accent border border-accent/30",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
