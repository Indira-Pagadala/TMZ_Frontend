export function ConditionalAdSlot({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) return null;
  return (
    <div className="glass-card p-4 my-6 flex items-center justify-center min-h-[90px]">
      <p className="text-xs text-muted">Advertisement</p>
    </div>
  );
}
