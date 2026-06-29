import { addMonths, addWeeks, eachDayOfInterval, format, isWithinInterval, subMonths, subWeeks } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { useFoodStore } from "../../store/foodStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useUiStore } from "../../store/uiStore";
import { monthRange, weekRange } from "../../utils/date";
import { Button } from "../ui/Button";
import { ExpiryDayCell } from "./ExpiryDayCell";

export function ExpiryCalendar() {
  const foods = useFoodStore((state) => state.foods);
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const selectFood = useUiStore((state) => state.selectFood);
  const [anchor, setAnchor] = useState(new Date());
  const view = settings?.calendarView ?? "month";
  const warningDays = settings?.warningDays ?? 7;

  const range = view === "month" ? monthRange(anchor) : weekRange(anchor);
  const days = eachDayOfInterval(range);
  const title = format(anchor, view === "month" ? "yyyy年M月" : "yyyy年M月d日", { locale: ja });

  const foodByDate = useMemo(() => {
    const map = new Map<string, typeof foods>();
    for (const food of foods) {
      for (const date of [food.expireDate, food.bestBeforeDate]) {
        if (!date) continue;
        const list = map.get(date) ?? [];
        list.push(food);
        map.set(date, list);
      }
    }
    return map;
  }, [foods]);

  const inRangeCount = foods.filter((food) =>
    [food.expireDate, food.bestBeforeDate].some((date) => date && isWithinInterval(new Date(`${date}T00:00:00`), range)),
  ).length;

  const goPrev = () => setAnchor((date) => (view === "month" ? subMonths(date, 1) : subWeeks(date, 1)));
  const goNext = () => setAnchor((date) => (view === "month" ? addMonths(date, 1) : addWeeks(date, 1)));

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-cyan-700 dark:text-teal-300">
            <CalendarDays size={15} />
            Expiry
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{inRangeCount}件の期限があります</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={goPrev} aria-label="前へ">
            <ChevronLeft size={18} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAnchor(new Date())}>
            今日
          </Button>
          <Button variant="secondary" size="icon" onClick={goNext} aria-label="次へ">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="mt-4 inline-flex rounded-lg bg-slate-100 p-1 transition-colors dark:bg-slate-950">
        {(["month", "week"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => void updateSettings({ calendarView: item })}
            className={`focus-ring rounded-md px-4 py-2 text-sm font-semibold ${
              view === item ? "bg-white text-cyan-900 shadow-sm dark:bg-slate-100 dark:text-slate-950" : "text-cyan-700 dark:text-teal-200"
            }`}
          >
            {item === "month" ? "月表示" : "週表示"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <ExpiryDayCell
              key={key}
              day={day}
              anchor={anchor}
              foods={foodByDate.get(key) ?? []}
              warningDays={warningDays}
              onSelectFood={selectFood}
            />
          );
        })}
      </div>
    </section>
  );
}
