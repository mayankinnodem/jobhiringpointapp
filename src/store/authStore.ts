import { create } from "zustand";
import * as authApi from "@/api/auth";
import { getToken } from "@/api/client";
import type { PublicUser, UserRole } from "@/types";

type AuthState = {
  user: PublicUser | null;
  loading: boolean;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  verifyOtpAuth: (payload: {
    phone: string;
    otp: string;
    purpose: "register" | "login";
    expectedRole?: UserRole;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  bootstrapped: false,

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
      set({ user: null, bootstrapped: true });
    } finally {
      set({ loading: false });
    }
  },

  async verifyOtpAuth(payload) {
    set({ loading: true });
    try {
      const user = await authApi.verifyOtp(payload);
      set({ user });
      return user;
    } finally {
      set({ loading: false });
    }
  },

  async logout() {
    await authApi.logout();
    set({ user: null });
  },
}));
