import { Plus, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AreaEditor } from "../components/fridge/AreaEditor";
import { DraggableLayoutPreview } from "../components/fridge/DraggableLayoutPreview";
import { FridgeCanvas } from "../components/fridge/FridgeCanvas";
import { Button } from "../components/ui/Button";
import { useFridgeStore } from "../store/fridgeStore";
import { useUiStore } from "../store/uiStore";
import { AREA_TYPES, type AreaType } from "../types";
import { areaTypeLabel } from "../utils/layout";

export function LayoutEditorPage() {
  const areas = useFridgeStore((state) => state.areas);
  const addArea = useFridgeStore((state) => state.addArea);
  const updateArea = useFridgeStore((state) => state.updateArea);
  const deleteArea = useFridgeStore((state) => state.deleteArea);
  const reorderArea = useFridgeStore((state) => state.reorderArea);
  const resetLayout = useFridgeStore((state) => state.resetLayout);
  const applyTemplate = useFridgeStore((state) => state.applyTemplate);
  const showToast = useUiStore((state) => state.showToast);
  const [selectedAreaId, setSelectedAreaId] = useState<string>();

  useEffect(() => {
    if (!selectedAreaId && areas[0]) {
      setSelectedAreaId(areas[0].id);
    }
    if (selectedAreaId && !areas.some((area) => area.id === selectedAreaId)) {
      setSelectedAreaId(areas[0]?.id);
    }
  }, [areas, selectedAreaId]);

  const selectedArea = useMemo(() => areas.find((area) => area.id === selectedAreaId), [areas, selectedAreaId]);

  const remove = async (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area) return;
    if (!window.confirm(`${area.name}を削除しますか？中の食材は別エリアへ移動します。`)) return;
    await deleteArea(id);
    showToast("エリアを削除しました", "info");
  };

  const add = async (type: AreaType) => {
    await addArea(type);
    showToast("エリアを追加しました");
  };

  return (
    <div className="grid gap-5">
      <DraggableLayoutPreview
        compact
        selectedAreaId={selectedArea?.id}
        onSelectArea={setSelectedAreaId}
        storageKey="fridgely-layout-preview-mobile"
        defaultWidth={84}
        minWidth={68}
        maxWidth={150}
        className="xl:hidden"
      />
      <DraggableLayoutPreview
        selectedAreaId={selectedArea?.id}
        onSelectArea={setSelectedAreaId}
        storageKey="fridgely-layout-preview-desktop"
        defaultWidth={260}
        minWidth={190}
        maxWidth={380}
        className="hidden xl:block"
      />

      <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-black text-teal-700 dark:text-teal-300">Layout</p>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">レイアウトを整える</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            エリアを選んで、ボタンで位置や大きさを調整できます。細かくしたい時だけスライダーを開いてください。
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="secondary" onClick={() => void applyTemplate("family").then(() => showToast("ファミリーテンプレートに変更しました"))}>
            <Sparkles size={17} />
            標準
          </Button>
          <Button variant="secondary" onClick={() => void applyTemplate("compact").then(() => showToast("コンパクトテンプレートに変更しました"))}>
            コンパクト
          </Button>
          <Button variant="ghost" onClick={() => void resetLayout().then(() => showToast("初期レイアウトに戻しました"))}>
            <RotateCcw size={17} />
            初期化
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(320px,560px)_1fr]">
        <div className="grid min-w-0 content-start gap-3">
          <FridgeCanvas mode="editor" selectedAreaId={selectedArea?.id} onSelectArea={setSelectedAreaId} />
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold leading-6 text-slate-600 transition-colors dark:bg-slate-900 dark:text-slate-300">
            冷蔵庫内のエリアをクリックすると、右側の編集カードが切り替わります。
          </p>
        </div>

        <aside className="grid min-w-0 content-start gap-4">
          <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
            <p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">エリアを追加</p>
            <div className="flex flex-wrap gap-2">
              {AREA_TYPES.map((type) => (
                <Button key={type} variant="secondary" size="sm" onClick={() => void add(type as AreaType)}>
                  <Plus size={16} />
                  {areaTypeLabel(type)}
                </Button>
              ))}
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
            <p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">エリア一覧</p>
            <div className="grid gap-3">
              {areas.map((area, index) => (
                <AreaEditor
                  key={area.id}
                  area={area}
                  active={area.id === selectedArea?.id}
                  canMoveUp={index > 0}
                  canMoveDown={index < areas.length - 1}
                  onSelect={setSelectedAreaId}
                  onChange={(id, patch) => void updateArea(id, patch)}
                  onDelete={(id) => void remove(id)}
                  onReorder={(id, direction) => void reorderArea(id, direction)}
                />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
