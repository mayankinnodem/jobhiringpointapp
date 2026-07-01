import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Platform, StyleSheet, View, type ColorValue } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { colors, radius } from "@/theme";

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/(auth)/login" />;
  }

  const isSeeker = user.role === "job_seeker";
  const isRecruiter = user.role === "recruiter";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.slate400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginBottom: Platform.OS === "ios" ? 0 : 4 },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { paddingTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "search" : "search-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          href: isSeeker ? "/saved" : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "bookmark" : "bookmark-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: isSeeker ? "Applied" : "Dashboard",
          href: isSeeker || isRecruiter ? "/applications" : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={
                isSeeker
                  ? focused ? "document-text" : "document-text-outline"
                  : focused ? "stats-chart" : "stats-chart-outline"
              }
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapOn]}>
      <Ionicons name={name} size={22} color={focused ? colors.brandLight : color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.brand100,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 86 : 62,
    paddingTop: 6,
    elevation: 16,
    shadowColor: "#002d62",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapOn: {
    backgroundColor: "#fff4e6",
  },
});
