import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";

interface ParcelMapProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
}

const DEFAULT_REGION = {
  latitude: 18.65,
  longitude: -99.19,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

export default function ParcelMap({
  latitude,
  longitude,
  onSelect,
}: ParcelMapProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={DEFAULT_REGION}
      onPress={(event) =>
        onSelect(
          event.nativeEvent.coordinate.latitude,
          event.nativeEvent.coordinate.longitude,
        )
      }
    >
      {latitude !== null && longitude !== null ? (
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          onDragEnd={(event) =>
            onSelect(
              event.nativeEvent.coordinate.latitude,
              event.nativeEvent.coordinate.longitude,
            )
          }
          pinColor="#247A45"
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
});
