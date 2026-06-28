import { Edit3, Minus, Plus, Trash2 } from "lucide-react";
import { useFoodStore } from "../../store/foodStore";
import { useFridgeStore } from "../../store/fridgeStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useUiStore } from "../../store/uiStore";
import { displayDate } from "../../utils/date";
import { getFoodStatus, statusClass } from "../../utils/foodStatus";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";
import { Sheet } from "../ui/Sheet";

export function FoodDetailSheet() {
  const selectedFoodId = useUiStore((state) => state.selectedFoodId);
  const selectFood = useUiStore((state) => state.selectFood);
  const openFoodForm = useUiStore((state) => state.openFoodForm);
  const showToast = useUiStore((state) => state.showToast);
  const foods = useFoodStore((state) => state.foods);
  const deleteFood = useFoodStore((state) => state.deleteFood);
  const changeQuantity = useFoodStore((state) => state.changeQuantity);
  const moveFood = useFoodStore((state) => state.moveFood);
  const areas = useFridgeStore((state) => state.areas);
  const warningDays = useSettingsStore((state) => state.settings?.warningDays ?? 7);
  const food = foods.find((item) => item.id === selectedFoodId);

  if (!food) {
    return null;
  }

  const area = areas.find((item) => item.id === food.areaId);
  const status = getFoodStatus(food, warningDays);

  const remove = async () => {
    if (!window.confirm(`${food.name}を削除しますか？`)) return;
    await deleteFood(food.id);
    showToast("食材を削除しました", "info");
    selectFood(undefined);
  };

  return (
    <Sheet open={Boolean(food)} title={food.name} onClose={() => selectFood(undefined)}>
      <div className="grid gap-5">
        <div className="rounded-[1.5rem] border border-cyan-100 p-4" style={{ backgroundColor: food.color }}>
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/80 text-3xl">{food.icon}</div>
            <div>
              <p className="text-sm font-bold text-slate-600">{food.category}</p>
              <h3 className="text-2xl font-black text-slate-900">{food.name}</h3>
            </div>
          </div>
          <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm font-black ${statusClass(status.state)}`}>{status.label}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">数量</p>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="secondary" size="icon" onClick={() => void changeQuantity(food.id, -1)} aria-label="数量を減らす">
                <Minus size={17} />
              </Button>
              <span className="min-w-14 text-center text-lg font-black">
                {food.quantity}
                {food.unit}
              </span>
              <Button variant="secondary" size="icon" onClick={() => void changeQuantity(food.id, 1)} aria-label="数量を増やす">
                <Plus size={17} />
              </Button>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">保存場所</p>
            <p className="mt-2 text-lg font-black text-slate-900">{area?.name ?? "未設定"}</p>
          </div>
        </div>

        <Select
          label="場所を移動"
          value={food.areaId}
          onChange={(event) => void moveFood(food.id, event.target.value).then(() => showToast("保存場所を移動しました"))}
          options={areas.map((item) => ({ value: item.id, label: item.name }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-slate-500">消費期限</p>
            <p className="mt-1 font-black text-slate-900">{displayDate(food.expireDate)}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <p className="text-xs font-bold text-slate-500">賞味期限</p>
            <p className="mt-1 font-black text-slate-900">{displayDate(food.bestBeforeDate)}</p>
          </div>
        </div>

        {food.memo ? (
          <div className="rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-slate-700">
            <p className="mb-1 font-black text-slate-900">メモ</p>
            {food.memo}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => openFoodForm(food.id)}>
            <Edit3 size={18} />
            編集
          </Button>
          <Button variant="danger" onClick={() => void remove()}>
            <Trash2 size={18} />
            削除
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
