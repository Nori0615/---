import fs from "node:fs";
import path from "node:path";

export function loadEnv() {
  for (const filePath of [".env.local", ".env", path.join("server", ".env")]) {
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

      const [key, ...valueParts] = trimmed.split("=");
      if (process.env[key]) continue;
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}
