import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: "cyan" | "rose" | "amber" | "emerald" | "violet";
}

const toneClass = {
  cyan: "bg-cyan-50 text-cyan-800 border-cyan-100",
  rose: "bg-rose-50 text-rose-800 border-rose-100",
  amber: "bg-amber-50 text-amber-800 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
  violet: "bg-violet-50 text-violet-800 border-violet-100",
};

export function StatCard({ label, value, helper, icon: Icon, tone = "cyan" }: StatCardProps) {
  return (
    <section className={`rounded-[1.5rem] border p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black opacity-80">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/80 dark:bg-slate-800">
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-3 text-sm font-bold opacity-80">{helper}</p>
    </section>
  );
}
