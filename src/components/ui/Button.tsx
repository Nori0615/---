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
  primary: "bg-cyan-700 text-white shadow-soft hover:bg-cyan-800",
  secondary: "border border-cyan-100 bg-white text-slate-700 shadow-sm hover:bg-cyan-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white shadow-soft hover:bg-rose-700",
  soft: "bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
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
