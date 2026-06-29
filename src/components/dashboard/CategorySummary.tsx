interface CategorySummaryProps {
  title: string;
  rows: Array<{ label: string; count: number; color?: string }>;
}

export function CategorySummary({ title, rows }: CategorySummaryProps) {
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="rounded-[1.75rem] border border-cyan-100 bg-white/90 p-5 shadow-soft transition-colors dark:border-slate-800 dark:bg-slate-900/90">
      <h2 className="text-lg font-black text-slate-900 dark:text-slate-50">{title}</h2>
      <div className="mt-4 grid gap-3">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <span>{row.label}</span>
                <span>{row.count}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-3 rounded-full bg-cyan-500"
                  style={{ width: `${Math.max(8, (row.count / max) * 100)}%`, backgroundColor: row.color ?? "#0891b2" }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">まだ集計できる食材がありません。</p>
        )}
      </div>
    </section>
  );
}
