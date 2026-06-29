import type { FoodCategory } from ".";

export type ReceiptApiCategory =
  | "vegetable"
  | "meat"
  | "fish"
  | "egg_dairy"
  | "drink"
  | "seasoning"
  | "frozen"
  | "ready_meal"
  | "snack"
  | "other"
  | "unknown";

export type ReceiptSuggestedAreaType = "fridge" | "freezer" | "vegetable" | "door" | "pantry" | "other";

export type ReceiptItemCandidate = {
  id: string;
  originalText: string;
  name: string;
  category: ReceiptApiCategory;
  quantity: number;
  unit?: string;
  price?: number;
  isFoodLikely: boolean;
  confidence: number;
  suggestedAreaType?: ReceiptSuggestedAreaType;
  suggestedExpireDays?: number;
  memo?: string;
};

export type ReceiptAnalysisResult = {
  storeName?: string;
  purchasedAt?: string;
  rawSummary?: string;
  items: ReceiptItemCandidate[];
};

export type ReceiptCandidateDraft = ReceiptItemCandidate & {
  selected: boolean;
  appCategory: FoodCategory;
  areaId: string;
  expireDate?: string;
  bestBeforeDate?: string;
};

export type ReceiptScan = {
  id: string;
  imageName?: string;
  rawText: string;
  candidates: ReceiptItemCandidate[];
  createdAt: string;
};
