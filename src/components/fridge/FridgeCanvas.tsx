import type { PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
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
}

function findAreaFromPoint(x: number, y: number) {
  const elements = document.elementsFromPoint(x, y);
  const area = elements.find((element): element is HTMLElement => element instanceof HTMLElement && Boolean(element.dataset.areaId));
  return area?.dataset.areaId;
}

export function FridgeCanvas({ search = "", onSearchChange }: FridgeCanvasProps) {
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(320px,560px)_1fr]">
      <section className="rounded-[1.75rem] border border-cyan-100 bg-white/78 p-3 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">冷蔵庫の中を検索</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="冷蔵庫の中を検索"
              className="focus-ring w-full rounded-2xl border border-cyan-100 bg-white py-3 pl-11 pr-4 text-base font-semibold shadow-sm"
            />
          </label>
          <Button onClick={() => openFoodForm()} className="hidden sm:inline-flex">
            食材追加
          </Button>
        </div>

        <div className="mx-auto aspect-[9/15] w-full max-w-[520px] rounded-[2rem] border-[10px] border-slate-100 bg-gradient-to-b from-white via-cyan-50 to-slate-100 p-3 shadow-inner">
          <div className="fridge-grid relative h-full overflow-hidden rounded-[1.45rem] border border-cyan-100 bg-cyan-50/60">
            <div className="absolute inset-x-[5%] top-2 h-2 rounded-full bg-white/75" />
            <div className="absolute bottom-3 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-full bg-slate-200/80" />
            {shelfLines.map((top) => (
              <FridgeShelf key={top} top={top} />
            ))}
            {areas.map((area) => (
              <FridgeArea
                key={area.id}
                area={area}
                foods={visibleFoods.filter((food) => food.areaId === area.id)}
                warningDays={warningDays}
                activeDrop={drag?.activeAreaId === area.id}
                onSelectFood={handleSelectFood}
                onPointerStart={handlePointerStart}
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="grid content-start gap-4">
        <section className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Today</p>
              <h2 className="text-xl font-black text-slate-900">今日見ておきたいもの</h2>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">{foods.length}品</span>
          </div>
          <div className="mt-4 grid gap-2">
            {urgentFoods.map(({ food }) => (
              <FoodCard key={food.id} food={food} warningDays={warningDays} onSelect={handleSelectFood} />
            ))}
            {urgentFoods.length === 0 ? (
              <EmptyState title="急ぎの食材はありません">期限に余裕がある状態です。使いたい食材を優先にしておくと、ここへ出てきます。</EmptyState>
            ) : null}
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5">
          <h2 className="text-lg font-black text-slate-900">動かし方</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            食材カードを指やマウスで押したまま動かすと、移動先のエリアが光ります。離すと保存場所が自動で保存されます。
          </p>
        </section>
      </aside>

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
