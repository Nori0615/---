import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { ChangeEvent } from "react";
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
    link.click();
    URL.revokeObjectURL(url);
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

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-sm font-black text-cyan-700">Settings</p>
        <h2 className="text-2xl font-black text-slate-900">設定</h2>
      </div>

      <section className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-5 shadow-soft">
        <h3 className="text-lg font-black text-slate-900">見た目と期限表示</h3>
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
          <Input
            label={`期限通知風の表示: ${settings.warningDays}日前から`}
            type="range"
            min="1"
            max="14"
            value={settings.warningDays}
            onChange={(event) => void updateSettings({ warningDays: Number(event.target.value) })}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-cyan-100 bg-white/82 p-5 shadow-soft">
        <h3 className="text-lg font-black text-slate-900">データ</h3>
        <p className="mt-1 text-sm text-slate-600">クラウド同期は使わず、IndexedDBにローカル保存しています。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => void download()}>
            <Download size={18} />
            エクスポート
          </Button>
          <label className="focus-within:outline-cyan-700 inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-cyan-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
            <Upload size={18} />
            インポート
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => void importFile(event)} />
          </label>
          <Button variant="secondary" onClick={() => void resetLayout().then(() => showToast("初期レイアウトに戻しました"))}>
            <RotateCcw size={18} />
            初期レイアウト
          </Button>
          <Button variant="danger" onClick={() => void clearAll()}>
            <Trash2 size={18} />
            全データ削除
          </Button>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5">
        <h3 className="text-lg font-black text-slate-900">PWA / オフライン</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          ビルド後はService WorkerとWeb App Manifestでオフライン起動に対応します。スマホではブラウザの「ホーム画面に追加」からアプリのように使えます。
        </p>
      </section>
    </div>
  );
}
