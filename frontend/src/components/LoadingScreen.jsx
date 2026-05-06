export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-brand-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-brand-500/10 flex items-center justify-center">
            <span className="text-brand-400 font-display font-bold text-lg">R</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm font-body animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
