import type { ReceiptAnalysisResult } from "../types";

const maxImageSize = 8 * 1024 * 1024;
const receiptApiUrl = (import.meta.env.VITE_RECEIPT_API_URL as string | undefined)?.trim() || "/api/receipt/analyze";

export async function analyzeReceiptImage(file: File): Promise<ReceiptAnalysisResult> {
  if (file.size > maxImageSize) {
    throw new Error("画像が大きすぎます。8MB以下の写真を選んでください。");
  }

  if (!navigator.onLine) {
    throw new Error("オフラインのため読み取れません。接続後にもう一度試してください。");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(receiptApiUrl, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => undefined)) as { error?: string } | ReceiptAnalysisResult | undefined;
  if (!response.ok) {
    throw new Error(data && "error" in data && data.error ? data.error : "レシートをうまく読み取れませんでした。");
  }

  if (!data || !("items" in data) || !Array.isArray(data.items)) {
    throw new Error("読み取り結果の形式が正しくありません。");
  }

  return data;
}
