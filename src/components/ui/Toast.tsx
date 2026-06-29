import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect } from "react";
import { clsx } from "clsx";
import { useUiStore } from "../../store/uiStore";

const iconByType = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toast() {
  const toast = useUiStore((state) => state.toast);
  const clearToast = useUiStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 2600);
    return () => window.clearTimeout(timer);
  }, [clearToast, toast]);

  if (!toast) return null;

  const Icon = iconByType[toast.type];

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6">
      <div
        role="status"
        className={clsx(
          "flex max-w-sm items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm font-semibold shadow-soft transition-colors dark:bg-slate-900",
          toast.type === "success" && "border-emerald-100 text-emerald-800 dark:border-emerald-900/70 dark:text-emerald-200",
          toast.type === "error" && "border-rose-100 text-rose-800 dark:border-rose-900/70 dark:text-rose-200",
          toast.type === "info" && "border-sky-100 text-sky-800 dark:border-sky-900/70 dark:text-sky-200",
        )}
      >
        <Icon size={19} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
