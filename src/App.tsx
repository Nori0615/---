import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { useFoodStore } from "./store/foodStore";
import { useFridgeStore } from "./store/fridgeStore";
import { useSettingsStore } from "./store/settingsStore";
import { CalendarPage } from "./routes/CalendarPage";
import { DashboardPage } from "./routes/DashboardPage";
import { FoodListPage } from "./routes/FoodListPage";
import { HomePage } from "./routes/HomePage";
import { LayoutEditorPage } from "./routes/LayoutEditorPage";
import { SettingsPage } from "./routes/SettingsPage";

function App() {
  const initializeFridge = useFridgeStore((state) => state.initialize);
  const initializeFoods = useFoodStore((state) => state.initialize);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function boot() {
      const [areas] = await Promise.all([initializeFridge(), initializeSettings()]);
      await initializeFoods(areas);
      if (active) setReady(true);
    }
    void boot();
    return () => {
      active = false;
    };
  }, [initializeFoods, initializeFridge, initializeSettings]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7fcfd] p-6">
        <div className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-cyan-100" />
          <p className="font-black text-slate-800">冷蔵庫を開いています</p>
          <p className="mt-1 text-sm text-slate-500">ローカルデータを読み込み中です。</p>
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/layout" element={<LayoutEditorPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/list" element={<FoodListPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
