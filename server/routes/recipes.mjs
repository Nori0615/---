import { createRecipes } from "../services/openaiRecipeService.mjs";
import { readJson, sendJson } from "../utils/http.mjs";

export async function handleRecipes(request, response, origin) {
  try {
    const payload = await readJson(request);
    const result = await createRecipes(payload);
    sendJson(response, 200, result, origin);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "レシピ提案に失敗しました。" }, origin);
  }
}
