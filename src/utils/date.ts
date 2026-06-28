import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ja } from "date-fns/locale";

export function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateInputFromToday(days: number) {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}

export function displayDate(value?: string) {
  if (!value) return "期限なし";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "日付を確認";
  return format(parsed, "M月d日(E)", { locale: ja });
}

export function compactDate(value?: string) {
  if (!value) return "-";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "-";
  return format(parsed, "M/d");
}

export function daysUntil(value?: string) {
  if (!value) return undefined;
  const parsed = parseISO(value);
  if (!isValid(parsed)) return undefined;
  return differenceInCalendarDays(parsed, new Date());
}

export function monthRange(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 });
  return { start, end };
}

export function weekRange(anchor: Date) {
  return {
    start: startOfWeek(anchor, { weekStartsOn: 0 }),
    end: endOfWeek(anchor, { weekStartsOn: 0 }),
  };
}
