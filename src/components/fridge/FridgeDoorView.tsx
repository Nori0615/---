import { PanelRight } from "lucide-react";
import type { FridgeArea } from "../../types";

interface FridgeDoorViewProps {
  areas: FridgeArea[];
}

export function FridgeDoorView({ areas }: FridgeDoorViewProps) {
  const doorAreas = areas.filter((area) => area.type === "door");
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <PanelRight size={18} />
        ドアポケット
      </div>
      <div className="mt-3 grid gap-2">
        {doorAreas.map((area) => (
          <div key={area.id} className="rounded-lg bg-white/75 px-3 py-2 text-sm font-semibold text-slate-700">
            {area.name}
          </div>
        ))}
      </div>
    </div>
  );
}
