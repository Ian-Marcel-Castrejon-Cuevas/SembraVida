import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  CloudRain,
  Droplets,
  Leaf,
  MapPin,
  RefreshCw,
  Sprout,
  Sun,
  Thermometer,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ClimateSummary, getClimateData } from "../services/nasaPower";

import { getSoilGridsData, SoilGridsSummary } from "../services/soilGrids";

const GREEN = "#247A45";
const DARK = "#183D29";
const GRAY = "#758276";
const BACKGROUND = "#F5F8F4";

function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatNumber(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "No data";
  }

  return value.toFixed(decimals);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const cropGuides: Record<
  string,
  { temperature: [number, number]; precipitationMin: number; ph: [number, number] }
> = {
  Corn: { temperature: [18, 32], precipitationMin: 50, ph: [5.5, 7.5] },
  Beans: { temperature: [16, 27], precipitationMin: 40, ph: [5.5, 7] },
  Sorghum: { temperature: [20, 35], precipitationMin: 25, ph: [5.5, 8.5] },
};

type Recommendation = {
  title: string;
  detail: string;
  tone: "positive" | "caution" | "risk";
};

function getPlantingRecommendation(
  crop: string,
  plantingMonth: string,
  climate: ClimateSummary | null,
  soil: SoilGridsSummary | null,
  waterLevel: string,
  irrigation: string,
): Recommendation {
  const guide = cropGuides[crop];
  const monthIndex = MONTHS.indexOf(plantingMonth);
  const monthClimate = monthIndex >= 0 ? climate?.monthly[monthIndex + 1] : null;

  if (!guide || !monthClimate || monthClimate.validDays < 10) {
    return {
      title: "Not enough data to make a recommendation",
      detail:
        "There is not enough data for the selected month to evaluate this crop. Check the data sources and refresh the analysis.",
      tone: "caution",
    };
  }

  const observations: { tone: "positive" | "caution" | "risk"; text: string }[] = [];
  const temperature = monthClimate.temperature;
  const precipitation = monthClimate.precipitationTotal;

  if (temperature !== null) {
    const [minimum, maximum] = guide.temperature;
    const distance = temperature < minimum ? minimum - temperature : temperature - maximum;
    observations.push({
      tone:
        distance <= 0 ? "positive" : distance <= 4 ? "caution" : "risk",
      text: `Average temperature for ${plantingMonth}: ${temperature.toFixed(1)} °C (general crop range: ${minimum}–${maximum} °C).`,
    });
  }

  if (precipitation !== null) {
    const rainIsShort = precipitation < guide.precipitationMin;
    observations.push({
      tone: !rainIsShort
        ? "positive"
        : irrigation === "Yes"
          ? "caution"
          : "risk",
      text: rainIsShort
        ? `Rainfall for the same month in the past year: ${precipitation.toFixed(0)} mm. Consider irrigation, especially during crop establishment.`
        : `Rainfall for the same month in the past year: ${precipitation.toFixed(0)} mm.`,
    });
  }

  if (soil?.ph !== null && soil?.ph !== undefined) {
    const [minimum, maximum] = guide.ph;
    const withinRange = soil.ph >= minimum && soil.ph <= maximum;
    observations.push({
      tone: withinRange ? "positive" : "caution",
      text: `Estimated soil pH: ${soil.ph.toFixed(1)} (general crop range: ${minimum}–${maximum}).`,
    });
  }

  if (waterLevel === "Scarce" && irrigation !== "Yes") {
    observations.push({
      tone: "risk",
      text: "You reported scarce water availability and no irrigation system.",
    });
  } else if (waterLevel === "Variable" && irrigation !== "Yes") {
    observations.push({
      tone: "caution",
      text: "You reported variable water availability and no irrigation system.",
    });
  }

  const riskCount = observations.filter((item) => item.tone === "risk").length;
  const cautionCount = observations.filter(
    (item) => item.tone === "caution",
  ).length;

  if (riskCount > 0) {
    return {
      title: "Not recommended without adjustments",
      detail: observations.map((item) => item.text).join(" "),
      tone: "risk",
    };
  }

  if (cautionCount > 0) {
    return {
      title: "Potentially viable with precautions",
      detail: observations.map((item) => item.text).join(" "),
      tone: "caution",
    };
  }

  return {
    title: "Conditions look favorable",
    detail: observations.map((item) => item.text).join(" "),
    tone: "positive",
  };
}

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  description: string;
}

