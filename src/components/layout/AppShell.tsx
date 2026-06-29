import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { clsx } from "clsx";
import { FoodDetailSheet } from "../food/FoodDetailSheet";
import { FoodForm } from "../food/FoodForm";
import { useSettingsStore } from "../../store/settingsStore";
import { Toast } from "../ui/Toast";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function AppShell() {
  const settings = useSettingsStore((state) => state.settings);
  const theme = settings?.theme ?? "light";
  const density = settings?.density ?? "comfortable";
  const layoutMode = settings?.layoutMode ?? "realistic";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.layoutMode = layoutMode;
  }, [density, layoutMode, theme]);

  return (
    <div
      className={clsx(
        "min-h-screen transition-colors",
        theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-[#f7fcfd] text-slate-800",
      )}
      data-density={density}
      data-layout-mode={layoutMode}
    >
      <Header />
      <main
        className={clsx(
          "mx-auto w-full max-w-7xl flex-1 px-4 pb-24 md:px-6 lg:pb-8",
          density === "compact" ? "py-3 md:py-4" : "py-5",
        )}
      >
        <Outlet />
      </main>
      <BottomNav />
      <FoodForm />
      <FoodDetailSheet />
      <Toast />
    </div>
  );
}
