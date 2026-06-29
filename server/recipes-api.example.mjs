import http from "node:http";
import fs from "node:fs";

function loadLocalEnv() {
  if (!fs.existsSync(".env.local")) return;

  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    if (process.env[key]) continue;
    process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const port = Number(process.env.RECIPE_API_PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function outputTextFromResponse(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n") ?? ""
  );
}

async function createRecipes(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
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
      model,
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
            outputShape: {
              recipes: [
                {
                  title: "string",
                  time: "string",
                  servings: "string",
                  ingredients: ["string"],
                  steps: ["string"],
                  tips: "string",
                },
              ],
            },
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const text = outputTextFromResponse(data);
  return JSON.parse(text);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/recipes") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const payload = await readJson(request);
    const recipes = await createRecipes(payload);
    sendJson(response, 200, recipes);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Recipe generation failed." });
  }
});

server.listen(port, () => {
  console.log(`Recipe API example listening on http://localhost:${port}`);
});
