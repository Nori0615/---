import type { AreaType, FridgeArea } from "../types";
import { createId } from "./id";

const AREA_GAP = 1.5;
const MIN_AREA_WIDTH = 12;
const MIN_AREA_HEIGHT = 8;
const MAX_AREA_WIDTH = 90;
const MAX_AREA_HEIGHT = 50;

const areaMeta: Record<AreaType, { name: string; icon: string; color: string }> = {
  refrigerator: { name: "冷蔵室", icon: "Snowflake", color: "#e9f8ff" },
  freezer: { name: "冷凍室", icon: "CloudSnow", color: "#edf2ff" },
  vegetable: { name: "野菜室", icon: "Sprout", color: "#ecf8ee" },
  door: { name: "ドアポケット", icon: "PanelRight", color: "#fff7df" },
  shelf: { name: "棚", icon: "Rows3", color: "#f4fbff" },
  case: { name: "小物ケース", icon: "Box", color: "#fff1f4" },
  free: { name: "自由エリア", icon: "Move", color: "#f4f1ff" },
};

export function areaTypeLabel(type: AreaType) {
  return areaMeta[type].name;
}

export function createArea(type: AreaType, order: number, patch: Partial<FridgeArea> = {}): FridgeArea {
  const now = new Date().toISOString();
  const meta = areaMeta[type];
  return {
    id: createId("area"),
    name: patch.name ?? meta.name,
    type,
    x: patch.x ?? (type === "door" ? 73 : 7),
    y: patch.y ?? Math.min(82, 8 + order * 8),
    width: patch.width ?? (type === "door" ? 20 : 62),
    height: patch.height ?? (type === "vegetable" || type === "freezer" ? 16 : 14),
    order,
    color: patch.color ?? meta.color,
    icon: patch.icon ?? meta.icon,
    createdAt: now,
    updatedAt: now,
  };
}

export function defaultAreas(): FridgeArea[] {
  return [
    createArea("shelf", 1, { name: "上段", x: 8, y: 7, width: 58, height: 14, color: "#eef9ff" }),
    createArea("shelf", 2, { name: "中段", x: 8, y: 25, width: 58, height: 16, color: "#f8fdff" }),
    createArea("shelf", 3, { name: "作り置き", x: 8, y: 45, width: 58, height: 15, color: "#fff8e7" }),
    createArea("vegetable", 4, { name: "野菜室", x: 8, y: 65, width: 58, height: 16, color: "#edf9ee" }),
    createArea("freezer", 5, { name: "冷凍室", x: 8, y: 84, width: 58, height: 12, color: "#edf2ff" }),
    createArea("door", 6, { name: "ドアポケット", x: 72, y: 9, width: 20, height: 48, color: "#fff6d8" }),
    createArea("case", 7, { name: "小物ケース", x: 72, y: 62, width: 20, height: 18, color: "#fff1f4" }),
  ];
}

export function compactAreas(): FridgeArea[] {
  return [
    createArea("refrigerator", 1, { name: "冷蔵室", x: 7, y: 7, width: 62, height: 48, color: "#eef9ff" }),
    createArea("vegetable", 2, { name: "野菜室", x: 7, y: 59, width: 62, height: 16, color: "#edf9ee" }),
    createArea("freezer", 3, { name: "冷凍室", x: 7, y: 79, width: 62, height: 15, color: "#edf2ff" }),
    createArea("door", 4, { name: "ドアポケット", x: 73, y: 9, width: 19, height: 66, color: "#fff6d8" }),
  ];
}

function roundLayout(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampArea(area: FridgeArea): FridgeArea {
  const width = roundLayout(clamp(area.width, MIN_AREA_WIDTH, MAX_AREA_WIDTH));
  const height = roundLayout(clamp(area.height, MIN_AREA_HEIGHT, MAX_AREA_HEIGHT));
  return {
    ...area,
    width,
    height,
    x: roundLayout(clamp(area.x, 0, 100 - width)),
    y: roundLayout(clamp(area.y, 0, 100 - height)),
  };
}

function overlaps(a: FridgeArea, b: FridgeArea) {
  return a.x < b.x + b.width + AREA_GAP && a.x + a.width + AREA_GAP > b.x && a.y < b.y + b.height + AREA_GAP && a.y + a.height + AREA_GAP > b.y;
}

function fits(area: FridgeArea, blockers: FridgeArea[]) {
  return blockers.every((blocker) => !overlaps(area, blocker));
}

function nearestFreeArea(area: FridgeArea, blockers: FridgeArea[]) {
  const candidates: FridgeArea[] = [];
  const step = 2;
  for (let y = 0; y <= 100 - area.height; y += step) {
    for (let x = 0; x <= 100 - area.width; x += step) {
      candidates.push({ ...area, x: roundLayout(x), y: roundLayout(y) });
    }
  }

  const freeCandidates = candidates.filter((candidate) => fits(candidate, blockers));
  if (freeCandidates.length === 0) return undefined;

  return freeCandidates
    .sort((a, b) => {
      const scoreA = Math.abs(a.x - area.x) * 0.8 + Math.abs(a.y - area.y);
      const scoreB = Math.abs(b.x - area.x) * 0.8 + Math.abs(b.y - area.y);
      return scoreA - scoreB;
    })[0];
}

function findFreeArea(area: FridgeArea, blockers: FridgeArea[]) {
  const clamped = clampArea(area);
  if (fits(clamped, blockers)) return clamped;

  const fitted = nearestFreeArea(clamped, blockers);
  if (fitted) return fitted;

  for (const scale of [0.85, 0.7, 0.55, 0.4]) {
    const resized = clampArea({
      ...clamped,
      width: Math.max(MIN_AREA_WIDTH, clamped.width * scale),
      height: Math.max(MIN_AREA_HEIGHT, clamped.height * scale),
    });
    const resizedFit = nearestFreeArea(resized, blockers);
    if (resizedFit) return resizedFit;
  }

  return clamped;
}

export function avoidAreaOverlaps(areas: FridgeArea[], anchorId?: string) {
  const ordered = [...areas].sort((a, b) => {
    if (a.id === anchorId) return -1;
    if (b.id === anchorId) return 1;
    return a.order - b.order;
  });
  const placed: FridgeArea[] = [];

  for (const area of ordered) {
    placed.push(findFreeArea(area, placed));
  }

  return areas
    .map((area) => placed.find((placedArea) => placedArea.id === area.id) ?? area)
    .sort((a, b) => a.order - b.order);
}
