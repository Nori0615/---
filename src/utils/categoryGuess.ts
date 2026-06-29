import type { FoodCategory, ReceiptApiCategory } from "../types";

export const receiptCategoryLabels: Record<ReceiptApiCategory, string> = {
  vegetable: "野菜",
  meat: "肉",
  fish: "魚",
  egg_dairy: "卵・乳製品",
  drink: "飲み物",
  seasoning: "調味料",
  frozen: "冷凍食品",
  ready_meal: "作り置き",
  snack: "お菓子",
  other: "その他",
  unknown: "不明",
};

export function mapReceiptCategory(category: ReceiptApiCategory): FoodCategory {
  switch (category) {
    case "vegetable":
      return "野菜";
    case "meat":
      return "肉";
    case "fish":
      return "魚";
    case "egg_dairy":
      return "卵・乳製品";
    case "drink":
      return "飲み物";
    case "seasoning":
      return "調味料";
    case "frozen":
      return "冷凍食品";
    case "ready_meal":
      return "作り置き";
    case "snack":
      return "お菓子";
    default:
      return "その他";
  }
}

export function getCategoryColor(category: FoodCategory) {
  switch (category) {
    case "野菜":
      return "#edf9ee";
    case "肉":
      return "#fff1f4";
    case "魚":
      return "#edf2ff";
    case "卵・乳製品":
      return "#fff8e7";
    case "飲み物":
      return "#eef9ff";
    case "調味料":
      return "#fff3e8";
    case "冷凍食品":
      return "#eef6ff";
    case "作り置き":
      return "#f4f1ff";
    case "お菓子":
      return "#fff1f6";
    default:
      return "#f3f4f6";
  }
}

export function getCategoryIcon(category: FoodCategory) {
  switch (category) {
    case "野菜":
      return "🥬";
    case "肉":
      return "🍗";
    case "魚":
      return "🐟";
    case "卵・乳製品":
      return "🥚";
    case "飲み物":
      return "🥛";
    case "調味料":
      return "🧂";
    case "冷凍食品":
      return "🧊";
    case "作り置き":
      return "🥣";
    case "お菓子":
      return "🍫";
    default:
      return "🍎";
  }
}
