import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ArrowRight,
  Bell,
  ChevronRight,
  CloudSun,
  Droplets,
  MapPin,
  Satellite,
  Sprout,
} from "lucide-react-native";

import { router } from "expo-router";

const GREEN = "#247A45";

const crops = [
  { name: "Corn", emoji: "🌽", description: "Zea mays" },
  { name: "Beans", emoji: "🫘", description: "Phaseolus vulgaris" },
  { name: "Sorghum", emoji: "🌾", description: "Sorghum bicolor" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9F6" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Sprout size={27} color={GREEN} />
            </View>

            <View>
              <Text style={styles.brand}>SembraVida</Text>
              <Text style={styles.brandSubtitle}>SMART AGRICULTURE</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notification}>
            <Bell size={21} color="#354538" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* WELCOME */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>Welcome!</Text>

          <Text style={styles.title}>
            Grow with{"\n"}
            <Text style={styles.titleGreen}>confidence.</Text>
          </Text>

          <Text style={styles.description}>
            Explore your field conditions and find out which crops may grow best.
          </Text>
        </View>

        {/* LOCATION */}
        <TouchableOpacity style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <MapPin color={GREEN} size={20} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>FIELD LOCATION</Text>
            <Text style={styles.locationText}>
              Add your field location
            </Text>
          </View>

          <ChevronRight color="#718073" size={20} />
        </TouchableOpacity>

        {/* MAIN ACTION */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <View style={styles.tag}>
              <Satellite size={14} color="#D5F1D9" />
              <Text style={styles.tagText}>SMART FIELD ANALYSIS</Text>
            </View>
            <Sprout color="#A6D9A9" size={43} />
          </View>

          <Text style={styles.mainCardTitle}>What would you like to grow?</Text>

          <Text style={styles.mainCardDescription}>
            Check your field conditions before planning your next planting.
          </Text>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.mainButtonText}>Start analysis</Text>
            <ArrowRight color={GREEN} size={19} />
          </TouchableOpacity>
        </View>

        {/* CROPS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Available crops</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a crop to evaluate
            </Text>
          </View>
        </View>

        <View style={styles.cropContainer}>
          {crops.map((crop) => (
            <TouchableOpacity
              key={crop.name}
              style={styles.cropCard}
              onPress={() => router.push("/explore")}
            >
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropDescription}>{crop.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FEATURES */}
        <Text style={styles.sectionTitle}>How SembraVida helps</Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <CloudSun color={GREEN} size={23} />
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Climate conditions</Text>
            <Text style={styles.featureDescription}>
              Check environmental conditions in your area.
            </Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Droplets color={GREEN} size={23} />
          </View>

          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>Water availability</Text>
            <Text style={styles.featureDescription}>
              Review water conditions for your field.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Sprout color={GREEN} size={19} />
          <Text style={styles.footerText}>
            SembraVida · Technology for agriculture
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F6",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#E5F1E5",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 21,
    fontWeight: "800",
    color: "#174D30",
  },
  brandSubtitle: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: "#788579",
    marginTop: 3,
  },
  notification: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    width: 7,
    height: 7,
    backgroundColor: "#E77D53",
    borderRadius: 5,
    position: "absolute",
    top: 9,
    right: 10,
  },
  welcome: {
    marginBottom: 23,
  },
  greeting: {
    fontSize: 15,
    color: "#788579",
    fontWeight: "500",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1D2B21",
    lineHeight: 43,
    marginTop: 10,
  },
  titleGreen: {
    color: GREEN,
  },
  description: {
    color: "#788579",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 17,
    marginBottom: 22,
    gap: 12,
  },
  locationIcon: {
    backgroundColor: "#EAF4E9",
    padding: 11,
    borderRadius: 12,
  },
  locationLabel: {
    color: "#899489",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  locationText: {
    color: "#283B2C",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  mainCard: {
    backgroundColor: "#174D30",
    padding: 22,
    borderRadius: 23,
    marginBottom: 29,
  },
  mainCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#28613E",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: {
    color: "#D5F1D9",
    fontSize: 9,
    fontWeight: "700",
  },
  mainCardTitle: {
    fontSize: 23,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  mainCardDescription: {
    color: "#D0E2D2",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },
  mainButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 15,
    marginTop: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mainButtonText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#1D2B21",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#899489",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 16,
  },
  cropContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  cropCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingVertical: 17,
    alignItems: "center",
  },
  cropEmoji: {
    fontSize: 30,
    marginBottom: 9,
  },
  cropName: {
    color: "#25382A",
    fontSize: 13,
    fontWeight: "700",
  },
  cropDescription: {
    color: "#929B91",
    fontSize: 9,
    marginTop: 4,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginTop: 11,
  },
  featureIcon: {
    backgroundColor: "#EAF4E9",
    borderRadius: 13,
    padding: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: "#283B2C",
    fontWeight: "700",
    fontSize: 13,
  },
  featureDescription: {
    color: "#899489",
    fontSize: 11,
    marginTop: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 30,
  },
  footerText: {
    color: "#899489",
    fontSize: 11,
  },
});
