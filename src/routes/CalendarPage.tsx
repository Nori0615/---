import { useState } from "react";
import { ExpiryCalendar } from "../components/calendar/ExpiryCalendar";
import { ExpiryList } from "../components/calendar/ExpiryList";

type ListMode = "all" | "expired" | "today" | "threeDays" | "week";

const filters: Array<{ value: ListMode; label: string }> = [
  { value: "all", label: "すべて" },
  { value: "expired", label: "期限切れ" },
  { value: "today", label: "今日まで" },
  { value: "threeDays", label: "3日以内" },
  { value: "week", label: "1週間以内" },
];

export function CalendarPage() {
  const [mode, setMode] = useState<ListMode>("all");

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black text-cyan-700 dark:text-teal-300">Calendar</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">期限カレンダー</h2>
      </div>
      <ExpiryCalendar />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setMode(filter.value)}
            className={`focus-ring shrink-0 rounded-2xl px-4 py-2 text-sm font-black ${
              mode === filter.value ? "bg-cyan-700 text-white dark:bg-slate-100 dark:text-slate-950" : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <ExpiryList mode={mode} />
    </div>
  );
}
