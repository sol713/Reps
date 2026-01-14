export default function TodaySummary({ summary }) {
  return (
    <section className="card relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 relative z-10">
        今日总览
      </p>
      <div className="grid grid-cols-3 gap-4 text-center relative z-10">
        <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
          <p className="text-xs font-medium text-text-secondary">部位</p>
          <p className="mt-2 text-sm font-bold text-text-primary truncate">{summary.bodyLabel}</p>
        </div>
        <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
          <p className="text-xs font-medium text-text-secondary">动作</p>
          <p className="mt-1 text-2xl font-black text-gradient">{summary.exerciseCount}</p>
        </div>
        <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
          <p className="text-xs font-medium text-text-secondary">组数</p>
          <p className="mt-1 text-2xl font-black text-gradient">{summary.setCount}</p>
        </div>
      </div>
    </section>
  );
}
