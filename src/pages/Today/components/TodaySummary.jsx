export default function TodaySummary({ summary }) {
  return (
    <section className="card">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
        今日总览
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-bg-tertiary/60 p-3">
          <p className="text-[11px] font-medium text-text-tertiary">部位</p>
          <p className="mt-1 truncate text-sm font-semibold text-text-primary">{summary.bodyLabel}</p>
        </div>
        <div className="rounded-xl bg-bg-tertiary/60 p-3">
          <p className="text-[11px] font-medium text-text-tertiary">动作</p>
          <p className="mt-0.5 text-2xl font-bold text-text-primary tabular-nums">{summary.exerciseCount}</p>
        </div>
        <div className="rounded-xl bg-bg-tertiary/60 p-3">
          <p className="text-[11px] font-medium text-text-tertiary">组数</p>
          <p className="mt-0.5 text-2xl font-bold text-text-primary tabular-nums">{summary.setCount}</p>
        </div>
      </div>
    </section>
  );
}
