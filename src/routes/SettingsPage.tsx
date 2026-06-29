import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { db } from "../db/dexie";
import { useFoodStore } from "../store/foodStore";
import { useFridgeStore } from "../store/fridgeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useUiStore } from "../store/uiStore";
import { exportBackup, importBackup } from "../utils/storage";

export function SettingsPage() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const initializeSettings = useSettingsStore((state) => state.initialize);
  const initializeFridge = useFridgeStore((state) => state.initialize);
  const resetLayout = useFridgeStore((state) => state.resetLayout);
  const initializeFoods = useFoodStore((state) => state.initialize);
  const showToast = useUiStore((state) => state.showToast);

  if (!settings) return null;

  const download = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fridgely-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("バックアップを書き出しました");
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importBackup(JSON.parse(text) as unknown);
      const areas = await initializeFridge();
      await Promise.all([initializeFoods(areas), initializeSettings()]);
      showToast("バックアップを読み込みました");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "読み込みに失敗しました", "error");
    } finally {
      event.target.value = "";
    }
  };

  const clearAll = async () => {
    if (!window.confirm("すべてのデータを削除して初期状態に戻しますか？")) return;
    await db.transaction("rw", db.foods, db.areas, db.settings, async () => {
      await db.foods.clear();
      await db.areas.clear();
      await db.settings.clear();
    });
    const areas = await initializeFridge();
    await Promise.all([initializeFoods(areas), initializeSettings()]);
    showToast("初期状態に戻しました", "info");
  };

  const restoreDefaultLayout = async () => {
    await resetLayout();
    const areas = await initializeFridge();
    await initializeFoods(areas);
    showToast("初期レイアウトに戻しました", "info");
  };

  const updateWarningDays = (value: number) => {
    const nextValue = Math.min(14, Math.max(1, value || 1));
    void updateSettings({ warningDays: nextValue });
  };

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">Settings</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">設定</h2>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">見た目と期限表示</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Select
            label="テーマ"
            value={settings.theme}
            onChange={(event) => void updateSettings({ theme: event.target.value as typeof settings.theme })}
            options={[
              { value: "light", label: "ライト" },
              { value: "dark", label: "ダーク" },
            ]}
          />
          <Select
            label="表示密度"
            value={settings.density}
            onChange={(event) => void updateSettings({ density: event.target.value as typeof settings.density })}
            options={[
              { value: "comfortable", label: "ゆったり" },
              { value: "compact", label: "コンパクト" },
            ]}
          />
          <Select
            label="レイアウト表示"
            value={settings.layoutMode}
            onChange={(event) => void updateSettings({ layoutMode: event.target.value as typeof settings.layoutMode })}
            options={[
              { value: "realistic", label: "リアル寄り" },
              { value: "compact", label: "コンパクト" },
            ]}
          />
          <Select
            label="期限カレンダー"
            value={settings.calendarView}
            onChange={(event) => void updateSettings({ calendarView: event.target.value as typeof settings.calendarView })}
            options={[
              { value: "month", label: "月表示" },
              { value: "week", label: "週表示" },
            ]}
          />
          <div className="grid gap-3">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <span className="flex items-center justify-between gap-3">
                <span>期限通知風の表示</span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {settings.warningDays}日前から
                </span>
              </span>
              <input
                type="range"
                min="1"
                max="14"
                value={settings.warningDays}
                onChange={(event) => updateWarningDays(Number(event.target.value))}
                className="focus-ring h-10 w-full accent-cyan-700 dark:accent-teal-300"
              />
            </label>
            <Input
              label="通知日数"
              type="number"
              min="1"
              max="14"
              value={settings.warningDays}
              onChange={(event) => updateWarningDays(Number(event.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900/90">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">データ</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => void download()}>
            <Download size={18} />
            エクスポート
          </Button>
          <label className="focus-within:outline-cyan-700 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Upload size={18} />
            インポート
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => void importFile(event)} />
          </label>
          <Button variant="secondary" onClick={() => void restoreDefaultLayout()}>
            <RotateCcw size={18} />
            初期レイアウト
          </Button>
          <Button variant="danger" onClick={() => void clearAll()}>
            <Trash2 size={18} />
            全データ削除
          </Button>
        </div>
      </section>
    </div>
  );
}
