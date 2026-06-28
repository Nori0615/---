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
    <section className="rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Quick</p>
          <h2 className="text-lg font-black text-slate-900">すぐ追加</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openFoodForm()}>
          <Plus size={16} />
          入力
        </Button>
      </div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {favorites.length > 0 ? (
          favorites.map((food) => (
            <button
              key={food.id}
              type="button"
              onClick={() => void addFavorite(food.id)}
              className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-800 hover:bg-white"
            >
              <span aria-hidden="true">{food.icon}</span>
              {food.name}
            </button>
          ))
        ) : (
          <p className="text-sm text-slate-500">食材を「よく使う」にするとここからワンタップで追加できます。</p>
        )}
      </div>
    </section>
  );
}
