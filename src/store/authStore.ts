import { create } from "zustand";
import * as authApi from "@/api/auth";
import { getToken, setToken } from "@/api/client";
import type { PublicUser, UserRole } from "@/types";

type AuthState = {
  user: PublicUser | null;
  loading: boolean;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  verifyOtpAuth: (payload: {
    identifier: string;
    otp: string;
    purpose: "register" | "login";
    expectedRole?: UserRole;
  }) => Promise<{ user: PublicUser; roleCorrected: boolean }>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  bootstrapped: false,

  setUser: (user) => set({ user }),

  async bootstrap() {
    set({ loading: true });
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, bootstrapped: true });
        return;
      }
      const user = await authApi.fetchMe();
      set({ user, bootstrapped: true });
    } catch {
      await setToken(null);
      set({ user: null, bootstrapped: true });
    } finally {
      set({ loading: false });
    }
  },

  async verifyOtpAuth(payload) {
    set({ loading: true });
    try {
      const result = await authApi.verifyOtp(payload);
      set({ user: result.user });
      return result;
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    await authApi.logout();
    set({ user: null });
  },
}));
