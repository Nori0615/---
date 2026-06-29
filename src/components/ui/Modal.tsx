import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  description?: string;
}

export function Modal({ open, title, children, onClose, description }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-900/28 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="max-h-[92vh] w-full overflow-hidden rounded-t-[1.75rem] bg-white shadow-soft transition-colors dark:bg-slate-900 sm:max-w-2xl sm:rounded-[1.75rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-cyan-100 px-5 py-4 transition-colors dark:border-slate-800">
          <div>
            <h2 id="modal-title" className="text-lg font-black text-slate-900 dark:text-slate-50">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-76px)] overflow-y-auto px-5 py-5">{children}</div>
      </section>
    </div>
  );
}
