import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface UiState {
  foodFormOpen: boolean;
  editingFoodId?: string;
  selectedFoodId?: string;
  toast?: ToastMessage;
  openFoodForm: (foodId?: string) => void;
  closeFoodForm: () => void;
  selectFood: (foodId?: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  foodFormOpen: false,
  openFoodForm: (foodId) => set({ foodFormOpen: true, editingFoodId: foodId }),
  closeFoodForm: () => set({ foodFormOpen: false, editingFoodId: undefined }),
  selectFood: (foodId) => set({ selectedFoodId: foodId }),
  showToast: (message, type = "success") => set({ toast: { id: Date.now(), message, type } }),
  clearToast: () => set({ toast: undefined }),
}));
