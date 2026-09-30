import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, data: { status: "healthy" } });
  } catch {
    // Envelope contract: failures use { ok: false, error } like every other
    // route (remediated from a data-shaped variance — see
    // docs/findings_to_validate_and_update.md).
    return NextResponse.json(
      { ok: false, error: "unhealthy" },
      { status: 503 },
    );
  }
}
