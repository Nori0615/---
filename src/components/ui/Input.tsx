import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
}

export function Input({ label, helper, className, ...props }: InputProps) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <input
        className={`focus-ring w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] font-normal text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 ${className ?? ""}`}
        {...props}
      />
      {helper ? <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{helper}</span> : null}
    </label>
  );
}
