import { Plus, RotateCcw } from "lucide-react";
import { AreaEditor } from "../components/fridge/AreaEditor";
import { FridgeCanvas } from "../components/fridge/FridgeCanvas";
import { Button } from "../components/ui/Button";
import { useFridgeStore } from "../store/fridgeStore";
import { AREA_TYPES, type AreaType } from "../types";
import { areaTypeLabel } from "../utils/layout";
import { useUiStore } from "../store/uiStore";

export function LayoutEditorPage() {
  const areas = useFridgeStore((state) => state.areas);
  const addArea = useFridgeStore((state) => state.addArea);
  const updateArea = useFridgeStore((state) => state.updateArea);
  const deleteArea = useFridgeStore((state) => state.deleteArea);
  const reorderArea = useFridgeStore((state) => state.reorderArea);
  const resetLayout = useFridgeStore((state) => state.resetLayout);
  const applyTemplate = useFridgeStore((state) => state.applyTemplate);
  const showToast = useUiStore((state) => state.showToast);

  const remove = async (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area) return;
    if (!window.confirm(`${area.name}を削除しますか？中の食材は別エリアへ移動します。`)) return;
    await deleteArea(id);
    showToast("エリアを削除しました", "info");
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Layout</p>
          <h2 className="text-2xl font-black text-slate-900">仕切りを動かす</h2>
          <p className="mt-1 text-sm text-slate-600">スライダーでエリアの位置と大きさを調整できます。変更はすぐローカルに保存されます。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void applyTemplate("family").then(() => showToast("ファミリーテンプレートに変更しました"))}>
            ファミリー
          </Button>
          <Button variant="secondary" onClick={() => void applyTemplate("compact").then(() => showToast("コンパクトテンプレートに変更しました"))}>
            コンパクト
          </Button>
          <Button variant="soft" onClick={() => void resetLayout().then(() => showToast("初期レイアウトに戻しました"))}>
            <RotateCcw size={17} />
            初期化
          </Button>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-4 shadow-soft">
        <p className="mb-3 text-sm font-black text-slate-700">エリアを追加</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {AREA_TYPES.map((type) => (
            <Button key={type} variant="secondary" size="sm" onClick={() => void addArea(type as AreaType).then(() => showToast("エリアを追加しました"))}>
              <Plus size={16} />
              {areaTypeLabel(type)}
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,560px)_1fr]">
        <FridgeCanvas />
        <div className="grid content-start gap-3">
          {areas.map((area, index) => (
            <AreaEditor
              key={area.id}
              area={area}
              canMoveUp={index > 0}
              canMoveDown={index < areas.length - 1}
              onChange={(id, patch) => void updateArea(id, patch)}
              onDelete={(id) => void remove(id)}
              onReorder={(id, direction) => void reorderArea(id, direction)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
