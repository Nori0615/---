import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center transition-colors dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-700 dark:bg-teal-950 dark:text-teal-200">
        <Sparkles size={22} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{children}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
