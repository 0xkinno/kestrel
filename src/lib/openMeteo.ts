const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export interface DailyWeather {
  date: string;
  precipitationSum: number;
  temperatureMax: number;
  windSpeedMax: number;
}

export interface WeatherReport {
  fetchedAt: string;
  daily: DailyWeather[];
  /** Sum of precipitation over the past 14 days - used for drought detection. */
  trailingPrecipitation14d: number;
  /** Sum of forecast precipitation over the next 3 days - used for flood detection. */
  forecastPrecipitation3d: number;
  forecastTemperatureMax: number;
  forecastWindSpeedMax: number;
}

/**
 * Real current + historical + forecast weather from Open-Meteo (no API key required).
 * past_days gives us recent history in the same call as the forecast, which is enough
 * for the rule-based hazard thresholds in hazardRules.ts.
 */
export async function fetchWeather(lat: number, lng: number): Promise<WeatherReport> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: "precipitation_sum,temperature_2m_max,windspeed_10m_max",
    timezone: "auto",
    past_days: "14",
    forecast_days: "3",
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
    // Hazard data should reflect current conditions - never cache stale readings.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const dates: string[] = data.daily.time;
  const precip: number[] = data.daily.precipitation_sum;
  const tempMax: number[] = data.daily.temperature_2m_max;
  const wind: number[] = data.daily.windspeed_10m_max;

  const daily: DailyWeather[] = dates.map((date, i) => ({
    date,
    precipitationSum: precip[i] ?? 0,
    temperatureMax: tempMax[i] ?? 0,
    windSpeedMax: wind[i] ?? 0,
  }));

  const today = daily.length - 3; // forecast_days=3 are the last 3 entries
  const trailing = daily.slice(0, today);
  const forecast = daily.slice(today);

  return {
    fetchedAt: new Date().toISOString(),
    daily,
    trailingPrecipitation14d: sum(trailing.map((d) => d.precipitationSum)),
    forecastPrecipitation3d: sum(forecast.map((d) => d.precipitationSum)),
    forecastTemperatureMax: Math.max(...forecast.map((d) => d.temperatureMax)),
    forecastWindSpeedMax: Math.max(...forecast.map((d) => d.windSpeedMax)),
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
