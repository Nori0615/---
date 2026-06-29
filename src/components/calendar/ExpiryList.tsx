import { clsx } from "clsx";
import { Clock3 } from "lucide-react";
import { useFoodStore } from "../../store/foodStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useUiStore } from "../../store/uiStore";
import { compactDate } from "../../utils/date";
import { getFoodStatus, statusClass } from "../../utils/foodStatus";

interface ExpiryListProps {
  mode?: "all" | "expired" | "today" | "threeDays" | "week";
}

export function ExpiryList({ mode = "all" }: ExpiryListProps) {
  const foods = useFoodStore((state) => state.foods);
  const warningDays = useSettingsStore((state) => state.settings?.warningDays ?? 7);
  const selectFood = useUiStore((state) => state.selectFood);

  const rows = foods
    .map((food) => ({ food, status: getFoodStatus(food, warningDays) }))
    .filter(({ status }) => {
      if (!status.date) return false;
      if (mode === "expired") return status.state === "expired";
      if (mode === "today") return status.state === "today";
      if (mode === "threeDays") return (status.daysLeft ?? 999) <= 3;
      if (mode === "week") return (status.daysLeft ?? 999) <= 7;
      return true;
    })
    .sort((a, b) => (a.status.daysLeft ?? 999) - (b.status.daysLeft ?? 999));

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 size={18} className="text-cyan-700 dark:text-teal-300" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">期限が近い順</h2>
      </div>
      <div className="grid gap-2">
        {rows.length > 0 ? (
          rows.map(({ food, status }) => (
            <button
              key={food.id}
              type="button"
              onClick={() => selectFood(food.id)}
              className={clsx("focus-ring flex items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left", statusClass(status.state))}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {food.icon}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900 dark:text-slate-50">{food.name}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{status.kind === "consume" ? "消費期限" : "賞味期限"}</span>
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold">
                <span className="block">{compactDate(status.date)}</span>
                <span className="text-xs">{status.label}</span>
              </span>
            </button>
          ))
        ) : null}
      </div>
    </section>
  );
}
