import http from "node:http";
import { handleReceiptAnalyze } from "./routes/receipt.mjs";
import { handleRecipes } from "./routes/recipes.mjs";
import { loadEnv } from "./utils/env.mjs";
import { sendJson } from "./utils/http.mjs";

loadEnv();

const port = Number(process.env.PORT || process.env.RECIPE_API_PORT || 3001);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {}, allowedOrigin);
    return;
  }

  if (request.method === "POST" && request.url === "/api/receipt/analyze") {
    await handleReceiptAnalyze(request, response, allowedOrigin);
    return;
  }

  if (request.method === "POST" && request.url === "/api/recipes") {
    await handleRecipes(request, response, allowedOrigin);
    return;
  }

  sendJson(response, 404, { error: "Not found" }, allowedOrigin);
});

server.listen(port, () => {
  console.log(`Fridgely API listening on http://localhost:${port}`);
});
