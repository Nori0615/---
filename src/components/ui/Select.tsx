import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <select
        className={`focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-800 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${className ?? ""}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
