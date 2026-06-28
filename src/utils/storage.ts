import { db } from "../db/dexie";
import type { AppSettings, BackupData, FoodItem, FridgeArea } from "../types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasString(record: UnknownRecord, key: string) {
  return typeof record[key] === "string";
}

function isFoodItem(value: unknown): value is FoodItem {
  if (!isRecord(value)) return false;
  return hasString(value, "id") && hasString(value, "name") && hasString(value, "category") && hasString(value, "areaId");
}

function isArea(value: unknown): value is FridgeArea {
  if (!isRecord(value)) return false;
  return hasString(value, "id") && hasString(value, "name") && hasString(value, "type");
}

function isSettings(value: unknown): value is AppSettings {
  if (!isRecord(value)) return false;
  return value.id === "local" && hasString(value, "theme") && typeof value.warningDays === "number";
}

export async function exportBackup(): Promise<BackupData> {
  const [foods, areas, settings] = await Promise.all([
    db.foods.toArray(),
    db.areas.orderBy("order").toArray(),
    db.settings.get("local"),
  ]);

  if (!settings) {
    throw new Error("設定がまだ初期化されていません。");
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    foods,
    areas,
    settings,
  };
}

export async function importBackup(raw: unknown) {
  if (!isRecord(raw)) {
    throw new Error("読み込めるバックアップ形式ではありません。");
  }
  const foods = raw.foods;
  const areas = raw.areas;
  const settings = raw.settings;

  if (!Array.isArray(foods) || !foods.every(isFoodItem) || !Array.isArray(areas) || !areas.every(isArea) || !isSettings(settings)) {
    throw new Error("バックアップの中身を確認してください。");
  }

  await db.transaction("rw", db.foods, db.areas, db.settings, async () => {
    await db.foods.clear();
    await db.areas.clear();
    await db.settings.clear();
    await db.foods.bulkPut(foods);
    await db.areas.bulkPut(areas);
    await db.settings.put(settings);
  });
}
