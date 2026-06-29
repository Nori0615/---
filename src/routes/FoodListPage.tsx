import { useMemo, useState } from "react";
import { Edit3, Trash2 } from "lucide-react";
import { FoodSearch, type FoodSort } from "../components/food/FoodSearch";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Select } from "../components/ui/Select";
import { useFoodStore } from "../store/foodStore";
import { useFridgeStore } from "../store/fridgeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useUiStore } from "../store/uiStore";
import type { FoodCategory } from "../types";
import { compactDate } from "../utils/date";
import { getFoodStatus, statusClass } from "../utils/foodStatus";

export function FoodListPage() {
  const foods = useFoodStore((state) => state.foods);
  const deleteFood = useFoodStore((state) => state.deleteFood);
  const moveFood = useFoodStore((state) => state.moveFood);
  const areas = useFridgeStore((state) => state.areas);
  const warningDays = useSettingsStore((state) => state.settings?.warningDays ?? 7);
  const openFoodForm = useUiStore((state) => state.openFoodForm);
  const selectFood = useUiStore((state) => state.selectFood);
  const showToast = useUiStore((state) => state.showToast);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | FoodCategory>("all");
  const [areaId, setAreaId] = useState("all");
  const [sort, setSort] = useState<FoodSort>("expiry");
  const [onlyExpired, setOnlyExpired] = useState(false);
  const [onlyOpened, setOnlyOpened] = useState(false);
  const [onlyPriority, setOnlyPriority] = useState(false);

  const areaOptions = areas.map((area) => ({ value: area.id, label: area.name }));

  const visibleFoods = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return foods
      .map((food) => ({ food, status: getFoodStatus(food, warningDays) }))
      .filter(({ food, status }) => {
        if (normalized && !`${food.name} ${food.memo ?? ""}`.toLowerCase().includes(normalized)) return false;
        if (category !== "all" && food.category !== category) return false;
        if (areaId !== "all" && food.areaId !== areaId) return false;
        if (onlyExpired && status.state !== "expired") return false;
        if (onlyOpened && !food.isOpened) return false;
        if (onlyPriority && !food.isPriority) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "name") return a.food.name.localeCompare(b.food.name, "ja");
        if (sort === "created") return b.food.createdAt.localeCompare(a.food.createdAt);
        return (a.status.daysLeft ?? 9999) - (b.status.daysLeft ?? 9999);
      });
  }, [areaId, category, foods, onlyExpired, onlyOpened, onlyPriority, search, sort, warningDays]);

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`${name}を削除しますか？`)) return;
    await deleteFood(id);
    showToast("食材を削除しました", "info");
  };

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black text-cyan-700 dark:text-teal-300">Food List</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">食材一覧</h2>
      </div>
      <FoodSearch
        search={search}
        category={category}
        areaId={areaId}
        sort={sort}
        onlyExpired={onlyExpired}
        onlyOpened={onlyOpened}
        onlyPriority={onlyPriority}
        areaOptions={areaOptions}
        onSearch={setSearch}
        onCategory={setCategory}
        onArea={setAreaId}
        onSort={setSort}
        onOnlyExpired={setOnlyExpired}
        onOnlyOpened={setOnlyOpened}
        onOnlyPriority={setOnlyPriority}
      />

      <div className="grid gap-3">
        {visibleFoods.length > 0 ? (
          visibleFoods.map(({ food, status }) => (
            <section key={food.id} className="rounded-[1.5rem] border border-cyan-100 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button type="button" onClick={() => selectFood(food.id)} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-2xl text-left">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl" style={{ backgroundColor: food.color }}>
                    {food.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-black text-slate-900 dark:text-slate-50">{food.name}</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      {food.category} ・ {food.quantity}
                      {food.unit}
                    </span>
                  </span>
                </button>
                <span className={`rounded-2xl border px-3 py-2 text-sm font-black ${statusClass(status.state)}`}>
                  {compactDate(status.date)} {status.label}
                </span>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <Select
                  label="保存場所"
                  value={food.areaId}
                  onChange={(event) => void moveFood(food.id, event.target.value).then(() => showToast("保存場所を移動しました"))}
                  options={areaOptions}
                />
                <div className="flex items-end gap-2">
                  <Button variant="secondary" onClick={() => openFoodForm(food.id)}>
                    <Edit3 size={17} />
                    編集
                  </Button>
                  <Button variant="ghost" onClick={() => void remove(food.id, food.name)}>
                    <Trash2 size={17} />
                    削除
                  </Button>
                </div>
              </div>
            </section>
          ))
        ) : (
          <EmptyState title="食材が見つかりません">検索やフィルターを少しゆるめると見つかるかもしれません。</EmptyState>
        )}
      </div>
    </div>
  );
}
