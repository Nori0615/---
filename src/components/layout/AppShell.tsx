import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { FoodDetailSheet } from "../food/FoodDetailSheet";
import { FoodForm } from "../food/FoodForm";
import { useSettingsStore } from "../../store/settingsStore";
import { Toast } from "../ui/Toast";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function AppShell() {
  const theme = useSettingsStore((state) => state.settings?.theme ?? "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-[#f7fcfd] text-slate-800">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 pb-24 md:px-6 lg:pb-8">
        <Outlet />
      </main>
      <BottomNav />
      <FoodForm />
      <FoodDetailSheet />
      <Toast />
    </div>
  );
}
