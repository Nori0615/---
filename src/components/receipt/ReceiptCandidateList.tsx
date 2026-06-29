import type { FridgeArea, ReceiptCandidateDraft } from "../../types";
import { isLowConfidence } from "../../utils/receipt";
import { ReceiptCandidateCard } from "./ReceiptCandidateCard";

interface ReceiptCandidateListProps {
  candidates: ReceiptCandidateDraft[];
  areas: FridgeArea[];
  showLowOnly: boolean;
  onChange: (id: string, patch: Partial<ReceiptCandidateDraft>) => void;
  onRemove: (id: string) => void;
}

export function ReceiptCandidateList({ candidates, areas, showLowOnly, onChange, onRemove }: ReceiptCandidateListProps) {
  const visibleCandidates = showLowOnly ? candidates.filter((candidate) => isLowConfidence(candidate.confidence)) : candidates;

  if (visibleCandidates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/70">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">表示する候補はありません</h3>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {visibleCandidates.map((candidate) => (
        <ReceiptCandidateCard key={candidate.id} candidate={candidate} areas={areas} onChange={onChange} onRemove={onRemove} />
      ))}
    </div>
  );
}
