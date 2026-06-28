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
        "absolute overflow-hidden rounded-[1rem] border bg-white/75 p-2 shadow-[inset_0_1px_18px_rgba(255,255,255,0.75)] transition",
        editing && "cursor-pointer",
        activeDrop && "border-teal-500 ring-4 ring-teal-300/35",
        selected && !activeDrop && "border-slate-900 ring-4 ring-slate-900/10",
        !activeDrop && !selected && "border-white/80",
      )}
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
        background: `linear-gradient(145deg, ${area.color}, rgba(255,255,255,0.82))`,
      }}
      aria-label={`${area.name}エリア`}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-black text-slate-700">
        <span className="flex min-w-0 items-center gap-1 truncate">
          <Icon size={13} className="text-slate-500" aria-hidden="true" />
          <span className="truncate">{area.name}</span>
        </span>
        <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500 shadow-sm">{foods.length}</span>
      </div>
      <div className="grid max-h-[calc(100%-24px)] grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
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
