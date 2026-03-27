import { NextRequest, NextResponse } from "next/server";

import { ensureMatchClosureIfNeeded, ensureMatchOpeningIfNeeded } from "@/lib/match-operations";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 },
    );
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable." }, { status: 500 });
  }

  const [{ data: scheduledMatches, error: scheduledError }, { data: openMatches, error: openError }] =
    await Promise.all([
      supabase.from("matches").select("id").eq("status", "scheduled"),
      supabase.from("matches").select("id").eq("status", "open"),
    ]);

  if (scheduledError || openError) {
    return NextResponse.json(
      { error: "Could not fetch scheduled or open matches." },
      { status: 500 },
    );
  }

  let opened = 0;
  let closed = 0;
  const details: string[] = [];

  for (const match of scheduledMatches ?? []) {
    const result = await ensureMatchOpeningIfNeeded(supabase, match.id);

    if (result.error) {
      details.push(result.message ?? `Error opening match ${match.id}.`);
      continue;
    }

    if (result.match?.status === "open") {
      opened += 1;
      if (result.message) {
        details.push(result.message);
      }
    }
  }

  for (const match of openMatches ?? []) {
    const result = await ensureMatchClosureIfNeeded(supabase, match.id);

    if (result.error) {
      details.push(result.message ?? `Error closing match ${match.id}.`);
      continue;
    }

    if (result.match?.status === "closed") {
      closed += 1;
      if (result.message) {
        details.push(result.message);
      }
    }
  }

  return NextResponse.json({
    checked: (scheduledMatches?.length ?? 0) + (openMatches?.length ?? 0),
    closed,
    opened,
    details,
    ok: true,
  });
}
