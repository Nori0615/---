import { Refrigerator, Save } from "lucide-react";
import { Button } from "../ui/Button";

interface ReceiptConfirmSheetProps {
  selectedCount: number;
  disabled?: boolean;
  onAdd: () => void;
}

export function ReceiptConfirmSheet({ selectedCount, disabled, onAdd }: ReceiptConfirmSheetProps) {
  return (
    <div className="sticky bottom-[78px] z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95 lg:bottom-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-teal-950 dark:text-teal-200">
          <Refrigerator size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{selectedCount}件を冷蔵庫に追加</p>
          <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">選んだ候補だけ保存します</p>
        </div>
        <Button disabled={disabled || selectedCount === 0} onClick={onAdd}>
          <Save size={18} />
          追加
        </Button>
      </div>
    </div>
  );
}
