import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "recruiter") {
    return <Redirect href="/(tabs)/applications" />;
  }

  return <Redirect href="/(tabs)" />;
}