function MetricCard({
  title,
  value,
  unit,
  icon,
  description,
}: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTop}>
        <View style={styles.metricIcon}>{icon}</View>
      </View>

      <Text style={styles.metricTitle}>{title}</Text>

      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{value}</Text>
        {unit ? <Text style={styles.metricUnit}>{unit}</Text> : null}
      </View>

      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

function StatusCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.statusCard}>
      <ActivityIndicator size="large" color={GREEN} />
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={styles.statusDescription}>{description}</Text>
    </View>
  );
}

function ErrorCard({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorText}>{message}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <RefreshCw color="#FFFFFF" size={17} />
        <Text style={styles.retryText}>Reintentar consulta</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ResultsScreen() {
  const params = useLocalSearchParams();

  const latitude = getParam(params.latitude);
  const longitude = getParam(params.longitude);
  const crop = getParam(params.crop);
  const waterLevel = getParam(params.waterLevel);
  const plantingMonth = getParam(params.plantingMonth);
  const irrigation = getParam(params.irrigation);
  const waterSources = getParam(params.waterSources);

  const [climate, setClimate] = useState<ClimateSummary | null>(null);
  const [loadingPower, setLoadingPower] = useState(true);
  const [errorPower, setErrorPower] = useState("");

  const [soilProfile, setSoilProfile] = useState<SoilGridsSummary | null>(null);
  const [loadingAdditional, setLoadingAdditional] = useState(true);
  const [additionalErrors, setAdditionalErrors] = useState({
    soilGrids: "",
  });
  const plantingRecommendation = getPlantingRecommendation(
    crop,
    plantingMonth,
    climate,
    soilProfile,
    waterLevel,
    irrigation,
  );

  const loadClimate = useCallback(async () => {
    setLoadingPower(true);
    setErrorPower("");
    setClimate(null);

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      !latitude ||
      !longitude ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      setErrorPower("Valid coordinates are required to query NASA POWER.");
      setLoadingPower(false);
      return;
    }

    try {
      const result = await getClimateData(lat, lon);
      setClimate(result);
    } catch (error) {
      setErrorPower(
        error instanceof Error
          ? error.message
          : "Could not retrieve climate data.",
      );
    } finally {
      setLoadingPower(false);
    }
  }, [latitude, longitude]);

  const loadAdditionalData = useCallback(async () => {
    setLoadingAdditional(true);
    setAdditionalErrors({ soilGrids: "" });
    setSoilProfile(null);

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      !latitude ||
      !longitude ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      const message = "Valid coordinates are required to query this source.";
      setAdditionalErrors({ soilGrids: message });
      setLoadingAdditional(false);
      return;
    }

    const soilResult = await getSoilGridsData(lat, lon).then(
      (value) => ({ status: "fulfilled" as const, value }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );

    if (soilResult.status === "fulfilled") {
      setSoilProfile(soilResult.value);
    } else {
      setAdditionalErrors((current) => ({
        ...current,
        soilGrids:
          soilResult.reason instanceof Error
            ? soilResult.reason.message
            : "Could not retrieve SoilGrids data.",
      }));
    }

    setLoadingAdditional(false);
  }, [latitude, longitude]);

  useEffect(() => {
    loadClimate();
    loadAdditionalData();
  }, [loadClimate, loadAdditionalData]);

  const refreshAll = useCallback(() => {
    loadClimate();
    loadAdditionalData();
  }, [loadClimate, loadAdditionalData]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loadingPower || loadingAdditional}
          onRefresh={refreshAll}
          tintColor={GREEN}
        />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={DARK} size={22} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Field analysis</Text>
          <Text style={styles.headerSubtitle}>
            Environmental conditions for your field
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.recommendationCard,
          plantingRecommendation.tone === "positive"
            ? styles.recommendationPositive
            : plantingRecommendation.tone === "risk"
              ? styles.recommendationRisk
              : styles.recommendationCaution,
        ]}
      >
        <Text style={styles.recommendationEyebrow}>Preliminary recommendation</Text>
        {loadingPower || loadingAdditional ? (
          <View style={styles.recommendationLoading}>
            <ActivityIndicator size="small" color={GREEN} />
            <Text style={styles.recommendationDetail}>
              Comparing {crop} for {plantingMonth} with local conditions...
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.recommendationTitle}>
              {plantingRecommendation.title}
            </Text>
            <Text style={styles.recommendationDetail}>
              {plantingRecommendation.detail}
            </Text>
          </>
        )}
        <Text style={styles.recommendationDisclaimer}>
          Based on observations from the same month in the past year and general crop
          ranges. This is not a forecast or a yield guarantee.
        </Text>
      </View>

      {/* LOCATION */}
      <View style={styles.locationCard}>
        <View style={styles.locationIcon}>
          <MapPin color={GREEN} size={22} />
        </View>

        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>Selected location</Text>
          <Text style={styles.locationName}>Field location</Text>
          <Text style={styles.coordinates}>
            {latitude && longitude
              ? `${latitude}, ${longitude}`
              : "Coordinates unavailable"}
          </Text>
        </View>
      </View>

      {/* FIELD DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Field details</Text>
        <Text style={styles.sectionSubtitle}>
          Information you provided
        </Text>

        <View style={styles.parcelCard}>
          <View style={styles.parcelRow}>
            <View style={styles.parcelItem}>
              <Text style={styles.parcelLabel}>Crop</Text>
              <Text style={styles.parcelValue}>
                {crop || "Not specified"}
              </Text>
            </View>

            <View style={styles.parcelItem}>
              <Text style={styles.parcelLabel}>Planting month</Text>
              <Text style={styles.parcelValue}>
                {plantingMonth || "Not specified"}
              </Text>
            </View>
          </View>

          <View style={styles.parcelDivider} />

          <View style={styles.parcelRow}>
            <View style={styles.parcelItem}>
              <Text style={styles.parcelLabel}>Water availability</Text>
              <Text style={styles.parcelValue}>
                {waterLevel || "Not specified"}
              </Text>
            </View>

            <View style={styles.parcelItem}>
              <Text style={styles.parcelLabel}>Irrigation</Text>
              <Text style={styles.parcelValue}>
                {irrigation || "Not specified"}
              </Text>
            </View>
          </View>

          {waterSources ? (
            <>
              <View style={styles.parcelDivider} />
              <Text style={styles.parcelLabel}>Water sources</Text>
              <Text style={styles.parcelValue}>{waterSources}</Text>
            </>
          ) : null}
        </View>
      </View>

      {/* NASA POWER */}
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Climate conditions</Text>
            <Text style={styles.sectionSubtitle}>
              Historical data from NASA POWER
            </Text>
          </View>

          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>POWER</Text>
          </View>
        </View>

        {loadingPower ? (
          <StatusCard
            title="Querying NASA POWER..."
            description="Retrieving temperature, rainfall, and solar radiation data."
          />
        ) : errorPower ? (
          <ErrorCard
            title="Could not retrieve climate data"
            message={errorPower}
            onRetry={loadClimate}
          />
        ) : climate ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Average temperature"
                value={formatNumber(climate.temperature)}
                unit="°C"
                icon={<Thermometer color="#E58A35" size={21} />}
                description="Average for the selected period"
              />

              <MetricCard
                title="Precipitation"
                value={formatNumber(climate.precipitationTotal)}
                unit="mm"
                icon={<CloudRain color="#2785C7" size={21} />}
                description="Total precipitation"
              />

              <MetricCard
                title="Relative humidity"
                value={formatNumber(climate.humidity)}
                unit="%"
                icon={<Droplets color="#2785C7" size={21} />}
                description="Air humidity"
              />

              <MetricCard
                title="Solar radiation"
                value={formatNumber(climate.solarRadiation)}
                unit="MJ/m²/day"
                icon={<Sun color="#E5A72F" size={21} />}
                description="Average daily solar energy"
              />

              <MetricCard
                title="Average high temperature"
                value={formatNumber(climate.temperatureMax)}
                unit="°C"
                icon={<Thermometer color="#D76B45" size={21} />}
                description="Average daily high across the period"
              />

              <MetricCard
                title="Average low temperature"
                value={formatNumber(climate.temperatureMin)}
                unit="°C"
                icon={<Thermometer color="#438CCB" size={21} />}
                description="Average daily low across the period"
              />
            </View>

            <View style={styles.periodCard}>
              <Text style={styles.periodTitle}>NASA POWER query period</Text>
              <Text style={styles.periodDates}>
                {climate.startDate} — {climate.endDate}
              </Text>
              <Text style={styles.periodDescription}>
                {climate.validDays} days with valid data.
              </Text>
              <Text style={styles.periodDescription}>Source: NASA POWER.</Text>
            </View>
          </>
        ) : null}
      </View>

      {/* SOILGRIDS */}
      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Soil properties</Text>
            <Text style={styles.sectionSubtitle}>
              Estimated topsoil profile from SoilGrids
            </Text>
          </View>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>SOILGRIDS</Text>
          </View>
        </View>

        {loadingAdditional ? (
          <StatusCard
            title="Querying SoilGrids..."
            description="Retrieving pH, texture, and soil properties at 250 m."
          />
        ) : additionalErrors.soilGrids ? (
          <ErrorCard
            title="Could not retrieve the soil profile"
            message={additionalErrors.soilGrids}
            onRetry={loadAdditionalData}
          />
        ) : soilProfile ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Soil pH"
                value={formatNumber(soilProfile.ph)}
                unit=""
                icon={<Sprout color={GREEN} size={21} />}
                description="Estimated acidity or alkalinity"
              />
              <MetricCard
                title="Clay"
                value={formatNumber(soilProfile.clayPercent)}
                unit="%"
                icon={<Leaf color={GREEN} size={21} />}
                description="Fine-texture fraction"
              />
              <MetricCard
                title="Sand"
                value={formatNumber(soilProfile.sandPercent)}
                unit="%"
                icon={<Sprout color={GREEN} size={21} />}
                description="Coarse-texture fraction"
              />
              <MetricCard
                title="Silt"
                value={formatNumber(soilProfile.siltPercent)}
                unit="%"
                icon={<Leaf color={GREEN} size={21} />}
                description="Medium-texture fraction"
              />
              <MetricCard
                title="Organic carbon"
                value={formatNumber(soilProfile.organicCarbon)}
                unit="g/kg"
                icon={<Sprout color={GREEN} size={21} />}
                description="Estimated soil content"
              />
              <MetricCard
                title="Bulk density"
                value={formatNumber(soilProfile.bulkDensity)}
                unit="kg/dm³"
                icon={<Leaf color={GREEN} size={21} />}
                description="Estimated soil compaction"
              />
            </View>
            <View style={styles.periodCard}>
              <Text style={styles.periodTitle}>Depth and resolution</Text>
              <Text style={styles.periodDates}>
                {soilProfile.depth} · {soilProfile.resolution}
              </Text>
              <Text style={styles.periodDescription}>
                Source: {soilProfile.source}. This modeled estimate does not replace
                laboratory soil testing.
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {/* NOTE */}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Important</Text>
        <Text style={styles.noteText}>
          NASA POWER and SoilGrids provide estimates at different spatial and
          temporal resolutions; they are not direct measurements of your field.
          These results are not a weather forecast and do not replace laboratory
          soil testing or advice from a local agronomist.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={refreshAll}
        disabled={loadingPower || loadingAdditional}
      >
        <RefreshCw color="#FFFFFF" size={18} />
        <Text style={styles.refreshButtonText}>Refresh data</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: BACKGROUND,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  recommendationCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    borderLeftWidth: 4,
  },

  recommendationPositive: {
    backgroundColor: "#EAF4EC",
    borderLeftColor: GREEN,
  },

  recommendationCaution: {
    backgroundColor: "#FFF6E5",
    borderLeftColor: "#D69A2D",
  },

  recommendationRisk: {
    backgroundColor: "#FFF1EF",
    borderLeftColor: "#C85448",
  },

  recommendationEyebrow: {
    color: GRAY,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 5,
  },

  recommendationTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "800",
  },

  recommendationDetail: {
    color: "#536554",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  recommendationDisclaimer: {
    color: GRAY,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 9,
  },

  recommendationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    color: DARK,
    fontSize: 21,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: GRAY,
    fontSize: 12,
    marginTop: 3,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  locationIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  locationInfo: {
    flex: 1,
  },

  locationLabel: {
    color: GRAY,
    fontSize: 11,
  },

  locationName: {
    color: DARK,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 3,
  },

  section: {
    marginBottom: 25,
  },

  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: GRAY,
    fontSize: 11,
    marginTop: 4,
  },

  sourceBadge: {
    backgroundColor: "#EAF4EC",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
  },

  sourceBadgeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
  },

  parcelCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  coordinates: {
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },

  parcelRow: {
    flexDirection: "row",
    gap: 12,
  },

  parcelItem: {
    flex: 1,
  },

  parcelLabel: {
    color: GRAY,
    fontSize: 11,
    marginBottom: 5,
  },

  parcelValue: {
    color: DARK,
    fontSize: 13,
    fontWeight: "700",
  },

  parcelDivider: {
    height: 1,
    backgroundColor: "#EDF1EC",
    marginVertical: 13,
  },

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  metricCard: {
    width: "48%",
    flexGrow: 1,
    minHeight: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 2,
  },

  metricTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  metricIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F2F7F1",
    alignItems: "center",
    justifyContent: "center",
  },

  metricTitle: {
    color: GRAY,
    fontSize: 11,
    fontWeight: "600",
    minHeight: 27,
  },

  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 4,
  },

  metricValue: {
    color: DARK,
    fontSize: 23,
    fontWeight: "800",
  },

  metricUnit: {
    color: GRAY,
    fontSize: 10,
    marginLeft: 4,
  },

  metricDescription: {
    color: GRAY,
    fontSize: 10,
    marginTop: 7,
    lineHeight: 14,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
  },

  statusTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 13,
  },

  statusDescription: {
    color: GRAY,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 7,
  },

  errorCard: {
    backgroundColor: "#FFF1EF",
    padding: 16,
    borderRadius: 14,
  },

  errorTitle: {
    color: "#A33D32",
    fontSize: 14,
    fontWeight: "800",
  },

  errorText: {
    color: "#8C514B",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  retryButton: {
    flexDirection: "row",
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 9,
    marginTop: 13,
    gap: 7,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  periodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginTop: 12,
  },

  periodTitle: {
    color: DARK,
    fontSize: 12,
    fontWeight: "800",
  },

  periodDates: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },

  periodDescription: {
    color: GRAY,
    fontSize: 10,
    marginTop: 6,
    lineHeight: 15,
  },

  noteCard: {
    backgroundColor: "#EAF1E8",
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },

  noteTitle: {
    color: DARK,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  noteText: {
    color: "#5E725F",
    fontSize: 10,
    lineHeight: 16,
  },

  refreshButton: {
    backgroundColor: GREEN,
    borderRadius: 13,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 25,
  },
});
