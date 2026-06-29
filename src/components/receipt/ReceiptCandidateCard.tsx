import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { FOOD_CATEGORIES, type FoodCategory, type FridgeArea, type ReceiptCandidateDraft } from "../../types";
import { receiptCategoryLabels } from "../../utils/categoryGuess";
import { formatConfidence, formatReceiptPrice, isLowConfidence } from "../../utils/receipt";
import { suggestedExpireDate } from "../../utils/expirySuggest";
import { areaTypeLabel } from "../../utils/layout";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";

interface ReceiptCandidateCardProps {
  candidate: ReceiptCandidateDraft;
  areas: FridgeArea[];
  onChange: (id: string, patch: Partial<ReceiptCandidateDraft>) => void;
  onRemove: (id: string) => void;
}

export function ReceiptCandidateCard({ candidate, areas, onChange, onRemove }: ReceiptCandidateCardProps) {
  const lowConfidence = isLowConfidence(candidate.confidence);
  const suggestedDate = suggestedExpireDate(candidate.suggestedExpireDays);

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition-colors dark:bg-slate-900/90 ${
        candidate.selected ? "border-cyan-200 dark:border-teal-800" : "border-slate-200 opacity-75 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={candidate.selected}
          onChange={(event) => onChange(candidate.id, { selected: event.target.checked })}
          className="mt-1 h-5 w-5 shrink-0 accent-cyan-700"
          aria-label={`${candidate.name}を追加対象にする`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-50">{candidate.name || "名称未設定"}</h3>
            {lowConfidence ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                <AlertTriangle size={13} />
                確認が必要
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                <CheckCircle2 size={13} />
                {formatConfidence(candidate.confidence)}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            元表記: {candidate.originalText || "不明"} / 推定: {receiptCategoryLabels[candidate.category]}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(candidate.id)} aria-label={`${candidate.name}を削除`}>
          <Trash2 size={17} />
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input label="商品名" value={candidate.name} onChange={(event) => onChange(candidate.id, { name: event.target.value })} />
        <Select
          label="カテゴリ"
          value={candidate.appCategory}
          onChange={(event) => onChange(candidate.id, { appCategory: event.target.value as FoodCategory })}
          options={FOOD_CATEGORIES.map((category) => ({ value: category, label: category }))}
        />
        <div className="grid grid-cols-[1fr_96px] gap-2">
          <Input
            label="数量"
            type="number"
            min="0"
            step="0.5"
            value={candidate.quantity}
            onChange={(event) => onChange(candidate.id, { quantity: Number(event.target.value) })}
          />
          <Input label="単位" value={candidate.unit ?? ""} onChange={(event) => onChange(candidate.id, { unit: event.target.value })} />
        </div>
        <Input
          label="価格"
          type="number"
          min="0"
          value={candidate.price ?? ""}
          placeholder={formatReceiptPrice(candidate.price)}
          onChange={(event) => onChange(candidate.id, { price: event.target.value ? Number(event.target.value) : undefined })}
        />
        <Select
          label="保存場所"
          value={candidate.areaId}
          onChange={(event) => onChange(candidate.id, { areaId: event.target.value })}
          options={areas.map((area) => ({ value: area.id, label: `${area.name} / ${areaTypeLabel(area.type)}` }))}
        />
        <Input
          label="期限"
          type="date"
          value={candidate.expireDate ?? ""}
          helper="期限は目安です。必要なら編集してください。"
          onChange={(event) => onChange(candidate.id, { expireDate: event.target.value || undefined })}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="soft" size="sm" onClick={() => onChange(candidate.id, { expireDate: undefined, bestBeforeDate: undefined })}>
          期限なし
        </Button>
        {suggestedDate ? (
          <Button variant="secondary" size="sm" onClick={() => onChange(candidate.id, { expireDate: suggestedDate })}>
            目安 {candidate.suggestedExpireDays}日後
          </Button>
        ) : null}
      </div>

      <label className="mt-3 grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <span>メモ</span>
        <textarea
          value={candidate.memo ?? ""}
          onChange={(event) => onChange(candidate.id, { memo: event.target.value })}
          className="focus-ring min-h-20 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] font-normal text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="必要ならメモを追加"
        />
      </label>
    </article>
  );
}
