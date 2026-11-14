export interface SoilGridsSummary {
  ph: number | null;
  clayPercent: number | null;
  sandPercent: number | null;
  siltPercent: number | null;
  organicCarbon: number | null;
  bulkDensity: number | null;
  depth: string;
  resolution: string;
  source: string;
}

interface SoilGridsLayer {
  name: string;
  unit_measure?: {
    d_factor?: number;
    target_units?: string;
  };
  depths?: {
    label: string;
    values?: {
      mean?: number;
    };
  }[];
}

interface SoilGridsResponse {
  properties?: {
    layers?: SoilGridsLayer[];
  };
}

const API_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query";
const DEPTH = "0-5cm";

function propertyValue(
  layers: SoilGridsLayer[],
  property: string,
): number | null {
  const layer = layers.find((item) => item.name === property);
  const rawValue = layer?.depths?.find((item) => item.label === DEPTH)?.values
    ?.mean;
  const divisor = layer?.unit_measure?.d_factor;

  if (
    typeof rawValue !== "number" ||
    !Number.isFinite(rawValue) ||
    typeof divisor !== "number" ||
    divisor <= 0
  ) {
    return null;
  }

  return rawValue / divisor;
}

export async function getSoilGridsData(
  latitude: number,
  longitude: number,
): Promise<SoilGridsSummary> {
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

  const query = new URLSearchParams({
    lon: String(longitude),
    lat: String(latitude),
    depth: DEPTH,
    value: "mean",
  });

  ["phh2o", "clay", "sand", "silt", "soc", "bdod"].forEach((property) =>
    query.append("property", property),
  );

  const response = await fetch(`${API_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`SoilGrids returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as SoilGridsResponse;
  const layers = data.properties?.layers;

  if (!layers?.length) {
    throw new Error("SoilGrids returned no soil properties for this location.");
  }

  return {
    ph: propertyValue(layers, "phh2o"),
    clayPercent: propertyValue(layers, "clay"),
    sandPercent: propertyValue(layers, "sand"),
    siltPercent: propertyValue(layers, "silt"),
    organicCarbon: propertyValue(layers, "soc"),
    bulkDensity: propertyValue(layers, "bdod"),
    depth: DEPTH,
    resolution: "250 m",
    source: "ISRIC SoilGrids 2.0",
  };
}