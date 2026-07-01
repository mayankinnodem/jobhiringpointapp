import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/** Text + icon brand for dark headers — avoids logo PNG white box. */
export function HeaderBrand() {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="briefcase" size={20} color={colors.white} />
      </View>
      <View>
        <Text style={styles.line1}>Job</Text>
        <Text style={styles.line2}>
          Hiring <Text style={styles.accent}>Point</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandLight,
    alignItems: "center",
    justifyContent: "center",
  },
  line1: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  line2: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  accent: { color: colors.brandLight },
});
