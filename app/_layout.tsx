import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { LoadingScreen } from "@/components/LoadingScreen";
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

  if (!bootstrapped) {
    return (
      <>
        <StatusBar style="dark" />
        <LoadingScreen label="Starting Job Hiring Point…" />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="job/[id]" options={{ ...headerOptions, title: "Job details" }} />
        <Stack.Screen name="notifications" options={{ ...headerOptions, title: "Notifications" }} />
        <Stack.Screen name="complete-profile" options={{ ...headerOptions, title: "Complete profile" }} />
        <Stack.Screen name="recommended" options={{ ...headerOptions, title: "Recommended" }} />
        <Stack.Screen name="job-alerts" options={{ ...headerOptions, title: "Job alerts" }} />
        <Stack.Screen name="companies" options={{ ...headerOptions, title: "Companies" }} />
        <Stack.Screen name="company/[id]" options={{ ...headerOptions, title: "Company" }} />
        <Stack.Screen name="chat" options={{ ...headerOptions, title: "Chat" }} />
        <Stack.Screen name="recruiter/company" options={{ ...headerOptions, title: "Company profile" }} />
        <Stack.Screen name="recruiter/post-job" options={{ ...headerOptions, title: "Post job" }} />
        <Stack.Screen name="recruiter/applicants/[jobId]" options={{ ...headerOptions, title: "Applicants" }} />
      </Stack>
    </>
  );
}
