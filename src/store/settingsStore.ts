import { create } from "zustand";
import { db } from "../db/dexie";
import type { AppSettings } from "../types";

function defaultSettings(): AppSettings {
  const now = new Date().toISOString();
  return {
    id: "local",
    theme: "light",
    layoutMode: "realistic",
    density: "comfortable",
    calendarView: "month",
    warningDays: 7,
    onboardingCompleted: true,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeSettings(settings?: AppSettings): AppSettings {
  if (!settings) return defaultSettings();
  const defaults = defaultSettings();
  return {
    ...defaults,
    ...settings,
    id: "local",
    createdAt: settings.createdAt ?? defaults.createdAt,
    updatedAt: settings.updatedAt ?? defaults.updatedAt,
  };
}

interface SettingsState {
  settings?: AppSettings;
  loading: boolean;
  initialize: () => Promise<AppSettings>;
  updateSettings: (patch: Partial<Omit<AppSettings, "id" | "createdAt">>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loading: true,
  initialize: async () => {
    set({ loading: true });
    const storedSettings = await db.settings.get("local");
    const settings = normalizeSettings(storedSettings);
    await db.settings.put(settings);
    set({ settings, loading: false });
    return settings;
  },
  updateSettings: async (patch) => {
    const current = get().settings ?? defaultSettings();
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.settings.put(next);
    set({ settings: next });
  },
}));
