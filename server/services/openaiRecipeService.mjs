import { outputTextFromResponse } from "../utils/http.mjs";

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
            "You are a practical Japanese home-cooking assistant. Return only valid JSON with a recipes array. Each recipe has title, time, servings, ingredients, steps, and tips.",
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
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI APIでエラーが発生しました。(${response.status})`);
  }

  const data = await response.json();
  return JSON.parse(outputTextFromResponse(data));
}
