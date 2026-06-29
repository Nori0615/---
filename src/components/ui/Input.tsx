import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
}

export function Input({ label, helper, className, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <input
        className={`focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-800 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${className ?? ""}`}
        {...props}
      />
      {helper ? <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{helper}</span> : null}
    </label>
  );
}
