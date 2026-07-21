import { useEffect } from "react";
import { router } from "expo-router";
import { registerUnauthorizedHandler } from "@/api/client";
import { useAuthStore } from "@/store/authStore";

/** Clears auth state and sends user to login when API returns 401 */
export function SessionGuard() {
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      useAuthStore.getState().setUser(null);
      router.replace("/(auth)/login");
    });
  }, []);

  return null;
}
