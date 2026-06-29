import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { navItems } from "./Header";

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/96 px-2 py-2 shadow-[0_-6px_18px_rgba(15,23,42,0.06)] backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-950/96 lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "focus-ring flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold",
                isActive ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950" : "text-slate-500 dark:text-slate-400",
              )
            }
          >
            <item.icon size={18} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
