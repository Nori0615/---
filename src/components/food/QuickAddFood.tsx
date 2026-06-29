import { Plus } from "lucide-react";
import { useFoodStore } from "../../store/foodStore";
import { useFridgeStore } from "../../store/fridgeStore";
import { useUiStore } from "../../store/uiStore";
import type { FoodDraft } from "../../types";
import { Button } from "../ui/Button";

export function QuickAddFood() {
  const foods = useFoodStore((state) => state.foods);
  const addFood = useFoodStore((state) => state.addFood);
  const areas = useFridgeStore((state) => state.areas);
  const showToast = useUiStore((state) => state.showToast);
  const openFoodForm = useUiStore((state) => state.openFoodForm);
  const favorites = foods.filter((food) => food.isFavorite).slice(0, 5);

  const addFavorite = async (sourceId: string) => {
    const source = foods.find((food) => food.id === sourceId);
    if (!source) return;
    const draft: FoodDraft = {
      name: source.name,
      category: source.category,
      quantity: 1,
      unit: source.unit,
      areaId: source.areaId || areas[0]?.id || "",
      expireDate: undefined,
      bestBeforeDate: undefined,
      memo: "",
      color: source.color,
      icon: source.icon,
      isOpened: false,
      isFavorite: source.isFavorite,
      isPriority: false,
    };
    await addFood(draft);
    showToast(`${source.name}を追加しました`);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Quick</p>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">すぐ追加</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openFoodForm()}>
          <Plus size={16} />
          入力
        </Button>
      </div>
      {favorites.length > 0 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {favorites.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => void addFavorite(food.id)}
              className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span aria-hidden="true">{food.icon}</span>
              {food.name}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
