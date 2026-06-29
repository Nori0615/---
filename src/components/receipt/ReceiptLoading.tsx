import { Loader2, ScanText } from "lucide-react";

export function ReceiptLoading() {
  return (
    <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4 text-cyan-900 shadow-sm dark:border-teal-900/70 dark:bg-teal-950/30 dark:text-teal-100">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/80 dark:bg-slate-950/60">
          <Loader2 size={21} className="animate-spin" />
        </div>
        <div>
          <p className="text-sm font-bold">レシートを読み取っています</p>
          <p className="mt-0.5 text-xs font-medium text-cyan-700 dark:text-teal-200">商品候補を整理中です。</p>
        </div>
        <ScanText size={24} className="ml-auto hidden sm:block" />
      </div>
    </div>
  );
}
