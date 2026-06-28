import { Search } from "lucide-react";
import { FOOD_CATEGORIES, type FoodCategory } from "../../types";
import { Select } from "../ui/Select";

export type FoodSort = "expiry" | "name" | "created";

interface FoodSearchProps {
  search: string;
  category: "all" | FoodCategory;
  areaId: string;
  sort: FoodSort;
  onlyExpired: boolean;
  onlyOpened: boolean;
  onlyPriority: boolean;
  areaOptions: Array<{ value: string; label: string }>;
  onSearch: (value: string) => void;
  onCategory: (value: "all" | FoodCategory) => void;
  onArea: (value: string) => void;
  onSort: (value: FoodSort) => void;
  onOnlyExpired: (value: boolean) => void;
  onOnlyOpened: (value: boolean) => void;
  onOnlyPriority: (value: boolean) => void;
}

export function FoodSearch({
  search,
  category,
  areaId,
  sort,
  onlyExpired,
  onlyOpened,
  onlyPriority,
  areaOptions,
  onSearch,
  onCategory,
  onArea,
  onSort,
  onOnlyExpired,
  onOnlyOpened,
  onOnlyPriority,
}: FoodSearchProps) {
  return (
    <section className="grid gap-3 rounded-[1.5rem] border border-cyan-100 bg-white/82 p-4 shadow-sm">
      <label className="relative">
        <span className="sr-only">食材を検索</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="名前・メモで検索"
          className="focus-ring w-full rounded-2xl border border-cyan-100 bg-white py-3 pl-11 pr-4 text-base font-semibold shadow-sm"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="カテゴリ"
          value={category}
          onChange={(event) => onCategory(event.target.value as "all" | FoodCategory)}
          options={[{ value: "all", label: "すべて" }, ...FOOD_CATEGORIES.map((item) => ({ value: item, label: item }))]}
        />
        <Select
          label="保存場所"
          value={areaId}
          onChange={(event) => onArea(event.target.value)}
          options={[{ value: "all", label: "すべて" }, ...areaOptions]}
        />
        <Select
          label="並び替え"
          value={sort}
          onChange={(event) => onSort(event.target.value as FoodSort)}
          options={[
            { value: "expiry", label: "期限が近い順" },
            { value: "name", label: "名前順" },
            { value: "created", label: "登録が新しい順" },
          ]}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          ["期限切れのみ", onlyExpired, onOnlyExpired],
          ["開封済みのみ", onlyOpened, onOnlyOpened],
          ["優先のみ", onlyPriority, onOnlyPriority],
        ].map(([label, checked, onChange]) => (
          <label key={String(label)} className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-900">
            <input
              type="checkbox"
              checked={Boolean(checked)}
              onChange={(event) => (onChange as (value: boolean) => void)(event.target.checked)}
              className="h-4 w-4 accent-cyan-700"
            />
            {label as string}
          </label>
        ))}
      </div>
    </section>
  );
}
