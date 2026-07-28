import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { appAlert } from "@/components/ui/AppAlert";
import { useChatUnreadBadge } from "@/hooks/useChatUnreadBadge";
import { useAuthStore } from "@/store/authStore";
import { colors, radius } from "@/theme";

export default function TabsLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isSeeker = user?.role === "job_seeker";
  const isRecruiter = user?.role === "recruiter";
  const showMessages = isSeeker || isRecruiter;
  const { count: chatUnread } = useChatUnreadBadge(showMessages);
  const insets = useSafeAreaInsets();
  const tabBarHeight = (Platform.OS === "ios" ? 56 : 62) + insets.bottom;

  useEffect(() => {
    if (user?.role === "admin") {
      appAlert(
        "Web dashboard only",
        "Admin accounts are managed on the web. Please sign in at jobhiringpoint.com"
      );
      void logout();
    }
  }, [user?.role, logout]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.brand50 },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.slate400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginBottom: Platform.OS === "ios" ? 0 : 4 },
        tabBarStyle: {
          ...styles.tabBar,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, Platform.OS === "ios" ? 8 : 6),
        },
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
        name="messages"
        options={{
          title: "Messages",
          href: showMessages ? "/messages" : null,
          tabBarIcon: ({ color, focused }) => (
            <TabIconWithBadge
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
              focused={focused}
              badge={chatUnread}
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

function TabIconWithBadge({
  name,
  color,
  focused,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: ColorValue;
  focused: boolean;
  badge: number;
}) {
  return (
    <View>
      <TabIcon name={name} color={color} focused={focused} />
      {badge > 0 ? (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.brand100,
    borderTopWidth: 1,
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
  tabBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 9, fontWeight: "800", color: colors.white },
});
