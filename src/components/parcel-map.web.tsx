import { MapPin } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

interface ParcelMapProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
}

export default function ParcelMap({
  latitude,
  longitude,
}: ParcelMapProps) {
  return (
    <View style={styles.placeholder}>
      <MapPin color="#247A45" size={26} />
      <Text style={styles.description}>
        Enter your field coordinates below.
      </Text>
      {latitude !== null && longitude !== null ? (
        <Text style={styles.coordinates}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: "#E5EFE2",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  description: {
    color: "#829083",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  coordinates: {
    color: "#536554",
    fontSize: 12,
    marginTop: 10,
  },
});
