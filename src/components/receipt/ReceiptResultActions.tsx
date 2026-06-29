import { CheckSquare, Square, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";

interface ReceiptResultActionsProps {
  selectedCount: number;
  totalCount: number;
  showLowOnly: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleLowOnly: () => void;
  onRemoveUnselected: () => void;
}

export function ReceiptResultActions({
  selectedCount,
  totalCount,
  showLowOnly,
  onSelectAll,
  onClearSelection,
  onToggleLowOnly,
  onRemoveUnselected,
}: ReceiptResultActionsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">食品候補</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedCount}/{totalCount}件を追加予定
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onSelectAll}>
            <CheckSquare size={16} />
            全選択
          </Button>
          <Button variant="secondary" size="sm" onClick={onClearSelection}>
            <Square size={16} />
            全解除
          </Button>
          <Button variant={showLowOnly ? "primary" : "secondary"} size="sm" onClick={onToggleLowOnly}>
            低信頼
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemoveUnselected}>
            <Trash2 size={16} />
            未選択を削除
          </Button>
        </div>
      </div>
    </section>
  );
}
