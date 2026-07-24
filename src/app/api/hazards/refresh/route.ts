import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchWeather } from "@/lib/openMeteo";
import { classifyHazard } from "@/lib/hazardRules";
import { SEED_LOCATIONS } from "@/lib/locations";

export const dynamic = "force-dynamic";

const HAZARD_FOCUS_BY_NAME = Object.fromEntries(
  SEED_LOCATIONS.map((l) => [`${l.name}|${l.ward}`, l.hazardFocus])
);

/**
 * Pulls real current weather for every seeded location, applies the rule-based
 * hazard thresholds, and persists a HazardSignal per location. Skips creating a
 * duplicate signal if the same type+severity was already recorded in the last hour
 * (avoids demo-click spam while still reflecting real, live data on each refresh).
 */
export async function POST() {
  const locations = await prisma.location.findMany();
  if (locations.length === 0) {
    return NextResponse.json(
      { error: "No locations seeded yet. Run `npm run db:seed` first." },
      { status: 400 }
    );
  }

  const results = [];
  for (const location of locations) {
    const focus = HAZARD_FOCUS_BY_NAME[`${location.name}|${location.ward}`];
    if (!focus) continue;

    try {
      const weather = await fetchWeather(location.lat, location.lng);
      const assessment = classifyHazard(focus, weather);

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recent = await prisma.hazardSignal.findFirst({
        where: {
          locationId: location.id,
          type: assessment.type,
          severity: assessment.severity,
          observedAt: { gte: oneHourAgo },
        },
      });

      if (recent) {
        results.push({ location: location.name, skipped: true, signal: recent });
        continue;
      }

      const signal = await prisma.hazardSignal.create({
        data: {
          type: assessment.type,
          severity: assessment.severity,
          locationId: location.id,
          rawData: weather as unknown as object,
          source: "Open-Meteo (api.open-meteo.com)",
          summary: assessment.summary,
        },
      });

      results.push({ location: location.name, skipped: false, signal });
    } catch (err) {
      results.push({
        location: location.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ results });
}

export async function GET() {
  const signals = await prisma.hazardSignal.findMany({
    orderBy: { observedAt: "desc" },
    take: 50,
    include: { location: true },
  });
  return NextResponse.json({ signals });
}
