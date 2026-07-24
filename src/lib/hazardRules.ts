import type { WeatherReport } from "@/lib/openMeteo";
import type { HazardFocus } from "@/lib/locations";

export type HazardType = "FLOOD" | "DROUGHT" | "EXTREME_HEAT" | "STORM";
export type Severity = "WATCH" | "WARNING" | "EMERGENCY";

export interface HazardAssessment {
  type: HazardType;
  severity: Severity;
  summary: string;
}

/**
 * Rule-based hazard classification from real Open-Meteo readings. This is deliberately
 * NOT an AI call - it's a transparent, auditable threshold layer, documented as such
 * per the hackathon's data-transparency requirement. The AI layer (lib/groq.ts) only
 * ever translates an already-classified hazard into plain language; it never invents
 * the hazard itself.
 */
export function classifyHazard(focus: HazardFocus, weather: WeatherReport): HazardAssessment {
  if (focus === "FLOOD") return classifyFlood(weather);
  if (focus === "DROUGHT") return classifyDrought(weather);
  return classifyHeat(weather);
}

function classifyFlood(w: WeatherReport): HazardAssessment {
  const p = w.forecastPrecipitation3d;
  const severity: Severity = p >= 80 ? "EMERGENCY" : p >= 40 ? "WARNING" : "WATCH";
  return {
    type: "FLOOD",
    severity,
    summary: `${p.toFixed(0)}mm of rain forecast over the next 3 days`,
  };
}

function classifyDrought(w: WeatherReport): HazardAssessment {
  const p = w.trailingPrecipitation14d;
  const severity: Severity = p <= 2 ? "EMERGENCY" : p <= 8 ? "WARNING" : "WATCH";
  return {
    type: "DROUGHT",
    severity,
    summary: `Only ${p.toFixed(1)}mm of rain in the past 14 days`,
  };
}

function classifyHeat(w: WeatherReport): HazardAssessment {
  const t = w.forecastTemperatureMax;
  const severity: Severity = t >= 40 ? "EMERGENCY" : t >= 37 ? "WARNING" : "WATCH";
  return {
    type: "EXTREME_HEAT",
    severity,
    summary: `Forecast high of ${t.toFixed(0)}°C in the next 3 days`,
  };
}
