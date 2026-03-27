"use client";

import { useEffect, useState } from "react";

import { Pill } from "@/components/ui";

function normalizeTime(isoTime?: string) {
  if (!isoTime) {
    return "19:00:00";
  }

  const trimmedTime = isoTime.trim();

  if (/^\d{2}:\d{2}$/.test(trimmedTime)) {
    return `${trimmedTime}:00`;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmedTime)) {
    return trimmedTime;
  }

  return "19:00:00";
}

function getTargetDate(isoDate?: string, isoTime?: string) {
  if (!isoDate) {
    return null;
  }

  const time = normalizeTime(isoTime);
  const parsedDate = new Date(`${isoDate}T${time}-03:00`);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatCountdown(targetDate: Date | null, now: number) {
  if (!targetDate) {
      return {
        days: "0",
        hours: "00",
        minutes: "00",
        seconds: "00",
        isLive: false,
      };
  }

  const diffMs = targetDate.getTime() - now;

  if (diffMs <= 0) {
    return {
      days: "0",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isLive: true,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isLive: false,
  };
}

export function MatchCountdown({
  isoDate,
  isoTime,
  compact = false,
}: {
  isoDate?: string;
  isoTime?: string;
  compact?: boolean;
}) {
  const targetDate = getTargetDate(isoDate, isoTime);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const initialTimeoutId = window.setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const countdown = formatCountdown(targetDate, now ?? 0);

  if (compact) {
    return (
      <div className="rounded-[1.4rem] border border-white/12 bg-[#183823] p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-white/60">
              Cuenta regresiva
            </p>
            <p className="mt-2 text-sm text-white/72">
              {countdown.isLive ? "La fecha ya esta en juego." : "Faltan pocos toques para arrancar."}
            </p>
          </div>
          <Pill tone={countdown.isLive ? "lime" : "accent"}>
            {countdown.isLive ? "En juego" : "Ticking"}
          </Pill>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="rounded-[1rem] bg-white/8 p-3 text-center">
            <p className="text-2xl font-black">{countdown.days}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/56">Dias</p>
          </div>
          <div className="rounded-[1rem] bg-white/8 p-3 text-center">
            <p className="text-2xl font-black">{countdown.hours}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/56">Horas</p>
          </div>
          <div className="rounded-[1rem] bg-white/8 p-3 text-center">
            <p className="text-2xl font-black">{countdown.minutes}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/56">Min</p>
          </div>
          <div className="rounded-[1rem] bg-white/8 p-3 text-center">
            <p className="text-2xl font-black text-lime">{countdown.seconds}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-white/56">Seg</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
            Cuenta regresiva
          </p>
          <p className="mt-2 text-sm text-muted">
            Tiempo restante hasta que arranque la fecha.
          </p>
        </div>
        <Pill tone={countdown.isLive ? "lime" : "default"}>
          {countdown.isLive ? "En juego" : "Proximo turno"}
        </Pill>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[1.2rem] border border-lime/20 bg-lime/[0.08] p-4 text-center">
          <p className="text-3xl font-black">{countdown.days}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Dias</p>
        </div>
        <div className="rounded-[1.2rem] border border-star-blue/20 bg-star-blue/[0.08] p-4 text-center">
          <p className="text-3xl font-black">{countdown.hours}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Horas</p>
        </div>
        <div className="rounded-[1.2rem] border border-accent/20 bg-accent/[0.08] p-4 text-center">
          <p className="text-3xl font-black">{countdown.minutes}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Min</p>
        </div>
        <div className="rounded-[1.2rem] border border-white/[0.1] bg-white/[0.06] p-4 text-center">
          <p className="text-3xl font-black text-accent">{countdown.seconds}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">Seg</p>
        </div>
      </div>
    </div>
  );
}
