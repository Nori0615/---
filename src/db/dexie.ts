import Dexie, { type Table } from "dexie";
import type { AppSettings, FoodItem, FridgeArea } from "../types";

class FridgeMirrorDatabase extends Dexie {
  foods!: Table<FoodItem, string>;
  areas!: Table<FridgeArea, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super("fridge-mirror-local");
    this.version(1).stores({
      foods:
        "id, name, category, areaId, expireDate, bestBeforeDate, isOpened, isFavorite, isPriority, createdAt, updatedAt",
      areas: "id, type, order, updatedAt",
      settings: "id",
    });
  }
}

export const db = new FridgeMirrorDatabase();
