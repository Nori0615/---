import { clsx } from "clsx";
import { format, isSameDay, isSameMonth } from "date-fns";
import { Plus } from "lucide-react";
import type { FoodItem } from "../../types";
import { getFoodStatus } from "../../utils/foodStatus";

interface ExpiryDayCellProps {
  day: Date;
  anchor: Date;
  foods: FoodItem[];
  warningDays: number;
  onSelectFood: (id: string) => void;
  onAddFood?: (date: string) => void;
}

export function ExpiryDayCell({ day, anchor, foods, warningDays, onSelectFood, onAddFood }: ExpiryDayCellProps) {
  const today = isSameDay(day, new Date());
  const dateKey = format(day, "yyyy-MM-dd");
  const addFood = () => onAddFood?.(dateKey);

  return (
    <div
      role={onAddFood ? "button" : undefined}
      tabIndex={onAddFood ? 0 : undefined}
      onClick={addFood}
      onKeyDown={(event) => {
        if (!onAddFood || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        addFood();
      }}
      className={clsx(
        "min-h-28 rounded-lg border p-2 transition",
        onAddFood && "cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/60 dark:hover:border-teal-700 dark:hover:bg-teal-950/35",
        isSameMonth(day, anchor)
          ? "border-cyan-100 bg-white/90 dark:border-slate-700 dark:bg-slate-950/60"
          : "border-slate-100 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-500",
        today && "ring-2 ring-cyan-400",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={clsx("grid h-7 w-7 place-items-center rounded-md text-sm font-semibold", today ? "bg-cyan-700 text-white" : "text-slate-700 dark:text-slate-300")}>
          {format(day, "d")}
        </span>
        <span className="flex items-center gap-1">
          {foods.length > 0 ? <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800 dark:bg-teal-950 dark:text-teal-200">{foods.length}</span> : null}
          {onAddFood ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                addFood();
              }}
              className="focus-ring grid h-7 w-7 place-items-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-cyan-100 hover:text-cyan-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-950 dark:hover:text-teal-100"
              aria-label={`${format(day, "M月d日")}に食材を追加`}
            >
              <Plus size={14} />
            </button>
          ) : null}
        </span>
      </div>
      <div className="grid gap-1">
        {foods.slice(0, 4).map((food) => {
          const status = getFoodStatus(food, warningDays);
          const kind = food.expireDate === format(day, "yyyy-MM-dd") ? "消" : "賞";
          return (
            <button
              key={`${food.id}-${kind}`}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSelectFood(food.id);
              }}
              className={clsx(
                "focus-ring flex items-center gap-1 rounded-md px-2 py-1 text-left text-[11px] font-semibold",
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
