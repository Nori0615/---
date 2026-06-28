import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { navItems } from "./Header";

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-cyan-100 bg-white/96 px-2 py-2 shadow-[0_-8px_24px_rgba(35,76,99,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "focus-ring flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black",
                isActive ? "bg-cyan-50 text-cyan-800" : "text-slate-500",
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
