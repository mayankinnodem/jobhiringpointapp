import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { SessionGuard } from "@/components/SessionGuard";
import { useAuthStore } from "@/store/authStore";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AppAlertProvider } from "@/components/ui/AppAlert";
import { colors } from "@/theme";

const headerOptions = {
  headerShown: true as const,
  headerTintColor: colors.brand,
  headerStyle: { backgroundColor: colors.white },
  headerShadowVisible: false,
};
export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <GestureHandlerRootView style={styles.root}>
    <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.root}>
      <AppAlertProvider>
        {!bootstrapped ? (
          <>
            <StatusBar style="dark" />
            <LoadingScreen label="Starting Job Hiring Point…" />
          </>
        ) : (
          <>
            <SessionGuard />
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="job/[id]" options={{ ...headerOptions, title: "Job details" }} />
              <Stack.Screen name="notifications" options={{ ...headerOptions, title: "Notifications" }} />
              <Stack.Screen name="complete-profile" options={{ ...headerOptions, title: "Job seeker profile" }} />
              <Stack.Screen name="recommended" options={{ ...headerOptions, title: "Recommended" }} />
              <Stack.Screen name="job-alerts" options={{ ...headerOptions, title: "Job alerts" }} />
              <Stack.Screen name="companies" options={{ ...headerOptions, title: "Companies" }} />
              <Stack.Screen name="company/[id]" options={{ ...headerOptions, title: "Company" }} />
              <Stack.Screen name="chat" options={{ ...headerOptions, title: "Chat" }} />
              <Stack.Screen name="recruiter/company" options={{ ...headerOptions, title: "Company profile" }} />
              <Stack.Screen name="recruiter/post-job" options={{ ...headerOptions, title: "Post a job" }} />
              <Stack.Screen name="recruiter/applicants/[jobId]" options={{ ...headerOptions, title: "Applicants" }} />
            </Stack>
          </>
        )}
      </AppAlertProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
