interface FridgeShelfProps {
  top: number;
}

export function FridgeShelf({ top }: FridgeShelfProps) {
  return (
    <div
      className="pointer-events-none absolute left-[6%] right-[28%] h-1 rounded-full bg-white/80 shadow-[0_1px_8px_rgba(49,112,130,0.18)] dark:bg-slate-700/80"
      style={{ top: `${top}%` }}
    />
  );
}
