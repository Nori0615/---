import { readBuffer } from "./http.mjs";

const maxImageBytes = 8 * 1024 * 1024;

export async function readMultipartImage(request) {
  const contentType = request.headers["content-type"] ?? "";
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] ?? contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];
  if (!boundary) {
    throw new Error("画像データを受け取れませんでした。");
  }

  const buffer = await readBuffer(request, maxImageBytes + 1024 * 128);
  const parts = buffer.toString("latin1").split(`--${boundary}`).slice(1, -1);

  for (const part of parts) {
    const normalized = part.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const separatorIndex = normalized.indexOf("\r\n\r\n");
    if (separatorIndex < 0) continue;

    const headerText = normalized.slice(0, separatorIndex);
    const bodyText = normalized.slice(separatorIndex + 4).replace(/\r\n$/, "");
    const disposition = headerText.match(/content-disposition:([^\r\n]+)/i)?.[1] ?? "";
    const name = disposition.match(/name="([^"]+)"/)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/)?.[1];
    const mimeType = headerText.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() ?? "application/octet-stream";

    if (name !== "file" || !filename) continue;

    const data = Buffer.from(bodyText, "latin1");
    if (!mimeType.startsWith("image/")) {
      throw new Error("画像ファイルを選んでください。");
    }
    if (data.length > maxImageBytes) {
      throw new Error("画像が大きすぎます。8MB以下の写真を選んでください。");
    }

    return { buffer: data, filename, mimeType };
  }

  throw new Error("レシート画像が見つかりませんでした。");
}
