import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface SheetProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Sheet({ open, title, children, onClose }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/24 backdrop-blur-sm">
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-soft transition-colors dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-cyan-100 px-5 py-4 transition-colors dark:border-slate-800">
          <h2 id="sheet-title" className="text-lg font-black text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}
