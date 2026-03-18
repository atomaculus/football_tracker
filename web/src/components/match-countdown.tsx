"use client";

import { useEffect, useMemo, useState } from "react";

function getTargetTime(isoDate?: string, isoTime?: string) {
  if (!isoDate) {
    return null;
  }

  const safeTime = isoTime ?? "19:00:00";
  return new Date(`${isoDate}T${safeTime}-03:00`);
}

function getCountdownParts(targetTime: Date, now: number) {
  const diff = targetTime.getTime() - now;

  if (diff <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function MatchCountdown({
  isoDate,
  isoTime,
}: {
  isoDate?: string;
  isoTime?: string;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const parts = useMemo(() => {
    const targetTime = getTargetTime(isoDate, isoTime);
    if (!targetTime) {
      return null;
    }

    return getCountdownParts(targetTime, now);
  }, [isoDate, isoTime, now]);

  if (!parts) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line bg-background/40 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
          Countdown
        </p>
        <p className="mt-2 text-lg font-black">La fecha ya arranco o no tiene horario.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-line bg-[#13261c] p-4 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
        Countdown
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[1.2rem] bg-white/8 p-3 text-center">
          <p className="display text-4xl text-lime">{parts.days}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">Dias</p>
        </div>
        <div className="rounded-[1.2rem] bg-white/8 p-3 text-center">
          <p className="display text-4xl text-lime">{parts.hours}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">Horas</p>
        </div>
        <div className="rounded-[1.2rem] bg-white/8 p-3 text-center">
          <p className="display text-4xl text-lime">{parts.minutes}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/60">Min</p>
        </div>
      </div>
    </div>
  );
}
