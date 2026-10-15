import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "jobportal_token";

export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "https://jobhiringpoint.com";

const baseURL = apiBaseUrl;

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

let memoryToken: string | null = null;

export async function getToken() {
  if (memoryToken) return memoryToken;
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

export async function setToken(token: string | null) {
  memoryToken = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      const url = err.config?.url ?? "";
      const isAuthFlow =
        url.includes("/api/auth/otp/verify") ||
        url.includes("/api/auth/otp/send") ||
        url.includes("/api/auth/login");
      if (!isAuthFlow) {
        await setToken(null);
        onUnauthorized?.();
      }
    }
    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    return data?.error ?? err.message ?? "Something went wrong";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
