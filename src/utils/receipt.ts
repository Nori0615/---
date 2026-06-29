export function formatReceiptPrice(price?: number) {
  return typeof price === "number" && Number.isFinite(price) ? `${price.toLocaleString("ja-JP")}円` : "未取得";
}

export function formatConfidence(confidence: number) {
  const value = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  return `${value}%`;
}

export function isLowConfidence(confidence: number) {
  return confidence < 0.72;
}
