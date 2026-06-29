import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";
import type { ChangeEvent } from "react";
import { AREA_TYPES, type AreaType, type FridgeArea } from "../../types";
import { areaTypeLabel } from "../../utils/layout";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface AreaEditorProps {
  area: FridgeArea;
  active: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Omit<FridgeArea, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
}

function numberValue(event: ChangeEvent<HTMLInputElement>) {
  return Number(event.target.value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function AreaEditor({ area, active, canMoveUp, canMoveDown, onSelect, onChange, onDelete, onReorder }: AreaEditorProps) {
  const update = (patch: Partial<Omit<FridgeArea, "id" | "createdAt">>) => onChange(area.id, patch);
  const nudge = (x = 0, y = 0) => update({ x: clamp(area.x + x, 0, 90), y: clamp(area.y + y, 0, 92) });
  const resize = (width = 0, height = 0) =>
    update({ width: clamp(area.width + width, 12, 90), height: clamp(area.height + height, 8, 50) });

  const presets = [
    { label: "左棚", patch: { x: 8, width: 58 } },
    { label: "ドア", patch: { x: 72, width: 20 } },
    { label: "広め", patch: { width: 66, height: 18 } },
    { label: "浅め", patch: { height: 11 } },
  ];

  return (
    <section
      className={`rounded-[1.25rem] border bg-white shadow-sm transition ${
        active
          ? "border-slate-900 ring-4 ring-slate-900/5 dark:border-slate-100 dark:bg-slate-900 dark:ring-slate-100/10"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      }`}
    >
      <button type="button" onClick={() => onSelect(area.id)} className="focus-ring flex w-full items-center justify-between gap-3 rounded-[1.25rem] p-4 text-left">
        <span className="min-w-0">
          <span className="block truncate text-base font-black text-slate-900 dark:text-slate-50">{area.name}</span>
          <span className="mt-1 block text-xs font-bold text-slate-500 dark:text-slate-400">
            {areaTypeLabel(area.type)} ・ {Math.round(area.width)} x {Math.round(area.height)}
          </span>
        </span>
        <span className="h-6 w-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: area.color }} aria-hidden="true" />
      </button>

      {active ? (
        <div className="grid gap-4 border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          <Input label="名前" value={area.name} onChange={(event) => update({ name: event.target.value })} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="分類"
              value={area.type}
              onChange={(event) => update({ type: event.target.value as AreaType })}
              options={AREA_TYPES.map((type) => ({ value: type, label: areaTypeLabel(type) }))}
            />
            <Input label="色" type="color" value={area.color} onChange={(event) => update({ color: event.target.value })} />
          </div>

          <div>
            <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-200">かんたん配置</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button key={preset.label} variant="secondary" size="sm" onClick={() => update(preset.patch)}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3 transition-colors dark:bg-slate-950">
              <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-200">位置</p>
              <div className="grid grid-cols-3 gap-2">
                <span />
                <Button variant="secondary" size="icon" onClick={() => nudge(0, -3)} aria-label="上へ少し移動">
                  <ArrowUp size={17} />
                </Button>
                <span />
                <Button variant="secondary" size="icon" onClick={() => nudge(-3, 0)} aria-label="左へ少し移動">
                  <ArrowLeft size={17} />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => nudge(0, 3)} aria-label="下へ少し移動">
                  <ArrowDown size={17} />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => nudge(3, 0)} aria-label="右へ少し移動">
                  <ArrowRight size={17} />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 transition-colors dark:bg-slate-950">
              <p className="mb-2 text-sm font-black text-slate-700 dark:text-slate-200">サイズ</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" size="sm" onClick={() => resize(4, 0)}>
                  <ArrowRight size={16} />
                  横に広げる
                </Button>
                <Button variant="secondary" size="sm" onClick={() => resize(-4, 0)}>
                  <ArrowLeft size={16} />
                  横を縮める
                </Button>
                <Button variant="secondary" size="sm" onClick={() => resize(0, 3)}>
                  <Maximize2 size={16} />
                  高くする
                </Button>
                <Button variant="secondary" size="sm" onClick={() => resize(0, -3)}>
                  <Minimize2 size={16} />
                  低くする
                </Button>
              </div>
            </div>
          </div>

          <details className="rounded-2xl border border-slate-200 bg-white p-3 transition-colors dark:border-slate-700 dark:bg-slate-950">
            <summary className="cursor-pointer text-sm font-black text-slate-700 dark:text-slate-200">細かく調整</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input label={`横位置 ${area.x}`} type="range" min="0" max="90" value={area.x} onChange={(event) => update({ x: numberValue(event) })} />
              <Input label={`縦位置 ${area.y}`} type="range" min="0" max="92" value={area.y} onChange={(event) => update({ y: numberValue(event) })} />
              <Input label={`幅 ${area.width}`} type="range" min="12" max="90" value={area.width} onChange={(event) => update({ width: numberValue(event) })} />
              <Input label={`高さ ${area.height}`} type="range" min="8" max="50" value={area.height} onChange={(event) => update({ height: numberValue(event) })} />
            </div>
          </details>

          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={!canMoveUp} onClick={() => onReorder(area.id, -1)}>
                <ChevronsUp size={17} />
                前へ
              </Button>
              <Button variant="ghost" size="sm" disabled={!canMoveDown} onClick={() => onReorder(area.id, 1)}>
                <ChevronsDown size={17} />
                後ろへ
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onDelete(area.id)}>
              <Trash2 size={17} />
              削除
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
