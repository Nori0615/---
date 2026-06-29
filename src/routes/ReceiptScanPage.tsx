import { ScanText, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReceiptCandidateList } from "../components/receipt/ReceiptCandidateList";
import { ReceiptConfirmSheet } from "../components/receipt/ReceiptConfirmSheet";
import { ReceiptLoading } from "../components/receipt/ReceiptLoading";
import { ReceiptPreview } from "../components/receipt/ReceiptPreview";
import { ReceiptResultActions } from "../components/receipt/ReceiptResultActions";
import { ReceiptUploader } from "../components/receipt/ReceiptUploader";
import { Button } from "../components/ui/Button";
import { analyzeReceiptImage } from "../services/receiptApi";
import { useFoodStore } from "../store/foodStore";
import { useFridgeStore } from "../store/fridgeStore";
import { useUiStore } from "../store/uiStore";
import type { AreaType, FridgeArea, ReceiptCandidateDraft, ReceiptItemCandidate, ReceiptSuggestedAreaType } from "../types";
import { mapReceiptCategory } from "../utils/categoryGuess";
import { receiptCandidateToFoodDraft } from "../utils/receiptCandidateToFoodItem";

const areaTypePriority: Record<ReceiptSuggestedAreaType, AreaType[]> = {
  fridge: ["refrigerator", "shelf", "case"],
  freezer: ["freezer"],
  vegetable: ["vegetable"],
  door: ["door"],
  pantry: ["case", "free", "shelf"],
  other: ["free", "case", "shelf"],
};

function suggestAreaId(candidate: ReceiptItemCandidate, areas: FridgeArea[]) {
  const priorities = candidate.suggestedAreaType ? areaTypePriority[candidate.suggestedAreaType] : undefined;
  const bySuggestedArea = priorities?.map((type) => areas.find((area) => area.type === type)).find(Boolean);
  if (bySuggestedArea) return bySuggestedArea.id;

  const fallbackType: AreaType =
    candidate.category === "frozen"
      ? "freezer"
      : candidate.category === "vegetable"
        ? "vegetable"
        : candidate.category === "drink"
          ? "door"
          : "shelf";

  return areas.find((area) => area.type === fallbackType)?.id ?? areas[0]?.id ?? "";
}

function toDraft(candidate: ReceiptItemCandidate, areas: FridgeArea[], index: number): ReceiptCandidateDraft {
  return {
    ...candidate,
    id: candidate.id || `candidate_${index + 1}`,
    name: candidate.name || candidate.originalText || "",
    quantity: Number.isFinite(candidate.quantity) && candidate.quantity > 0 ? candidate.quantity : 1,
    unit: candidate.unit || "個",
    confidence: Number.isFinite(candidate.confidence) ? candidate.confidence : 0.5,
    selected: candidate.isFoodLikely && candidate.confidence >= 0.35,
    appCategory: mapReceiptCategory(candidate.category),
    areaId: suggestAreaId(candidate, areas),
    expireDate: undefined,
    bestBeforeDate: undefined,
  };
}

export function ReceiptScanPage() {
  const areas = useFridgeStore((state) => state.areas);
  const addFood = useFoodStore((state) => state.addFood);
  const showToast = useUiStore((state) => state.showToast);
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [summary, setSummary] = useState<{ storeName?: string; purchasedAt?: string; rawSummary?: string }>();
  const [candidates, setCandidates] = useState<ReceiptCandidateDraft[]>([]);
  const [showLowOnly, setShowLowOnly] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(undefined);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(undefined);
    setCandidates([]);
    setSummary(undefined);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selectedCount = useMemo(() => candidates.filter((candidate) => candidate.selected).length, [candidates]);

  const scan = async () => {
    if (!file) {
      setError("レシート画像を選んでください。");
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const result = await analyzeReceiptImage(file);
      const nextCandidates = result.items.map((item, index) => toDraft(item, areas, index));
      if (nextCandidates.length === 0) {
        setError("食品候補が見つかりませんでした。明るい場所で撮り直すか、手動で追加してください。");
      }
      setSummary({ storeName: result.storeName, purchasedAt: result.purchasedAt, rawSummary: result.rawSummary });
      setCandidates(nextCandidates);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "レシートをうまく読み取れませんでした。");
    } finally {
      setLoading(false);
    }
  };

  const updateCandidate = (id: string, patch: Partial<ReceiptCandidateDraft>) => {
    setCandidates((current) => current.map((candidate) => (candidate.id === id ? { ...candidate, ...patch } : candidate)));
  };

  const removeCandidate = (id: string) => {
    setCandidates((current) => current.filter((candidate) => candidate.id !== id));
  };

  const addSelectedFoods = async () => {
    const selected = candidates.filter((candidate) => candidate.selected && candidate.name.trim() && candidate.areaId);
    if (selected.length === 0) {
      setError("追加する食品を選んでください。");
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      for (const candidate of selected) {
        await addFood(receiptCandidateToFoodDraft(candidate));
      }
      showToast(`${selected.length}件の食品を冷蔵庫に追加しました`);
      setCandidates((current) => current.filter((candidate) => !candidate.selected));
    } catch {
      setError("保存に失敗しました。もう一度試してください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-2 sm:flex sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Receipt</p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">レシート追加</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <Sparkles size={15} />
          確認してから保存
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(300px,420px)_1fr]">
        <aside className="grid content-start gap-4">
          <ReceiptUploader file={file} onFileChange={setFile} />
          <ReceiptPreview imageUrl={previewUrl} fileName={file?.name} />
          <Button className="w-full" disabled={!file || loading || !navigator.onLine} onClick={() => void scan()}>
            <ScanText size={18} />
            読み取る
          </Button>
          {!navigator.onLine ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">オフラインのため読み取りは使えません。</p> : null}
          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">{error}</p> : null}
        </aside>

        <section className="grid content-start gap-4">
          {loading ? <ReceiptLoading /> : null}
          {summary ? (
            <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
              <p className="text-xs font-semibold uppercase text-teal-700 dark:text-teal-300">Result</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-50">{summary.storeName || "読み取り結果"}</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{[summary.purchasedAt, summary.rawSummary].filter(Boolean).join(" / ")}</p>
            </div>
          ) : null}
          {candidates.length > 0 ? (
            <>
              <ReceiptResultActions
                selectedCount={selectedCount}
                totalCount={candidates.length}
                showLowOnly={showLowOnly}
                onSelectAll={() => setCandidates((current) => current.map((candidate) => ({ ...candidate, selected: true })))}
                onClearSelection={() => setCandidates((current) => current.map((candidate) => ({ ...candidate, selected: false })))}
                onToggleLowOnly={() => setShowLowOnly((current) => !current)}
                onRemoveUnselected={() => setCandidates((current) => current.filter((candidate) => candidate.selected))}
              />
              <ReceiptCandidateList candidates={candidates} areas={areas} showLowOnly={showLowOnly} onChange={updateCandidate} onRemove={removeCandidate} />
              <ReceiptConfirmSheet selectedCount={selectedCount} disabled={saving} onAdd={() => void addSelectedFoods()} />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">候補はまだありません</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">レシート画像を選んで読み取ると、ここに食品候補が並びます。</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
