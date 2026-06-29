export const FOOD_CATEGORIES = [
  "野菜",
  "肉",
  "魚",
  "卵・乳製品",
  "飲み物",
  "調味料",
  "冷凍食品",
  "作り置き",
  "お菓子",
  "その他",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const AREA_TYPES = ["refrigerator", "freezer", "vegetable", "door", "shelf", "case", "free"] as const;

export type AreaType = (typeof AREA_TYPES)[number];

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  areaId: string;
  expireDate?: string;
  bestBeforeDate?: string;
  memo?: string;
  color: string;
  icon: string;
  isOpened: boolean;
  isFavorite: boolean;
  isPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FoodDraft = Omit<FoodItem, "id" | "createdAt" | "updatedAt">;

export interface FridgeArea {
  id: string;
  name: string;
  type: AreaType;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = "light" | "dark";
export type LayoutMode = "realistic" | "compact";
export type DensityMode = "comfortable" | "compact";
export type CalendarView = "month" | "week";

export interface AppSettings {
  id: "local";
  theme: ThemeMode;
  layoutMode: LayoutMode;
  density: DensityMode;
  calendarView: CalendarView;
  warningDays: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  foods: FoodItem[];
  areas: FridgeArea[];
  settings: AppSettings;
}

export * from "./receipt";
