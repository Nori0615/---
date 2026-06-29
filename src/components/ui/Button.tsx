import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const variantClass: Record<Variant, string> = {
  primary: "bg-slate-900 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white shadow-[0_12px_28px_rgba(190,18,60,0.18)] hover:bg-rose-700",
  soft: "bg-teal-50 text-teal-800 hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-100 dark:hover:bg-teal-900",
};

const sizeClass: Record<Size, string> = {
  sm: "gap-1.5 rounded-xl px-3 py-2 text-sm",
  md: "gap-2 rounded-2xl px-4 py-3 text-sm",
  icon: "h-11 w-11 rounded-2xl p-0",
};

export function Button({ children, className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "focus-ring inline-flex shrink-0 items-center justify-center font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
