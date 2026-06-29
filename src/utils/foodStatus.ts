import type { FoodItem } from "../types";
import { daysUntil, displayDate } from "./date";

export type ExpiryState = "expired" | "today" | "soon" | "warning" | "normal" | "none";

export interface FoodStatus {
  state: ExpiryState;
  label: string;
  date?: string;
  kind?: "consume" | "best";
  daysLeft?: number;
}

function chooseNearestDate(food: FoodItem) {
  const dates = [
    food.expireDate ? { date: food.expireDate, kind: "consume" as const } : undefined,
    food.bestBeforeDate ? { date: food.bestBeforeDate, kind: "best" as const } : undefined,
  ].filter((item): item is { date: string; kind: "consume" | "best" } => Boolean(item));

  return dates.sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function getFoodStatus(food: FoodItem, warningDays = 7): FoodStatus {
  const nearest = chooseNearestDate(food);
  if (!nearest) {
    return { state: "none", label: "期限なし" };
  }

  const left = daysUntil(nearest.date);
  const kindLabel = nearest.kind === "consume" ? "消費期限" : "賞味期限";

  if (left === undefined) {
    return { state: "none", label: "日付を確認", date: nearest.date, kind: nearest.kind };
  }
  if (left < 0) {
    return {
      state: "expired",
      label: `${kindLabel}切れ ${Math.abs(left)}日`,
      date: nearest.date,
      kind: nearest.kind,
      daysLeft: left,
    };
  }
  if (left === 0) {
    return { state: "today", label: `${kindLabel} 今日まで`, date: nearest.date, kind: nearest.kind, daysLeft: left };
  }
  if (left <= 3) {
    return { state: "soon", label: `${kindLabel} あと${left}日`, date: nearest.date, kind: nearest.kind, daysLeft: left };
  }
  if (left <= warningDays) {
    return { state: "warning", label: `${displayDate(nearest.date)}まで`, date: nearest.date, kind: nearest.kind, daysLeft: left };
  }
  return { state: "normal", label: displayDate(nearest.date), date: nearest.date, kind: nearest.kind, daysLeft: left };
}

export function statusClass(state: ExpiryState) {
  switch (state) {
    case "expired":
      return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200";
    case "today":
      return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-200";
    case "soon":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200";
    case "warning":
      return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200";
    case "normal":
      return "border-emerald-100 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/35 dark:text-emerald-200";
    case "none":
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
}
