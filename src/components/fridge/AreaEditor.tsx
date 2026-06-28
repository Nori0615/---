import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { AREA_TYPES, type AreaType, type FridgeArea } from "../../types";
import { areaTypeLabel } from "../../utils/layout";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface AreaEditorProps {
  area: FridgeArea;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (id: string, patch: Partial<Omit<FridgeArea, "id" | "createdAt">>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: -1 | 1) => void;
}

function numberValue(event: ChangeEvent<HTMLInputElement>) {
  return Number(event.target.value);
}

export function AreaEditor({ area, canMoveUp, canMoveDown, onChange, onDelete, onReorder }: AreaEditorProps) {
  return (
    <section className="rounded-[1.5rem] border border-cyan-100 bg-white/86 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <Input label="エリア名" value={area.name} onChange={(event) => onChange(area.id, { name: event.target.value })} />
        <div className="flex gap-1 pt-7">
          <Button variant="ghost" size="icon" disabled={!canMoveUp} onClick={() => onReorder(area.id, -1)} aria-label="上へ移動">
            <ArrowUp size={18} />
          </Button>
          <Button variant="ghost" size="icon" disabled={!canMoveDown} onClick={() => onReorder(area.id, 1)} aria-label="下へ移動">
            <ArrowDown size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(area.id)} aria-label={`${area.name}を削除`}>
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select
          label="分類"
          value={area.type}
          onChange={(event) => onChange(area.id, { type: event.target.value as AreaType })}
          options={AREA_TYPES.map((type) => ({ value: type, label: areaTypeLabel(type) }))}
        />
        <Input label="色" type="color" value={area.color} onChange={(event) => onChange(area.id, { color: event.target.value })} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Input label="横位置" type="range" min="0" max="90" value={area.x} onChange={(event) => onChange(area.id, { x: numberValue(event) })} />
        <Input label="縦位置" type="range" min="0" max="92" value={area.y} onChange={(event) => onChange(area.id, { y: numberValue(event) })} />
        <Input label="幅" type="range" min="12" max="90" value={area.width} onChange={(event) => onChange(area.id, { width: numberValue(event) })} />
        <Input label="高さ" type="range" min="8" max="50" value={area.height} onChange={(event) => onChange(area.id, { height: numberValue(event) })} />
      </div>
    </section>
  );
}
