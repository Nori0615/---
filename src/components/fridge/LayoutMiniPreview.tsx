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
  className?: string;
}

export function LayoutMiniPreview({ selectedAreaId, onSelectArea, compact = false, className }: LayoutMiniPreviewProps) {
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
        "pointer-events-auto rounded-[1.25rem] border border-slate-200/90 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur",
        compact ? "p-2" : "p-3",
        className,
      )}
      aria-label="冷蔵庫レイアウトのミニプレビュー"
    >
      <div className={clsx("mb-2 flex items-center justify-between gap-2", compact && "mb-1")}>
        <div className="min-w-0">
          <p className={clsx("font-black text-teal-700", compact ? "text-[10px]" : "text-xs")}>Preview</p>
          {!compact ? (
            <p className="truncate text-sm font-black text-slate-900">{selectedArea?.name ?? "エリアを選択"}</p>
          ) : null}
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700" aria-hidden="true">
          <PictureInPicture2 size={compact ? 15 : 17} />
        </span>
      </div>

      <div className={clsx("mx-auto aspect-[9/15] w-full", compact ? "max-w-[112px]" : "max-w-[190px]")}>
        <div className="relative h-full overflow-hidden rounded-[1.05rem] border-[5px] border-slate-100 bg-gradient-to-b from-white via-slate-50 to-teal-50 p-1.5 shadow-inner">
          <div className="fridge-grid relative h-full overflow-hidden rounded-[0.8rem] border border-slate-200 bg-white/70">
            <div className="absolute inset-x-[8%] top-1.5 h-1 rounded-full bg-white shadow-sm" />
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
                    "absolute overflow-hidden rounded-md border text-left transition hover:brightness-105",
                    selected ? "z-10 border-slate-950 ring-2 ring-slate-950/20" : "border-white/80",
                  )}
                  style={{
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                    background: `linear-gradient(145deg, ${area.color}, rgba(255,255,255,0.86))`,
                  }}
                  aria-label={`${area.name}を編集対象にする`}
                >
                  <span className="flex h-full min-h-0 flex-col justify-between p-1">
                    <span className={clsx("truncate font-black text-slate-700", compact ? "text-[8px]" : "text-[10px]")}>{area.name}</span>
                    {count > 0 ? (
                      <span className="self-end rounded-full bg-white/85 px-1 text-[8px] font-black text-slate-600 shadow-sm">{count}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {!compact ? (
        <p className="mt-2 truncate text-xs font-bold text-slate-500">
          {selectedArea ? `${areaTypeLabel(selectedArea.type)} / ${Math.round(selectedArea.width)} x ${Math.round(selectedArea.height)}` : "クリックで選択できます"}
        </p>
      ) : null}
    </section>
  );
}
