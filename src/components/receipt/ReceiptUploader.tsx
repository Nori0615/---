import { Camera, ImageUp, RefreshCcw } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "../ui/Button";

interface ReceiptUploaderProps {
  file?: File;
  onFileChange: (file?: File) => void;
}

export function ReceiptUploader({ file, onFileChange }: ReceiptUploaderProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileChange(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Receipt</p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">レシートを追加</h2>
        </div>
        {file ? (
          <Button variant="ghost" size="sm" onClick={() => onFileChange(undefined)}>
            <RefreshCcw size={16} />
            変更
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="focus-within:outline-cyan-700 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 py-7 text-center transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-teal-900 dark:bg-teal-950/25 dark:hover:bg-teal-950/40">
          <Camera size={26} className="text-cyan-700 dark:text-teal-200" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">カメラで撮る</span>
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleChange} />
        </label>

        <label className="focus-within:outline-cyan-700 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900">
          <ImageUp size={26} className="text-slate-600 dark:text-slate-300" />
          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">画像を選ぶ</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>
      </div>
    </section>
  );
}
