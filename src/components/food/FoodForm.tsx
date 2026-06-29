import { Save, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FOOD_CATEGORIES, type FoodCategory, type FoodDraft } from "../../types";
import { dateInputFromToday } from "../../utils/date";
import { useFoodStore } from "../../store/foodStore";
import { useFridgeStore } from "../../store/fridgeStore";
import { useUiStore } from "../../store/uiStore";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const colors = ["#eef9ff", "#edf9ee", "#fff8e7", "#fff1f4", "#f4f1ff", "#f3f4f6", "#fff3e8"];
const icons = ["🥬", "🍅", "🥛", "🥚", "🍗", "🐟", "🍚", "🥣", "🍫", "🧂", "🧊", "🍎"];
const units = ["個", "本", "袋", "g", "ml", "食", "枚", "パック"];

function blankDraft(areaId: string): FoodDraft {
  return {
    name: "",
    category: "その他",
    quantity: 1,
    unit: "個",
    areaId,
    expireDate: undefined,
    bestBeforeDate: undefined,
    memo: "",
    color: colors[0],
    icon: "🥬",
    isOpened: false,
    isFavorite: false,
    isPriority: false,
  };
}

export function FoodForm() {
  const areas = useFridgeStore((state) => state.areas);
  const foods = useFoodStore((state) => state.foods);
  const addFood = useFoodStore((state) => state.addFood);
  const updateFood = useFoodStore((state) => state.updateFood);
  const foodFormOpen = useUiStore((state) => state.foodFormOpen);
  const editingFoodId = useUiStore((state) => state.editingFoodId);
  const foodFormDefaults = useUiStore((state) => state.foodFormDefaults);
  const closeFoodForm = useUiStore((state) => state.closeFoodForm);
  const showToast = useUiStore((state) => state.showToast);
  const defaultAreaId = foodFormDefaults?.areaId ?? areas[0]?.id ?? "";
  const editingFood = foods.find((food) => food.id === editingFoodId);
  const [draft, setDraft] = useState<FoodDraft>(blankDraft(defaultAreaId));

  useEffect(() => {
    if (!foodFormOpen) return;
    if (editingFood) {
      setDraft({
        name: editingFood.name,
        category: editingFood.category,
        quantity: editingFood.quantity,
        unit: editingFood.unit,
        areaId: editingFood.areaId,
        expireDate: editingFood.expireDate,
        bestBeforeDate: editingFood.bestBeforeDate,
        memo: editingFood.memo,
        color: editingFood.color,
        icon: editingFood.icon,
        isOpened: editingFood.isOpened,
        isFavorite: editingFood.isFavorite,
        isPriority: editingFood.isPriority,
      });
    } else {
      setDraft({ ...blankDraft(defaultAreaId), ...foodFormDefaults });
    }
  }, [defaultAreaId, editingFood, foodFormDefaults, foodFormOpen]);

  const nameCandidates = useMemo(() => [...new Set(foods.map((food) => food.name))].slice(0, 24), [foods]);
  const favoriteFoods = useMemo(() => foods.filter((food) => food.isFavorite).slice(0, 6), [foods]);

  const submit = async () => {
    const name = draft.name.trim();
    if (!name) {
      showToast("食材名を入れてください", "error");
      return;
    }
    if (!draft.areaId) {
      showToast("保存場所を選んでください", "error");
      return;
    }

    const payload: FoodDraft = {
      ...draft,
      name,
      memo: draft.memo?.trim(),
      expireDate: draft.expireDate || undefined,
      bestBeforeDate: draft.bestBeforeDate || undefined,
    };

    if (editingFood) {
      await updateFood(editingFood.id, payload);
      showToast("食材を更新しました");
    } else {
      await addFood(payload);
      showToast("冷蔵庫に追加しました");
    }
    closeFoodForm();
  };

  const applyFavorite = (foodName: string) => {
    const source = foods.find((food) => food.name === foodName);
    if (!source) return;
    setDraft({
      name: source.name,
      category: source.category,
      quantity: 1,
      unit: source.unit,
      areaId: source.areaId,
      expireDate: undefined,
      bestBeforeDate: undefined,
      memo: "",
      color: source.color,
      icon: source.icon,
      isOpened: false,
      isFavorite: source.isFavorite,
      isPriority: false,
    });
  };

  return (
    <Modal open={foodFormOpen} title={editingFood ? "食材を編集" : "食材を追加"} onClose={closeFoodForm}>
      <div className="grid gap-5">
        {favoriteFoods.length > 0 && !editingFood ? (
          <section>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">よく使う食材</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {favoriteFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => applyFavorite(food.name)}
                  className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition-colors dark:border-teal-900/70 dark:bg-teal-950/60 dark:text-teal-100"
                >
                  <span aria-hidden="true">{food.icon}</span>
                  {food.name}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <Input
          label="食材名"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          list="food-name-candidates"
          placeholder="例: 牛乳、レタス、作り置きカレー"
          autoFocus
        />
        <datalist id="food-name-candidates">
          {nameCandidates.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="カテゴリ"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as FoodCategory })}
            options={FOOD_CATEGORIES.map((category) => ({ value: category, label: category }))}
          />
          <Select
            label="単位"
            value={draft.unit}
            onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
            options={units.map((unit) => ({ value: unit, label: unit }))}
          />
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">数量</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => setDraft({ ...draft, quantity: Math.max(0, draft.quantity - 1) })}>
              -
            </Button>
            <input
              type="number"
              min="0"
              step="0.5"
              value={draft.quantity}
              onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })}
              className="focus-ring w-28 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-base font-semibold text-slate-900 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              aria-label="数量"
            />
            <Button variant="secondary" size="icon" onClick={() => setDraft({ ...draft, quantity: draft.quantity + 1 })}>
              +
            </Button>
          </div>
        </div>

        <section>
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">保存場所</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {areas.map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setDraft({ ...draft, areaId: area.id })}
                className={`focus-ring rounded-lg border px-3 py-2.5 text-left text-sm font-semibold ${
                  draft.areaId === area.id
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900 dark:border-teal-400 dark:bg-teal-950/70 dark:text-teal-100"
                    : "border-cyan-100 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                }`}
              >
                {area.name}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="消費期限"
              type="date"
              value={draft.expireDate ?? ""}
              onChange={(event) => setDraft({ ...draft, expireDate: event.target.value || undefined })}
            />
            <Input
              label="賞味期限"
              type="date"
              value={draft.bestBeforeDate ?? ""}
              onChange={(event) => setDraft({ ...draft, bestBeforeDate: event.target.value || undefined })}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["今日", 0],
              ["明日", 1],
              ["3日後", 3],
              ["1週間後", 7],
            ].map(([label, days]) => (
              <Button key={String(label)} variant="soft" size="sm" onClick={() => setDraft({ ...draft, expireDate: dateInputFromToday(Number(days)) })}>
                {label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setDraft({ ...draft, expireDate: undefined, bestBeforeDate: undefined })}>
              期限なし
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">アイコン</p>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setDraft({ ...draft, icon })}
                  className={`focus-ring grid h-10 w-10 place-items-center rounded-lg border text-lg ${
                    draft.icon === icon ? "border-cyan-500 bg-cyan-50 dark:border-teal-400 dark:bg-teal-950/70" : "border-cyan-100 bg-white dark:border-slate-700 dark:bg-slate-950"
                  }`}
                  aria-label={`${icon}を選択`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">色</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDraft({ ...draft, color })}
                  className="focus-ring h-10 w-10 rounded-lg border-2"
                  style={{ backgroundColor: color, borderColor: draft.color === color ? "#0891b2" : "white" }}
                  aria-label={`${color}を選択`}
                />
              ))}
            </div>
          </div>
        </section>

        <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
          <span>メモ</span>
          <textarea
            value={draft.memo ?? ""}
            onChange={(event) => setDraft({ ...draft, memo: event.target.value })}
            className="focus-ring min-h-24 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] font-normal text-slate-800 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="使い道、買った場所、下味など"
          />
        </label>

        <section className="grid gap-2 sm:grid-cols-3">
          {[
            ["isFavorite", "よく使う"],
            ["isOpened", "開封済み"],
            ["isPriority", "優先"],
          ].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 transition-colors dark:border-slate-700 dark:bg-slate-950">
              <input
                type="checkbox"
                checked={Boolean(draft[key as keyof FoodDraft])}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })}
                className="mt-1 h-4 w-4 accent-cyan-700"
              />
              <span>
                <span className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {label}
                  {key === "isFavorite" ? <Star size={14} className="text-amber-500" /> : null}
                </span>
              </span>
            </label>
          ))}
        </section>

        <Button onClick={() => void submit()} className="w-full">
          <Save size={18} />
          保存する
        </Button>
      </div>
    </Modal>
  );
}
