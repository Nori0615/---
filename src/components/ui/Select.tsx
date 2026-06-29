import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <select
        className={`focus-ring w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] font-normal text-slate-800 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${className ?? ""}`}
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
