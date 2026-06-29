import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { useFoodStore } from "../../store/foodStore";
import { useFridgeStore } from "../../store/fridgeStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useUiStore } from "../../store/uiStore";
import type { FoodItem } from "../../types";
import { getFoodStatus } from "../../utils/foodStatus";
import { FoodCard } from "./FoodCard";
import { FridgeArea } from "./FridgeArea";
import { FridgeShelf } from "./FridgeShelf";

interface DragState {
  foodId: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  activeAreaId?: string;
  isDragging: boolean;
}

interface FridgeCanvasProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  mode?: "view" | "editor";
  selectedAreaId?: string;
  onSelectArea?: (areaId: string) => void;
}

function findAreaFromPoint(x: number, y: number) {
  const elements = document.elementsFromPoint(x, y);
  const area = elements.find((element): element is HTMLElement => element instanceof HTMLElement && Boolean(element.dataset.areaId));
  return area?.dataset.areaId;
}

export function FridgeCanvas({ search = "", onSearchChange, mode = "view", selectedAreaId, onSelectArea }: FridgeCanvasProps) {
  const areas = useFridgeStore((state) => state.areas);
  const foods = useFoodStore((state) => state.foods);
  const moveFood = useFoodStore((state) => state.moveFood);
  const settings = useSettingsStore((state) => state.settings);
  const selectFood = useUiStore((state) => state.selectFood);
  const showToast = useUiStore((state) => state.showToast);
  const openFoodForm = useUiStore((state) => state.openFoodForm);
  const [drag, setDrag] = useState<DragState>();
  const suppressClick = useRef(false);

  const warningDays = settings?.warningDays ?? 7;
  const compactLayout = settings?.layoutMode === "compact";
  const compactDensity = settings?.density === "compact";
  const normalizedSearch = search.trim().toLowerCase();
  const visibleFoods = useMemo(
    () =>
      foods.filter((food) => {
        if (!normalizedSearch) return true;
        return `${food.name} ${food.category} ${food.memo ?? ""}`.toLowerCase().includes(normalizedSearch);
      }),
    [foods, normalizedSearch],
  );

  const shelfLines = areas
    .filter((area) => area.type !== "door")
    .map((area) => area.y + area.height)
    .filter((top) => top > 12 && top < 92);

  const draggingFood = drag ? foods.find((food) => food.id === drag.foodId) : undefined;

  const handlePointerStart = (foodId: string, event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    setDrag({
      foodId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      isDragging: false,
    });
  };

  useEffect(() => {
    if (!drag) return;

    const move = (event: PointerEvent | globalThis.PointerEvent) => {
      const dx = Math.abs(event.clientX - drag.startX);
      const dy = Math.abs(event.clientY - drag.startY);
      const isDragging = drag.isDragging || dx + dy > 8;
      setDrag((current) =>
        current
          ? {
              ...current,
              x: event.clientX,
              y: event.clientY,
              isDragging,
              activeAreaId: isDragging ? findAreaFromPoint(event.clientX, event.clientY) : undefined,
            }
          : undefined,
      );
    };

    const up = () => {
      setDrag((current) => {
        if (!current) return undefined;
        if (current.isDragging) {
          suppressClick.current = true;
          const targetArea = current.activeAreaId;
          const food = foods.find((item) => item.id === current.foodId);
          if (targetArea && food && food.areaId !== targetArea) {
            void moveFood(current.foodId, targetArea).then(() => showToast("保存場所を移動しました"));
          }
          window.setTimeout(() => {
            suppressClick.current = false;
          }, 120);
        }
        return undefined;
      });
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, foods, moveFood, showToast]);

  const handleSelectFood = (food: FoodItem) => {
    if (suppressClick.current) return;
    selectFood(food.id);
  };

  const urgentFoods = foods
    .map((food) => ({ food, status: getFoodStatus(food, warningDays) }))
    .filter(({ status }) => ["expired", "today", "soon"].includes(status.state))
    .sort((a, b) => (a.status.daysLeft ?? 99) - (b.status.daysLeft ?? 99))
    .slice(0, 4);

  const editorMode = mode === "editor";

  return (
    <div className={editorMode ? "grid min-w-0 gap-4" : "grid min-w-0 gap-4 lg:grid-cols-[minmax(320px,560px)_1fr]"}>
      <section
        className={clsx(
          "min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90",
          compactDensity ? "p-2.5" : "p-3",
        )}
      >
        {!editorMode ? (
          <div className="mb-3 flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">冷蔵庫の中を検索</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder="冷蔵庫の中を検索"
                className="focus-ring w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-[15px] font-normal text-slate-800 shadow-sm placeholder:text-slate-400 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>
            <Button onClick={() => openFoodForm()} className="hidden sm:inline-flex">
              食材追加
            </Button>
          </div>
        ) : null}

        <div
          className={clsx(
            "mx-auto w-full border-slate-100 bg-gradient-to-b from-white via-slate-50 to-teal-50 shadow-inner dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/80",
            compactLayout ? "aspect-[9/12] max-w-[min(430px,100%)] rounded-xl border-[5px] p-2" : "aspect-[9/15] max-w-[min(520px,100%)] rounded-xl border-[6px] p-2.5",
          )}
        >
          <div className="fridge-grid relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/45">
            <div className="absolute inset-x-[6%] top-2 h-1.5 rounded-full bg-white shadow-sm dark:bg-slate-700" />
            <div className="absolute bottom-3 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
            {shelfLines.map((top, index) => (
              <FridgeShelf key={`${top}-${index}`} top={top} />
            ))}
            {areas.map((area) => (
              <FridgeArea
                key={area.id}
                area={area}
                foods={visibleFoods.filter((food) => food.areaId === area.id)}
                warningDays={warningDays}
                activeDrop={drag?.activeAreaId === area.id}
                selected={selectedAreaId === area.id}
                editing={editorMode}
                onSelectArea={onSelectArea}
                onSelectFood={handleSelectFood}
                onPointerStart={handlePointerStart}
              />
            ))}
          </div>
        </div>
      </section>

      {!editorMode ? (
        <aside className={clsx("grid content-start", compactDensity ? "gap-3" : "gap-4")}>
          <section
            className={clsx(
              "rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90",
              compactDensity ? "p-4" : "p-5",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Today</p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">今日見ておきたいもの</h2>
              </div>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{foods.length}品</span>
            </div>
            <div className={clsx("grid gap-2", compactDensity ? "mt-3" : "mt-4")}>
              {urgentFoods.map(({ food }) => (
                <FoodCard key={food.id} food={food} warningDays={warningDays} onSelect={handleSelectFood} />
              ))}
              {urgentFoods.length === 0 ? (
                <EmptyState title="急ぎの食材はありません">期限に余裕がある状態です。使いたい食材を優先にしておくと、ここへ出てきます。</EmptyState>
              ) : null}
            </div>
          </section>
        </aside>
      ) : null}

      {drag?.isDragging && draggingFood ? (
        <div
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2"
          style={{ left: drag.x, top: drag.y }}
          aria-hidden="true"
        >
          <FoodCard food={draggingFood} warningDays={warningDays} ghost />
        </div>
      ) : null}
    </div>
  );
}
