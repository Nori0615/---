import type { FoodDraft, ReceiptCandidateDraft } from "../types";
import { getCategoryColor, getCategoryIcon } from "./categoryGuess";

export function receiptCandidateToFoodDraft(candidate: ReceiptCandidateDraft): FoodDraft {
  const memoParts = [
    candidate.memo?.trim(),
    `レシートから追加 / 元表記: ${candidate.originalText || candidate.name}`,
    typeof candidate.price === "number" ? `価格: ${candidate.price.toLocaleString("ja-JP")}円` : undefined,
  ].filter(Boolean);

  return {
    name: candidate.name.trim(),
    category: candidate.appCategory,
    quantity: Math.max(0, Number(candidate.quantity) || 1),
    unit: candidate.unit?.trim() || "個",
    areaId: candidate.areaId,
    expireDate: candidate.expireDate || undefined,
    bestBeforeDate: candidate.bestBeforeDate || undefined,
    memo: memoParts.join("\n"),
    color: getCategoryColor(candidate.appCategory),
    icon: getCategoryIcon(candidate.appCategory),
    isOpened: false,
    isFavorite: false,
    isPriority: false,
  };
}
