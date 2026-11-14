export interface ClimateSummary {
  temperature: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationTotal: number | null;
  humidity: number | null;
  solarRadiation: number | null;
  validDays: number;
  monthly: Record<number, MonthlyClimateSummary>;
  startDate: string;
  endDate: string;
  source: "NASA POWER";
}

export interface MonthlyClimateSummary {
  temperature: number | null;
  precipitationTotal: number | null;
  validDays: number;
}

type PowerResponse = {
  properties?: {
    parameter?: Record<string, Record<string, number>>;
  };
};

const API_URL = "https://power.larc.nasa.gov/api/temporal/daily/point";

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getValidValues(series: Record<string, number> | undefined): number[] {
  if (!series) return [];

  return Object.values(series).filter(
    (value) =>
      typeof value === "number" && Number.isFinite(value) && value !== -999,
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function sum(values: number[]): number | null {
  if (values.length === 0) return null;

  return values.reduce((total, value) => total + value, 0);
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getMonthlySummaries(
  temperatureSeries: Record<string, number> | undefined,
  precipitationSeries: Record<string, number> | undefined,
): Record<number, MonthlyClimateSummary> {
  const grouped: Record<
    number,
    { temperatures: number[]; precipitation: number[] }
  > = {};

  for (const [date, temperature] of Object.entries(temperatureSeries ?? {})) {
    if (!/^\d{8}$/.test(date) || !Number.isFinite(temperature) || temperature === -999) {
      continue;
    }

    const month = Number(date.slice(4, 6));
    grouped[month] ??= { temperatures: [], precipitation: [] };
    grouped[month].temperatures.push(temperature);
  }

  for (const [date, precipitation] of Object.entries(precipitationSeries ?? {})) {
    if (!/^\d{8}$/.test(date) || !Number.isFinite(precipitation) || precipitation === -999) {
      continue;
    }

    const month = Number(date.slice(4, 6));
    grouped[month] ??= { temperatures: [], precipitation: [] };
    grouped[month].precipitation.push(precipitation);
  }

  return Object.fromEntries(
    Object.entries(grouped).map(([month, values]) => [
      Number(month),
      {
        temperature: average(values.temperatures),
        precipitationTotal: sum(values.precipitation),
        validDays: values.temperatures.length,
      },
    ]),
  );
}

export async function getClimateData(
  latitude: number,
  longitude: number,
): Promise<ClimateSummary> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("The field coordinates are invalid.");
  }

  // Leave a three-day buffer to avoid incomplete data.
  const end = new Date();
  end.setDate(end.getDate() - 3);

  const start = new Date(end);
  start.setDate(start.getDate() - 364);

  const parameters = [
    "T2M",
    "T2M_MAX",
    "T2M_MIN",
    "PRECTOTCORR",
    "RH2M",
    "ALLSKY_SFC_SW_DWN",
  ].join(",");

  const query = [
    `parameters=${parameters}`,
    "community=AG",
    `longitude=${longitude}`,
    `latitude=${latitude}`,
    `start=${formatDate(start)}`,
    `end=${formatDate(end)}`,
    "format=JSON",
    "time-standard=UTC",
  ].join("&");

  const response = await fetch(`${API_URL}?${query}`);

  if (!response.ok) {
    throw new Error(`NASA POWER returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as PowerResponse;
  const series = data.properties?.parameter;

  if (!series) {
    throw new Error("NASA POWER returned no data for this location.");
  }

  const temperature = getValidValues(series.T2M);
  const temperatureMax = getValidValues(series.T2M_MAX);
  const temperatureMin = getValidValues(series.T2M_MIN);
  const precipitation = getValidValues(series.PRECTOTCORR);
  const humidity = getValidValues(series.RH2M);
  const radiation = getValidValues(series.ALLSKY_SFC_SW_DWN);

  const validDays = temperature.length;

  if (validDays === 0) {
    throw new Error(
      "No valid climate data was found for this location.",
    );
  }

  return {
    temperature: average(temperature),
    temperatureMax: average(temperatureMax),
    temperatureMin: average(temperatureMin),
    precipitationTotal: sum(precipitation),
    humidity: average(humidity),
    solarRadiation: average(radiation),
    validDays,
    monthly: getMonthlySummaries(series.T2M, series.PRECTOTCORR),
    startDate: formatDisplayDate(start),
    endDate: formatDisplayDate(end),
    source: "NASA POWER",
  };
}
