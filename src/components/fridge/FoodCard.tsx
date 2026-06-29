import type { PointerEvent } from "react";
import { clsx } from "clsx";
import { Star } from "lucide-react";
import type { FoodItem } from "../../types";
import { getFoodStatus, type ExpiryState } from "../../utils/foodStatus";

interface FoodCardProps {
  food: FoodItem;
  warningDays: number;
  compact?: boolean;
  ghost?: boolean;
  onSelect?: (food: FoodItem) => void;
  onPointerStart?: (foodId: string, event: PointerEvent<HTMLButtonElement>) => void;
}

export function FoodCard({ food, warningDays, compact = false, ghost = false, onSelect, onPointerStart }: FoodCardProps) {
  const status = getFoodStatus(food, warningDays);
  const statusTone: Record<ExpiryState, string> = {
    expired: "border-rose-200 text-rose-800 dark:border-rose-900/70 dark:text-rose-200",
    today: "border-orange-200 text-orange-800 dark:border-orange-900/70 dark:text-orange-200",
    soon: "border-amber-200 text-amber-800 dark:border-amber-900/70 dark:text-amber-200",
    warning: "border-teal-200 text-teal-800 dark:border-teal-900/70 dark:text-teal-200",
    normal: "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200",
    none: "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400",
  };

  return (
    <button
      type="button"
      onClick={() => onSelect?.(food)}
      onPointerDown={(event) => onPointerStart?.(food.id, event)}
      className={clsx(
        "food-card focus-ring group min-w-0 rounded-xl border border-slate-200 p-2 pl-3 text-left shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.98] dark:hover:border-slate-600",
        statusTone[status.state],
        ghost && "w-44 rotate-1 opacity-95 shadow-soft",
      )}
      style={{
        background: `linear-gradient(90deg, ${food.color} 0 7px, var(--food-card-bg) 7px)`,
      }}
      aria-label={`${food.name}を開く。長押しまたはドラッグで移動`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={clsx("min-w-0 truncate font-black text-slate-900 dark:text-slate-50", compact ? "text-[12px]" : "text-sm")}>
          <span className="mr-1" aria-hidden="true">
            {food.icon}
          </span>
          {food.name}
        </span>
        {food.isPriority || food.isFavorite ? (
          <Star className="shrink-0 fill-amber-300 text-amber-500" size={compact ? 13 : 15} aria-hidden="true" />
        ) : null}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <span>
          {food.quantity}
          {food.unit}
        </span>
        <span className="truncate">{status.label}</span>
      </div>
    </button>
  );
}
