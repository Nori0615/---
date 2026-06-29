import type { PointerEvent } from "react";
import { clsx } from "clsx";
import { Archive, Box, CloudSnow, Move, PanelRight, Rows3, Snowflake, Sprout } from "lucide-react";
import type { FoodItem, FridgeArea as FridgeAreaType } from "../../types";
import { FoodCard } from "./FoodCard";

const areaIcons = {
  Snowflake,
  CloudSnow,
  Sprout,
  PanelRight,
  Rows3,
  Box,
  Move,
  Archive,
};

interface FridgeAreaProps {
  area: FridgeAreaType;
  foods: FoodItem[];
  warningDays: number;
  activeDrop?: boolean;
  selected?: boolean;
  editing?: boolean;
  onSelectArea?: (areaId: string) => void;
  onSelectFood: (food: FoodItem) => void;
  onPointerStart: (foodId: string, event: PointerEvent<HTMLButtonElement>) => void;
}

export function FridgeArea({
  area,
  foods,
  warningDays,
  activeDrop,
  selected,
  editing,
  onSelectArea,
  onSelectFood,
  onPointerStart,
}: FridgeAreaProps) {
  const Icon = areaIcons[area.icon as keyof typeof areaIcons] ?? Archive;

  return (
    <section
      data-area-id={area.id}
      onClick={() => onSelectArea?.(area.id)}
      className={clsx(
        "fridge-area absolute overflow-hidden rounded-lg border bg-white/75 p-2 shadow-[inset_0_1px_12px_rgba(255,255,255,0.55)] transition dark:bg-slate-900/70 dark:shadow-none",
        editing && "cursor-pointer",
        activeDrop && "border-teal-500 ring-4 ring-teal-300/35",
        selected && !activeDrop && "border-slate-900 ring-4 ring-slate-900/10 dark:border-slate-100 dark:ring-slate-100/15",
        !activeDrop && !selected && "border-slate-200/70 dark:border-slate-700/70",
      )}
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
        background: `linear-gradient(145deg, ${area.color}, var(--fridge-area-bg))`,
      }}
      aria-label={`${area.name}エリア`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
        <span className="flex min-w-0 items-center gap-1 truncate rounded-md bg-white/55 px-1.5 py-0.5 shadow-sm backdrop-blur-sm dark:bg-slate-950/45">
          <Icon size={13} className="text-slate-500 dark:text-slate-300" aria-hidden="true" />
          <span className="truncate">{area.name}</span>
        </span>
        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm dark:bg-slate-950/70 dark:text-slate-300">
          {foods.length}
        </span>
      </div>
      <div className="grid max-h-[calc(100%-26px)] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {foods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            warningDays={warningDays}
            compact
            onSelect={onSelectFood}
            onPointerStart={onPointerStart}
          />
        ))}
      </div>
    </section>
  );
}
