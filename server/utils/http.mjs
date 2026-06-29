export function sendJson(response, status, body, origin = "*") {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  response.end(JSON.stringify(body));
}

export async function readJson(request, maxBytes = 1024 * 1024) {
  const buffer = await readBuffer(request, maxBytes);
  return JSON.parse(buffer.toString("utf8") || "{}");
}

export async function readBuffer(request, maxBytes) {
  const chunks = [];
  let total = 0;

  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error("画像が大きすぎます。8MB以下の写真を選んでください。");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function outputTextFromResponse(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("\n") ?? ""
  );
}
