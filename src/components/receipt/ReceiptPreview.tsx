interface ReceiptPreviewProps {
  imageUrl?: string;
  fileName?: string;
}

export function ReceiptPreview({ imageUrl, fileName }: ReceiptPreviewProps) {
  if (!imageUrl) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
        <img src={imageUrl} alt={fileName ? `${fileName}のプレビュー` : "レシート画像のプレビュー"} className="max-h-[520px] w-full object-contain" />
      </div>
      {fileName ? <p className="mt-2 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{fileName}</p> : null}
    </section>
  );
}
