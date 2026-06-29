import { ChefHat, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { useFoodStore } from "../store/foodStore";
import { useSettingsStore } from "../store/settingsStore";
import { getFoodStatus } from "../utils/foodStatus";

interface RecipeSuggestion {
  title: string;
  time?: string;
  servings?: string;
  ingredients: string[];
  steps: string[];
  tips?: string;
}

interface RecipeResponse {
  recipes: RecipeSuggestion[];
}

const recipeApiUrl = (import.meta.env.VITE_RECIPE_API_URL as string | undefined)?.trim() || "/api/recipes";

export function RecipesPage() {
  const foods = useFoodStore((state) => state.foods);
  const settings = useSettingsStore((state) => state.settings);
  const warningDays = settings?.warningDays ?? 7;
  const initialized = useRef(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialized.current || foods.length === 0) return;
    initialized.current = true;
    setSelectedIds(foods.slice(0, 24).map((food) => food.id));
  }, [foods]);

  const selectedFoods = useMemo(() => foods.filter((food) => selectedIds.includes(food.id)), [foods, selectedIds]);
  const urgentIds = useMemo(
    () =>
      foods
        .filter((food) => ["expired", "today", "soon"].includes(getFoodStatus(food, warningDays).state))
        .map((food) => food.id),
    [foods, warningDays],
  );

  const toggleFood = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const suggestRecipes = async () => {
    if (selectedFoods.length === 0) {
      setError("食材を1つ以上選んでください。");
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(recipeApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedFoods.map((food) => ({
            name: food.name,
            quantity: food.quantity,
            unit: food.unit,
            category: food.category,
            expireDate: food.expireDate,
            bestBeforeDate: food.bestBeforeDate,
            memo: food.memo,
            isOpened: food.isOpened,
            isPriority: food.isPriority,
          })),
          note,
        }),
      });

      if (!response.ok) {
        throw new Error(response.status === 404 ? "レシピ提案APIが未設定です。" : "レシピ提案に失敗しました。");
      }

      const data = (await response.json()) as RecipeResponse;
      if (!Array.isArray(data.recipes)) {
        throw new Error("レシピの形式が正しくありません。");
      }
      setRecipes(data.recipes);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "レシピ提案に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (foods.length === 0) {
    return (
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Recipes</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">レシピ提案</h2>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">食材がありません</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Recipes</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">レシピ提案</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setSelectedIds(foods.map((food) => food.id))}>
            全選択
          </Button>
          <Button variant="secondary" onClick={() => setSelectedIds(urgentIds.length > 0 ? urgentIds : foods.slice(0, 8).map((food) => food.id))}>
            期限近め
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">使う食材</h3>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{selectedFoods.length}品</span>
          </div>
          <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
            {foods.map((food) => {
              const checked = selectedIds.includes(food.id);
              const status = getFoodStatus(food, warningDays);
              return (
                <label
                  key={food.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition ${
                    checked
                      ? "border-cyan-400 bg-cyan-50/80 dark:border-teal-500 dark:bg-teal-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600"
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleFood(food.id)} className="mt-1 h-4 w-4 accent-cyan-700" />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true">{food.icon}</span>
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{food.name}</span>
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                      {food.quantity}
                      {food.unit}
                      {status.label ? ` / ${status.label}` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="grid content-start gap-4">
          <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
            <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span>希望</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="focus-ring min-h-28 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] font-normal text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder="例: 15分以内、子ども向け、作り置き、糖質控えめ"
              />
            </label>
            <Button className="mt-4 w-full" onClick={() => void suggestRecipes()} disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              提案する
            </Button>
            {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</p> : null}
          </div>

          {recipes.length > 0 ? (
            <div className="grid gap-3">
              {recipes.map((recipe) => (
                <article key={recipe.title} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-teal-950 dark:text-teal-200">
                      <ChefHat size={21} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{recipe.title}</h3>
                      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {[recipe.time, recipe.servings].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">材料</p>
                      <ul className="grid gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                        {recipe.ingredients.map((ingredient) => (
                          <li key={ingredient}>・{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">手順</p>
                      <ol className="grid gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                        {recipe.steps.map((step, index) => (
                          <li key={`${recipe.title}-${index}`}>
                            {index + 1}. {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  {recipe.tips ? <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-950 dark:text-slate-300">{recipe.tips}</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">提案結果はまだありません</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
