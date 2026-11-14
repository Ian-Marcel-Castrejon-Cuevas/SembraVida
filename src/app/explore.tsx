import { router } from "expo-router";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  MapPin,
  Sprout,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ParcelMap from "../components/parcel-map";

const GREEN = "#247A45";

const crops = [
  { name: "Corn", emoji: "🌽", scientific: "Zea mays" },
  { name: "Beans", emoji: "🫘", scientific: "Phaseolus vulgaris" },
  { name: "Sorghum", emoji: "🌾", scientific: "Sorghum bicolor" },
];

const waterOptions = ["Rain", "Well", "Canal", "River or reservoir"];

const waterAvailability = ["Good", "Fair", "Scarce", "Variable"];

const months = [
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

export default function ExploreScreen() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");

  const [crop, setCrop] = useState("");
  const [waterSources, setWaterSources] = useState<string[]>([]);
  const [waterLevel, setWaterLevel] = useState("");
  const [plantingMonth, setPlantingMonth] = useState("");
  const [irrigation, setIrrigation] = useState("");

  const [step, setStep] = useState(1);

  const totalSteps = 6;

  function selectLocation(nextLatitude: number, nextLongitude: number) {
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setLatitudeInput(nextLatitude.toFixed(5));
    setLongitudeInput(nextLongitude.toFixed(5));
  }

  function updateCoordinateInput(value: string, coordinate: "latitude" | "longitude") {
    const normalized = value.replace(",", ".");
    const parsed = Number(normalized);

    if (coordinate === "latitude") {
      setLatitudeInput(value);
      setLatitude(
        normalized.trim() && Number.isFinite(parsed) ? parsed : null,
      );
    } else {
      setLongitudeInput(value);
      setLongitude(
        normalized.trim() && Number.isFinite(parsed) ? parsed : null,
      );
    }
  }

  function toggleWaterSource(source: string) {
    setWaterSources((current) =>
      current.includes(source)
        ? current.filter((item) => item !== source)
        : [...current, source],
    );
  }

  function nextStep() {
    if (
      step === 1 &&
      (latitude === null ||
        longitude === null ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180)
    ) {
      Alert.alert(
        "Location required",
        "Select your field on the map or enter valid coordinates.",
      );
      return;
    }

    if (step === 2 && !crop) {
      Alert.alert("Select a crop", "Choose corn, beans, or sorghum.");
      return;
    }

    if (step === 3 && waterSources.length === 0) {
      Alert.alert("Select a water source", "Choose where your water comes from.");
      return;
    }

    if (step === 4 && !waterLevel) {
      Alert.alert(
        "Information required",
        "Select your water availability.",
      );
      return;
    }

    if (step === 5 && !plantingMonth) {
      Alert.alert("Select a month", "Choose when you plan to plant.");
      return;
    }

    if (step === 6 && !irrigation) {
      Alert.alert(
        "Information required",
        "Tell us whether you have an irrigation system.",
      );
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      router.push({
        pathname: "/results",
        params: {
          latitude: String(latitude),
          longitude: String(longitude),
          crop,
          waterSources: waterSources.join(", "),
          waterLevel,
          plantingMonth,
          irrigation,
        },
      });
    }
  }

  function previousStep() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function OptionButton({
    label,
    selected,
    onPress,
    emoji,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    emoji?: string;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.option, selected && styles.optionSelected]}
      >
        <View style={styles.optionContent}>
          {emoji ? <Text style={styles.optionEmoji}>{emoji}</Text> : null}
          <Text
            style={[styles.optionText, selected && styles.optionTextSelected]}
          >
            {label}
          </Text>
        </View>

        {selected && <Check size={19} color={GREEN} />}
      </TouchableOpacity>
    );
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.question}>Choose your field location</Text>
            <Text style={styles.helper}>
              Tap the map where your field is located. You do not need to be
              there in person.
            </Text>

            <View style={styles.locationBox}>
              <View style={styles.mapContainer}>
                <ParcelMap
                  latitude={latitude}
                  longitude={longitude}
                  onSelect={selectLocation}
                />
              </View>

              <View style={styles.coordinateInputs}>
                <View style={styles.coordinateInputItem}>
                  <Text style={styles.inputLabel}>Latitude</Text>
                  <TextInput
                    style={[styles.input, styles.coordinateInput]}
                    value={latitudeInput}
                    onChangeText={(value) =>
                      updateCoordinateInput(value, "latitude")
                    }
                    placeholder="18.65000"
                    placeholderTextColor="#A0AAA0"
                  />
                </View>
                <View style={styles.coordinateInputItem}>
                  <Text style={styles.inputLabel}>Longitude</Text>
                  <TextInput
                    style={[styles.input, styles.coordinateInput]}
                    value={longitudeInput}
                    onChangeText={(value) =>
                      updateCoordinateInput(value, "longitude")
                    }
                    placeholder="-99.19000"
                    placeholderTextColor="#A0AAA0"
                  />
                </View>
              </View>
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.question}>What would you like to grow?</Text>
            <Text style={styles.helper}>
              Select the crop you want to evaluate.
            </Text>

            {crops.map((item) => (
              <OptionButton
                key={item.name}
                label={item.name}
                emoji={item.emoji}
                selected={crop === item.name}
                onPress={() => setCrop(item.name)}
              />
            ))}
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.question}>Where does your water come from?</Text>
            <Text style={styles.helper}>
              Select all water sources that apply.
            </Text>

            {waterOptions.map((item) => (
              <OptionButton
                key={item}
                label={item}
                selected={waterSources.includes(item)}
                onPress={() => toggleWaterSource(item)}
              />
            ))}
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.question}>
              How would you describe your water availability?
            </Text>
            <Text style={styles.helper}>
              Choose the option that best describes your current situation.
            </Text>

            {waterAvailability.map((item) => (
              <OptionButton
                key={item}
                label={item}
                selected={waterLevel === item}
                onPress={() => setWaterLevel(item)}
              />
            ))}
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.question}>When do you plan to plant?</Text>
            <Text style={styles.helper}>
              Select the month when you expect to start planting.
            </Text>

            <View style={styles.monthGrid}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthOption,
                    plantingMonth === month && styles.monthSelected,
                  ]}
                  onPress={() => setPlantingMonth(month)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      plantingMonth === month && styles.monthTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case 6:
        return (
          <>
            <Text style={styles.question}>Do you have an irrigation system?</Text>
            <Text style={styles.helper}>
              This helps us assess water availability for your crop.
            </Text>

            <OptionButton
              label="Yes, I have irrigation"
              selected={irrigation === "Yes"}
              onPress={() => setIrrigation("Yes")}
              emoji="💧"
            />

            <OptionButton
              label="No, I rely on rainfall"
              selected={irrigation === "No"}
              onPress={() => setIrrigation("No")}
              emoji="🌧️"
            />
          </>
        );

      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sprout color={GREEN} size={24} />
          </View>

          <View>
            <Text style={styles.headerTitle}>Field analysis</Text>
            <Text style={styles.headerSubtitle}>Let’s learn about your field</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              STEP {step} OF {totalSteps}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round((step / totalSteps) * 100)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${(step / totalSteps) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.stepIcon}>
            {step === 1 ? (
              <MapPin color={GREEN} size={25} />
            ) : step === 3 || step === 4 ? (
              <Droplets color={GREEN} size={25} />
            ) : step === 5 ? (
              <CalendarDays color={GREEN} size={25} />
            ) : (
              <Sprout color={GREEN} size={25} />
            )}
          </View>

          {renderStep()}
        </View>

        <View style={styles.navigation}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={previousStep}>
              <ChevronLeft color={GREEN} size={20} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextText}>
              {step === totalSteps ? "Analyze field" : "Continue"}
            </Text>
            <ChevronRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          SembraVida · Your field, our commitment
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F6",
  },
  container: {
    padding: 22,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  headerIcon: {
    backgroundColor: "#E5F1E5",
    padding: 12,
    borderRadius: 14,
  },
  headerTitle: {
    color: "#174D30",
    fontSize: 19,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#899489",
    fontSize: 12,
    marginTop: 3,
  },
  progressContainer: {
    marginBottom: 27,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 1,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: "700",
    color: GREEN,
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#E4EAE2",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 21,
    minHeight: 350,
  },
  stepIcon: {
    width: 49,
    height: 49,
    backgroundColor: "#EAF4E9",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },
  question: {
    color: "#1D2B21",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 30,
  },
  helper: {
    color: "#829083",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 23,
  },
  inputLabel: {
    color: "#425345",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E9E0",
    backgroundColor: "#FBFCFA",
    borderRadius: 12,
    height: 51,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1D2B21",
    marginBottom: 19,
  },
  option: {
    minHeight: 55,
    borderWidth: 1,
    borderColor: "#E5EAE3",
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionSelected: {
    borderColor: GREEN,
    backgroundColor: "#EFF7EF",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionText: {
    color: "#4A584B",
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: GREEN,
    fontWeight: "800",
  },
  locationBox: {
    backgroundColor: "#F4F8F2",
    borderRadius: 17,
    padding: 22,
    alignItems: "center",
    marginTop: 4,
  },
  mapContainer: {
    width: "100%",
    height: 250,
    marginTop: 4,
    borderRadius: 14,
    overflow: "hidden",
  },
  coordinateInputs: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  coordinateInputItem: {
    flex: 1,
  },
  coordinateInput: {
    marginBottom: 0,
  },
  locationDescription: {
    color: "#829083",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  monthOption: {
    width: "31%",
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5EAE3",
    borderRadius: 11,
  },
  monthSelected: {
    backgroundColor: "#EFF7EF",
    borderColor: GREEN,
  },
  monthText: {
    color: "#536554",
    fontSize: 12,
    fontWeight: "600",
  },
  monthTextSelected: {
    color: GREEN,
    fontWeight: "800",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    gap: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
  },
  backText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 13,
  },
  nextButton: {
    flex: 1,
    backgroundColor: GREEN,
    borderRadius: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  footer: {
    textAlign: "center",
    color: "#A0AAA0",
    fontSize: 10,
    marginTop: 28,
  },
});
