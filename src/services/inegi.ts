export interface InegiSoilSummary {
  soilName: string | null;
  soilCode: string | null;
  ph: number | null;
  organicMatterPercent: number | null;
  clayPercent: number | null;
  sandPercent: number | null;
  siltPercent: number | null;
  cartographicScale: string | null;
  source: string;
}

const LAYER_URL =
  "https://services7.arcgis.com/iEMmryaM5E3wkdnU/arcgis/rest/services/e3973a9a_6f47_11e8_a7aa_fa163ebcfa41/FeatureServer/0/query";

export async function getInegiSoil(
  latitude: number,
  longitude: number,
): Promise<InegiSoilSummary> {
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
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields:
      "CLAVE_WRB,Serie_I,Serie_II,PH,MO,Arcilla_pr,Arena_prc,Limo_prc",
    returnGeometry: "false",
    f: "json",
  });
  const response = await fetch(`${LAYER_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`INEGI returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as {
    error?: { message?: string };
    features?: {
      attributes?: Record<string, string | number | null>;
    }[];
  };
  const attributes = data.features?.[0]?.attributes;

  if (data.error || !attributes) {
    throw new Error(
      data.error?.message ??
        "The public INEGI soil layer does not cover this point.",
    );
  }

  const numeric = (value: string | number | null | undefined) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    soilName:
      String(attributes.Serie_II || attributes.Serie_I || "") || null,
    soilCode: String(attributes.CLAVE_WRB || "") || null,
    ph: numeric(attributes.PH),
    organicMatterPercent: numeric(attributes.MO),
    clayPercent: numeric(attributes.Arcilla_pr),
    sandPercent: numeric(attributes.Arena_prc),
    siltPercent: numeric(attributes.Limo_prc),
    cartographicScale: "1:250,000",
    source: "INEGI/CIAT soil unit map, 1:250,000 scale",
  };
}