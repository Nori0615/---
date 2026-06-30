import { outputTextFromResponse } from "../utils/http.mjs";

const receiptSchema = {
  type: "object",
  additionalProperties: false,
  required: ["storeName", "purchasedAt", "rawSummary", "items"],
  properties: {
    storeName: { type: ["string", "null"] },
    purchasedAt: { type: ["string", "null"] },
    rawSummary: { type: ["string", "null"] },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "originalText",
          "name",
          "category",
          "quantity",
          "unit",
          "price",
          "isFoodLikely",
          "confidence",
          "suggestedAreaType",
          "suggestedExpireDays",
          "memo",
        ],
        properties: {
          id: { type: "string" },
          originalText: { type: "string" },
          name: { type: "string" },
          category: {
            type: "string",
            enum: ["vegetable", "meat", "fish", "egg_dairy", "drink", "seasoning", "frozen", "ready_meal", "snack", "other", "unknown"],
          },
          quantity: { type: "number" },
          unit: { type: ["string", "null"] },
          price: { type: ["number", "null"] },
          isFoodLikely: { type: "boolean" },
          confidence: { type: "number" },
          suggestedAreaType: { type: ["string", "null"], enum: ["fridge", "freezer", "vegetable", "door", "pantry", "other", null] },
          suggestedExpireDays: { type: ["number", "null"] },
          memo: { type: ["string", "null"] },
        },
      },
    },
  },
};

const receiptPrompt = `
あなたは日本のスーパーやコンビニのレシートを解析するアシスタントです。

画像内のレシートを読み取り、食品として冷蔵庫管理アプリに追加できそうな商品だけを抽出してください。

除外するもの:
- 店名、住所、電話番号、日付、時刻
- 合計、小計、税額、お預かり、お釣り
- ポイント、クレジット情報、レジ番号、担当者名
- 袋、割引情報のみの行、食品ではない日用品

商品名はレシート上の省略表記を自然な日本語の商品名に整えてください。
分からない場合は元の表記を残してください。
食品かどうか曖昧な場合は confidence を低めにしてください。
賞味期限・消費期限は画像から分からない場合、確定しないでください。
期限は目安として suggestedExpireDays に数値で提案してください。
出力は必ず指定JSONスキーマに従ってください。
`.trim();

function normalizeAnalysis(result) {
  return {
    storeName: result.storeName ?? undefined,
    purchasedAt: result.purchasedAt ?? undefined,
    rawSummary: result.rawSummary ?? undefined,
    items: (Array.isArray(result.items) ? result.items : []).map((item, index) => ({
      id: item.id || `candidate_${index + 1}`,
      originalText: item.originalText || item.name || "",
      name: item.name || item.originalText || "",
      category: item.category || "unknown",
      quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
      unit: item.unit ?? undefined,
      price: typeof item.price === "number" ? item.price : undefined,
      isFoodLikely: Boolean(item.isFoodLikely),
      confidence: Number.isFinite(item.confidence) ? Math.max(0, Math.min(1, item.confidence)) : 0.5,
      suggestedAreaType: item.suggestedAreaType ?? undefined,
      suggestedExpireDays: typeof item.suggestedExpireDays === "number" ? item.suggestedExpireDays : undefined,
      memo: item.memo ?? undefined,
    })),
  };
}

export async function analyzeReceiptImage({ buffer, mimeType }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI APIキーが未設定です。.env.local に OPENAI_API_KEY を入れてください。");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const imageUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: receiptPrompt },
        {
          role: "user",
          content: [
            { type: "input_text", text: "このレシート画像から食品候補を抽出してください。" },
            { type: "input_image", image_url: imageUrl },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "receipt_analysis",
          strict: true,
          schema: receiptSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new Error("OpenAI APIキーが無効です。.env.local の OPENAI_API_KEY を新しいキーに差し替えて、APIサーバーを再起動してください。");
    }
    throw new Error(message || `OpenAI APIでエラーが発生しました。(${response.status})`);
  }

  const data = await response.json();
  const text = outputTextFromResponse(data);
  if (!text) {
    throw new Error("レシートをうまく読み取れませんでした。明るい場所で撮り直すか、手動で追加してください。");
  }

  try {
    return normalizeAnalysis(JSON.parse(text));
  } catch {
    throw new Error("読み取り結果の整理に失敗しました。もう一度試してください。");
  }
}
