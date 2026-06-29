import { create } from "zustand";
import type { FoodDraft } from "../types";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface UiState {
  foodFormOpen: boolean;
  editingFoodId?: string;
  foodFormDefaults?: Partial<FoodDraft>;
  selectedFoodId?: string;
  toast?: ToastMessage;
  openFoodForm: (foodId?: string, defaults?: Partial<FoodDraft>) => void;
  closeFoodForm: () => void;
  selectFood: (foodId?: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  foodFormOpen: false,
  openFoodForm: (foodId, defaults) => set({ foodFormOpen: true, editingFoodId: foodId, foodFormDefaults: foodId ? undefined : defaults }),
  closeFoodForm: () => set({ foodFormOpen: false, editingFoodId: undefined, foodFormDefaults: undefined }),
  selectFood: (foodId) => set({ selectedFoodId: foodId }),
  showToast: (message, type = "success") => set({ toast: { id: Date.now(), message, type } }),
  clearToast: () => set({ toast: undefined }),
}));
