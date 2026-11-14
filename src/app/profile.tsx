import { UserRound } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <UserRound size={48} color="#247A45" />
      <Text style={styles.title}>My profile</Text>
      <Text style={styles.description}>
        Profile settings will be available soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9F6",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#174D30",
    marginTop: 18,
  },
  description: {
    fontSize: 14,
    color: "#788579",
    textAlign: "center",
    marginTop: 10,
  },
});
