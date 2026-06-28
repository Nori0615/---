import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="grid place-items-center rounded-[1.5rem] border border-dashed border-cyan-200 bg-white/72 px-5 py-8 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
        <Sparkles size={22} />
      </div>
      <h3 className="text-base font-black text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{children}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
