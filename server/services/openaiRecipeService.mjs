import { outputTextFromResponse } from "../utils/http.mjs";

const recipeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "time", "servings", "ingredients", "steps", "tips"],
        properties: {
          title: { type: "string" },
          time: { type: "string" },
          servings: { type: "string" },
          ingredients: {
            type: "array",
            items: { type: "string" },
          },
          steps: {
            type: "array",
            items: { type: "string" },
          },
          tips: { type: "string" },
        },
      },
    },
  },
};

export async function createRecipes(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI APIキーが未設定です。.env.local に OPENAI_API_KEY を入れてください。");
  }

  const ingredients = Array.isArray(payload.ingredients) ? payload.ingredients : [];
  const note = typeof payload.note === "string" ? payload.note : "";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "あなたは日本の家庭料理に詳しいアシスタントです。冷蔵庫の食材を優先し、作りやすいレシピを日本語で提案してください。必ず指定されたJSON Schemaに従ってください。",
        },
        {
          role: "user",
          content: JSON.stringify({
            request: "冷蔵庫の食材を優先して、作りやすいレシピを3つ提案してください。",
            ingredients,
            note,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "recipe_suggestions",
          strict: true,
          schema: recipeSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `OpenAI APIでエラーが発生しました。(${response.status})`);
  }

  const data = await response.json();
  const text = outputTextFromResponse(data);
  if (!text) {
    throw new Error("レシピ提案を取得できませんでした。");
  }

  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.recipes)) {
      throw new Error("recipes is missing");
    }
    return parsed;
  } catch {
    throw new Error("レシピの形式が正しくありません。もう一度試してください。");
  }
}
