import { useState } from "react";
import { FridgeCanvas } from "../components/fridge/FridgeCanvas";
import { QuickAddFood } from "../components/food/QuickAddFood";

export function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-sm font-black text-teal-700 dark:text-teal-300">冷蔵庫ビュー</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">開けたままの冷蔵庫</h2>
      </div>
      <QuickAddFood />
      <FridgeCanvas search={search} onSearchChange={setSearch} />
    </div>
  );
}
