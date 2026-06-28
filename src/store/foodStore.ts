import { create } from "zustand";
import { db } from "../db/dexie";
import type { FoodDraft, FoodItem, FridgeArea } from "../types";
import { dateInputFromToday } from "../utils/date";
import { createId } from "../utils/id";

interface FoodState {
  foods: FoodItem[];
  loading: boolean;
  error?: string;
  initialize: (areas: FridgeArea[]) => Promise<void>;
  addFood: (draft: FoodDraft) => Promise<FoodItem>;
  updateFood: (id: string, patch: Partial<FoodDraft>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  moveFood: (id: string, areaId: string) => Promise<void>;
  changeQuantity: (id: string, delta: number) => Promise<void>;
  replaceFoods: (foods: FoodItem[]) => Promise<void>;
  clearFoods: () => Promise<void>;
}

function areaId(areas: FridgeArea[], type: FridgeArea["type"], fallbackIndex = 0) {
  return areas.find((area) => area.type === type)?.id ?? areas[fallbackIndex]?.id ?? "";
}

function sampleFoods(areas: FridgeArea[]): FoodDraft[] {
  return [
    {
      name: "牛乳",
      category: "飲み物",
      quantity: 1,
      unit: "本",
      areaId: areaId(areas, "door"),
      expireDate: dateInputFromToday(3),
      bestBeforeDate: dateInputFromToday(4),
      memo: "朝のコーヒー用",
      color: "#eef9ff",
      icon: "🥛",
      isOpened: true,
      isFavorite: true,
      isPriority: true,
    },
    {
      name: "レタス",
      category: "野菜",
      quantity: 1,
      unit: "玉",
      areaId: areaId(areas, "vegetable", 3),
      expireDate: dateInputFromToday(2),
      memo: "外葉から使う",
      color: "#edf9ee",
      icon: "🥬",
      isOpened: false,
      isFavorite: true,
      isPriority: false,
    },
    {
      name: "鶏むね肉",
      category: "肉",
      quantity: 300,
      unit: "g",
      areaId: areaId(areas, "freezer", 4),
      expireDate: dateInputFromToday(7),
      memo: "下味冷凍",
      color: "#fff1f4",
      icon: "🍗",
      isOpened: false,
      isFavorite: false,
      isPriority: false,
    },
    {
      name: "作り置きスープ",
      category: "作り置き",
      quantity: 2,
      unit: "食",
      areaId: areas.find((area) => area.name.includes("作り置き"))?.id ?? areaId(areas, "shelf"),
      expireDate: dateInputFromToday(0),
      memo: "今日の夜に食べ切る",
      color: "#fff8e7",
      icon: "🥣",
      isOpened: true,
      isFavorite: false,
      isPriority: true,
    },
  ];
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  loading: true,
  initialize: async (areas) => {
    set({ loading: true, error: undefined });
    try {
      let foods = await db.foods.orderBy("updatedAt").reverse().toArray();
      if (foods.length === 0 && areas.length > 0) {
        const now = new Date().toISOString();
        foods = sampleFoods(areas).map((draft) => ({
          ...draft,
          id: createId("food"),
          createdAt: now,
          updatedAt: now,
        }));
        await db.foods.bulkPut(foods);
      }
      set({ foods, loading: false });
    } catch {
      set({ error: "食材の読み込みに失敗しました。", loading: false });
    }
  },
  addFood: async (draft) => {
    const now = new Date().toISOString();
    const food: FoodItem = {
      ...draft,
      id: createId("food"),
      createdAt: now,
      updatedAt: now,
    };
    await db.foods.put(food);
    set((state) => ({ foods: [food, ...state.foods] }));
    return food;
  },
  updateFood: async (id, patch) => {
    const current = get().foods.find((food) => food.id === id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    await db.foods.put(next);
    set((state) => ({ foods: state.foods.map((food) => (food.id === id ? next : food)) }));
  },
  deleteFood: async (id) => {
    await db.foods.delete(id);
    set((state) => ({ foods: state.foods.filter((food) => food.id !== id) }));
  },
  moveFood: async (id, areaIdValue) => {
    await get().updateFood(id, { areaId: areaIdValue });
  },
  changeQuantity: async (id, delta) => {
    const food = get().foods.find((item) => item.id === id);
    if (!food) return;
    const quantity = Math.max(0, Number((food.quantity + delta).toFixed(1)));
    await get().updateFood(id, { quantity });
  },
  replaceFoods: async (foods) => {
    await db.transaction("rw", db.foods, async () => {
      await db.foods.clear();
      await db.foods.bulkPut(foods);
    });
    set({ foods });
  },
  clearFoods: async () => {
    await db.foods.clear();
    set({ foods: [] });
  },
}));
