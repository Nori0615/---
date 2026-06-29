import { clsx } from "clsx";
import { format, isSameDay, isSameMonth } from "date-fns";
import type { FoodItem } from "../../types";
import { getFoodStatus } from "../../utils/foodStatus";

interface ExpiryDayCellProps {
  day: Date;
  anchor: Date;
  foods: FoodItem[];
  warningDays: number;
  onSelectFood: (id: string) => void;
}

export function ExpiryDayCell({ day, anchor, foods, warningDays, onSelectFood }: ExpiryDayCellProps) {
  const today = isSameDay(day, new Date());

  return (
    <div
      className={clsx(
        "min-h-28 rounded-2xl border p-2",
        isSameMonth(day, anchor)
          ? "border-cyan-100 bg-white/90 dark:border-slate-700 dark:bg-slate-950/60"
          : "border-slate-100 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-500",
        today && "ring-2 ring-cyan-400",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={clsx("grid h-7 w-7 place-items-center rounded-full text-sm font-black", today ? "bg-cyan-700 text-white" : "text-slate-700 dark:text-slate-300")}>
          {format(day, "d")}
        </span>
        {foods.length > 0 ? <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-black text-cyan-800 dark:bg-teal-950 dark:text-teal-200">{foods.length}</span> : null}
      </div>
      <div className="grid gap-1">
        {foods.slice(0, 4).map((food) => {
          const status = getFoodStatus(food, warningDays);
          const kind = food.expireDate === format(day, "yyyy-MM-dd") ? "消" : "賞";
          return (
            <button
              key={`${food.id}-${kind}`}
              type="button"
              onClick={() => onSelectFood(food.id)}
              className={clsx(
                "focus-ring flex items-center gap-1 rounded-xl px-2 py-1 text-left text-[11px] font-black",
                status.state === "expired" && "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200",
                status.state === "today" && "bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200",
                status.state === "soon" && "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
                !["expired", "today", "soon"].includes(status.state) && "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
              )}
            >
              <span className="rounded bg-white/70 px-1 dark:bg-slate-950/70">{kind}</span>
              <span className="truncate">{food.name}</span>
            </button>
          );
        })}
        {foods.length > 4 ? <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">+{foods.length - 4}件</p> : null}
      </div>
    </div>
  );
}
