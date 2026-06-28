import { BarChart3, CalendarDays, Home, LayoutGrid, ListChecks, Plus, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { useUiStore } from "../../store/uiStore";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/", label: "冷蔵庫", icon: Home },
  { to: "/layout", label: "レイアウト", icon: LayoutGrid },
  { to: "/calendar", label: "期限", icon: CalendarDays },
  { to: "/list", label: "一覧", icon: ListChecks },
  { to: "/dashboard", label: "分析", icon: BarChart3 },
  { to: "/settings", label: "設定", icon: Settings },
];

export function Header() {
  const openFoodForm = useUiStore((state) => state.openFoodForm);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Fridgely</p>
          <h1 className="truncate text-xl font-black text-slate-900">マイ冷蔵庫</h1>
        </div>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "focus-ring inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-black transition",
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button onClick={() => openFoodForm()} aria-label="食材を追加">
          <Plus size={18} />
          <span className="hidden sm:inline">食材追加</span>
        </Button>
      </div>
    </header>
  );
}

export { navItems };
