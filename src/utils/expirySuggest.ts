import { dateInputFromToday } from "./date";
import type { ReceiptApiCategory } from "../types";

export function defaultExpireDays(category: ReceiptApiCategory) {
  switch (category) {
    case "fish":
      return 2;
    case "meat":
      return 3;
    case "vegetable":
      return 7;
    case "egg_dairy":
      return 10;
    case "ready_meal":
      return 3;
    case "frozen":
      return 30;
    default:
      return undefined;
  }
}

export function suggestedExpireDate(days?: number) {
  return typeof days === "number" && Number.isFinite(days) && days > 0 ? dateInputFromToday(days) : undefined;
}
