import { create } from "zustand";
import { db } from "../db/dexie";
import type { AreaType, FridgeArea } from "../types";
import { avoidAreaOverlaps, compactAreas, createArea, defaultAreas } from "../utils/layout";

interface FridgeState {
  areas: FridgeArea[];
  loading: boolean;
  error?: string;
  initialize: () => Promise<FridgeArea[]>;
  addArea: (type: AreaType) => Promise<void>;
  updateArea: (id: string, patch: Partial<Omit<FridgeArea, "id" | "createdAt">>) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  reorderArea: (id: string, direction: -1 | 1) => Promise<void>;
  resetLayout: () => Promise<void>;
  applyTemplate: (template: "family" | "compact") => Promise<void>;
}

async function replaceAreas(areas: FridgeArea[]) {
  await db.transaction("rw", db.areas, db.foods, async () => {
    await db.areas.clear();
    await db.areas.bulkPut(areas);
    const firstArea = areas[0];
    if (firstArea) {
      const areaIds = new Set(areas.map((area) => area.id));
      const foods = await db.foods.toArray();
      await Promise.all(
        foods
          .filter((food) => !areaIds.has(food.areaId))
          .map((food) => db.foods.update(food.id, { areaId: firstArea.id, updatedAt: new Date().toISOString() })),
      );
    }
  });
}

async function collapseDuplicatedTemplateAreas(areas: FridgeArea[]) {
  if (areas.length <= 10) return areas;

  const groups = new Map<string, FridgeArea[]>();
  for (const area of areas) {
    const key = `${area.type}:${area.name}:${area.icon}:${area.color}`;
    groups.set(key, [...(groups.get(key) ?? []), area]);
  }

  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1);
  if (duplicateGroups.length < 3) return areas;

  const removeToKeep = new Map<string, string>();
  const kept = [...areas]
    .sort((a, b) => a.order - b.order)
    .filter((area) => {
      const key = `${area.type}:${area.name}:${area.icon}:${area.color}`;
      const group = groups.get(key);
      if (!group || group[0].id === area.id) return true;
      removeToKeep.set(area.id, group[0].id);
      return false;
    })
    .map((area, index) => ({ ...area, order: index + 1, updatedAt: new Date().toISOString() }));

  if (removeToKeep.size === 0) return areas;

  const now = new Date().toISOString();
  await db.transaction("rw", db.areas, db.foods, async () => {
    for (const [removedId, keepId] of removeToKeep) {
      await db.foods.where("areaId").equals(removedId).modify({ areaId: keepId, updatedAt: now });
      await db.areas.delete(removedId);
    }
    await db.areas.bulkPut(kept);
  });

  return kept;
}

export const useFridgeStore = create<FridgeState>((set, get) => ({
  areas: [],
  loading: true,
  initialize: async () => {
    set({ loading: true, error: undefined });
    try {
      let areas = await db.areas.orderBy("order").toArray();
      if (areas.length === 0) {
        areas = defaultAreas();
        await db.areas.bulkPut(areas);
      }
      areas = await collapseDuplicatedTemplateAreas(areas);
      areas = avoidAreaOverlaps(areas);
      await db.areas.bulkPut(areas);
      set({ areas, loading: false });
      return areas;
    } catch {
      set({ error: "冷蔵庫レイアウトの読み込みに失敗しました。", loading: false });
      return [];
    }
  },
  addArea: async (type) => {
    const nextArea = createArea(type, get().areas.length + 1);
    const areas = avoidAreaOverlaps([...get().areas, nextArea]);
    await db.areas.bulkPut(areas);
    set({ areas });
  },
  updateArea: async (id, patch) => {
    const current = get().areas.find((area) => area.id === id);
    if (!current) return;
    const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const areas = avoidAreaOverlaps(
      get().areas.map((area) => (area.id === id ? next : area)),
      id,
    );
    await db.areas.bulkPut(areas);
    set({ areas });
  },
  deleteArea: async (id) => {
    const areas = get().areas;
    if (areas.length <= 1) return;
    const fallback = areas.find((area) => area.id !== id);
    if (!fallback) return;
    const now = new Date().toISOString();
    await db.transaction("rw", db.areas, db.foods, async () => {
      await db.foods.where("areaId").equals(id).modify({ areaId: fallback.id, updatedAt: now });
      await db.areas.delete(id);
    });
    set({ areas: areas.filter((area) => area.id !== id).map((area, index) => ({ ...area, order: index + 1 })) });
  },
  reorderArea: async (id, direction) => {
    const areas = [...get().areas].sort((a, b) => a.order - b.order);
    const index = areas.findIndex((area) => area.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= areas.length) return;
    const current = areas[index];
    const other = areas[target];
    areas[index] = { ...other, order: current.order, updatedAt: new Date().toISOString() };
    areas[target] = { ...current, order: other.order, updatedAt: new Date().toISOString() };
    await db.areas.bulkPut(areas);
    set({ areas: areas.sort((a, b) => a.order - b.order) });
  },
  resetLayout: async () => {
    const areas = defaultAreas();
    await replaceAreas(areas);
    set({ areas });
  },
  applyTemplate: async (template) => {
    const areas = template === "compact" ? compactAreas() : defaultAreas();
    await replaceAreas(areas);
    set({ areas });
  },
}));
