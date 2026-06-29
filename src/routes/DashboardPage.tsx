import { AlertTriangle, Boxes, CalendarClock, Heart, Refrigerator, Sparkles } from "lucide-react";
import { CategorySummary } from "../components/dashboard/CategorySummary";
import { StatCard } from "../components/dashboard/StatCard";
import { FoodCard } from "../components/fridge/FoodCard";
import { QuickAddFood } from "../components/food/QuickAddFood";
import { EmptyState } from "../components/ui/EmptyState";
import { useFoodStore } from "../store/foodStore";
import { useFridgeStore } from "../store/fridgeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useUiStore } from "../store/uiStore";
import { FOOD_CATEGORIES } from "../types";
import { getFoodStatus } from "../utils/foodStatus";

export function DashboardPage() {
  const foods = useFoodStore((state) => state.foods);
  const areas = useFridgeStore((state) => state.areas);
  const warningDays = useSettingsStore((state) => state.settings?.warningDays ?? 7);
  const selectFood = useUiStore((state) => state.selectFood);
  const rows = foods.map((food) => ({ food, status: getFoodStatus(food, warningDays) }));
  const expired = rows.filter(({ status }) => status.state === "expired").length;
  const today = rows.filter(({ status }) => status.state === "today").length;
  const soon = rows.filter(({ status }) => (status.daysLeft ?? 999) <= 3 && (status.daysLeft ?? 999) >= 0).length;
  const priority = foods.filter((food) => food.isPriority);
  const recent = [...foods].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const categoryRows = FOOD_CATEGORIES.map((category) => ({
    label: category,
    count: foods.filter((food) => food.category === category).length,
  })).filter((row) => row.count > 0);

  const areaRows = areas
    .map((area) => ({
      label: area.name,
      count: foods.filter((food) => food.areaId === area.id).length,
      color: area.color,
    }))
    .filter((row) => row.count > 0);

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-semibold text-cyan-700 dark:text-teal-300">Dashboard</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">冷蔵庫の今</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="登録食材" value={foods.length} helper="冷蔵庫に入っている数" icon={Refrigerator} tone="cyan" />
        <StatCard label="期限切れ" value={expired} helper="早めに確認したい食材" icon={AlertTriangle} tone="rose" />
        <StatCard label="今日まで" value={today} helper="今日使うと安心" icon={CalendarClock} tone="amber" />
        <StatCard label="3日以内" value={soon} helper="献立候補に入れたい食材" icon={Sparkles} tone="emerald" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <CategorySummary title="カテゴリ別" rows={categoryRows} />
        <CategorySummary title="保存場所別" rows={areaRows} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-4 flex items-center gap-2">
            <Heart size={18} className="text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">優先的に使いたい食材</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {priority.length > 0 ? (
              priority.map((food) => <FoodCard key={food.id} food={food} warningDays={warningDays} onSelect={() => selectFood(food.id)} />)
            ) : (
              <EmptyState title="優先食材はありません">食材編集で「優先」を付けると、ここにまとまります。</EmptyState>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-4 flex items-center gap-2">
            <Boxes size={18} className="text-cyan-700 dark:text-teal-300" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">最近追加</h2>
          </div>
          <div className="grid gap-2">
            {recent.map((food) => (
              <FoodCard key={food.id} food={food} warningDays={warningDays} onSelect={() => selectFood(food.id)} />
            ))}
          </div>
        </section>
      </div>

      <QuickAddFood />
    </div>
  );
}
