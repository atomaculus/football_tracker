import { ReactNode } from "react";

export function SectionCard({
  eyebrow,
  title,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <article
      className={`card-shadow rounded-[2rem] border p-6 ${
        dark
          ? "border-white/10 bg-surface-dark text-white"
          : "border-line bg-surface text-foreground"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-[0.24em] ${
          dark ? "text-white/60" : "text-muted"
        }`}
      >
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
    default: "bg-[#e4ecd9] text-foreground",
    lime: "bg-lime text-foreground",
    accent: "bg-accent text-white",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
