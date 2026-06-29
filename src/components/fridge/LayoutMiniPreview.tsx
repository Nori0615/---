import { clsx } from "clsx";
import { PictureInPicture2 } from "lucide-react";
import { useMemo } from "react";
import { useFoodStore } from "../../store/foodStore";
import { useFridgeStore } from "../../store/fridgeStore";
import { areaTypeLabel } from "../../utils/layout";
import { FridgeShelf } from "./FridgeShelf";

interface LayoutMiniPreviewProps {
  selectedAreaId?: string;
  onSelectArea?: (areaId: string) => void;
  compact?: boolean;
  fluid?: boolean;
  className?: string;
}

export function LayoutMiniPreview({ selectedAreaId, onSelectArea, compact = false, fluid = false, className }: LayoutMiniPreviewProps) {
  const areas = useFridgeStore((state) => state.areas);
  const foods = useFoodStore((state) => state.foods);
  const selectedArea = areas.find((area) => area.id === selectedAreaId);

  const foodCounts = useMemo(() => {
    return foods.reduce<Record<string, number>>((counts, food) => {
      counts[food.areaId] = (counts[food.areaId] ?? 0) + 1;
      return counts;
    }, {});
  }, [foods]);

  const shelfLines = areas
    .filter((area) => area.type !== "door")
    .map((area) => area.y + area.height)
    .filter((top) => top > 12 && top < 92);

  return (
    <section
      className={clsx(
        "pointer-events-auto relative rounded-xl border border-slate-200/90 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-900/95",
        compact ? "p-1.5" : "p-3",
        className,
      )}
      aria-label="冷蔵庫レイアウトのミニプレビュー"
    >
      {compact ? (
        <span className="absolute right-2 top-2 z-20 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/90 text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-200" aria-hidden="true">
          <PictureInPicture2 size={12} />
        </span>
      ) : (
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Preview</p>
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{selectedArea?.name ?? "エリアを選択"}</p>
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" aria-hidden="true">
            <PictureInPicture2 size={17} />
          </span>
        </div>
      )}

      <div className={clsx("mx-auto aspect-[9/15] w-full", fluid ? "max-w-none" : compact ? "max-w-[72px]" : "max-w-[190px]")}>
        <div
          className={clsx(
            "relative h-full overflow-hidden border-slate-100 bg-gradient-to-b from-white via-slate-50 to-teal-50 shadow-inner dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/80",
            compact ? "rounded-[0.85rem] border-[4px] p-1" : "rounded-[1.05rem] border-[5px] p-1.5",
          )}
        >
          <div className={clsx("fridge-grid relative h-full overflow-hidden border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/45", compact ? "rounded-[0.6rem]" : "rounded-[0.8rem]")}>
            <div className="absolute inset-x-[8%] top-1.5 h-1 rounded-full bg-white shadow-sm dark:bg-slate-700" />
            {shelfLines.map((top, index) => (
              <FridgeShelf key={`${top}-${index}`} top={top} />
            ))}
            {areas.map((area) => {
              const selected = area.id === selectedAreaId;
              const count = foodCounts[area.id] ?? 0;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onSelectArea?.(area.id)}
                  className={clsx(
                    "absolute overflow-hidden border text-left transition hover:brightness-105",
                    compact ? "rounded-[0.25rem]" : "rounded-md",
                    selected ? "z-10 border-slate-950 ring-2 ring-slate-950/20 dark:border-slate-100 dark:ring-slate-100/20" : "border-white/80 dark:border-slate-700/70",
                  )}
                  style={{
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                    background: `linear-gradient(145deg, ${area.color}, var(--fridge-area-bg))`,
                  }}
                  aria-label={`${area.name}を編集対象にする`}
                >
                  <span className="flex h-full min-h-0 flex-col justify-between p-1">
                    <span className={compact ? "sr-only" : "truncate text-[10px] font-semibold text-slate-700 dark:text-slate-200"}>{area.name}</span>
                    {!compact && count > 0 ? (
                      <span className="self-end rounded-md bg-white/90 px-1 text-[8px] font-semibold text-slate-600 shadow-sm dark:bg-slate-950/70 dark:text-slate-300">{count}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!compact ? (
        <p className="mt-2 truncate text-xs font-bold text-slate-500 dark:text-slate-400">
          {selectedArea ? `${areaTypeLabel(selectedArea.type)} / ${Math.round(selectedArea.width)} x ${Math.round(selectedArea.height)}` : "未選択"}
        </p>
      ) : null}
    </section>
  );
}
