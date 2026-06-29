import { analyzeReceiptImage } from "../services/openaiReceiptService.mjs";
import { sendJson } from "../utils/http.mjs";
import { readMultipartImage } from "../utils/multipart.mjs";

export async function handleReceiptAnalyze(request, response, origin) {
  try {
    const image = await readMultipartImage(request);
    const result = await analyzeReceiptImage(image);
    sendJson(response, 200, result, origin);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "レシートをうまく読み取れませんでした。" }, origin);
  }
}
