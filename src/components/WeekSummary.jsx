import { useMemo } from "react";
import AnimatedCounter from "./AnimatedCounter.jsx";

export default function WeekSummary({ workouts = [] }) {
  const stats = useMemo(() => {
    if (!workouts.length) return null;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weekAgoStr = oneWeekAgo.toISOString().split("T")[0];

    const thisWeek = workouts.filter((w) => w.date >= weekAgoStr);

    let totalSets = 0;
    let totalVolume = 0;
    const bodyPartsSet = new Set();

    thisWeek.forEach((w) => {
      if (w.sets) {
        totalSets += w.sets.length;
        w.sets.forEach((s) => {
          if (s.weight && s.reps) {
            totalVolume += s.weight * s.reps;
          } else if (s.segments) {
            s.segments.forEach((seg) => {
              if (seg.weight && seg.reps) {
                totalVolume += seg.weight * seg.reps;
              }
            });
          }
          if (s.body_part) {
            bodyPartsSet.add(s.body_part);
          }
        });
      }
    });

    const workoutDays = new Set(thisWeek.map((w) => w.date)).size;

    return {
      workoutDays,
      totalSets,
      totalVolume: Math.round(totalVolume),
      bodyParts: bodyPartsSet.size
    };
  }, [workouts]);

  if (!stats || stats.workoutDays === 0) {
    return (
      <div className="rounded-2xl bg-bg-secondary p-5 text-center">
        <p className="text-sm text-text-secondary">本周还没有训练记录</p>
        <p className="mt-1 text-xs text-text-tertiary">开始今天的训练吧！</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-text-primary">本周总结</h3>
        <span className="text-xs text-text-secondary">最近7天</span>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center">
        <StatItem
          label="训练天数"
          value={stats.workoutDays}
          suffix="天"
          highlight
        />
        <StatItem label="总组数" value={stats.totalSets} suffix="组" />
        <StatItem
          label="总容量"
          value={stats.totalVolume >= 1000 ? (stats.totalVolume / 1000).toFixed(1) : stats.totalVolume}
          suffix={stats.totalVolume >= 1000 ? "k" : "kg"}
        />
        <StatItem label="部位数" value={stats.bodyParts} />
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>周目标: 4天</span>
          <span>{Math.round((stats.workoutDays / 4) * 100)}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-primary/50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min((stats.workoutDays / 4) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, suffix = "", highlight = false }) {
  return (
    <div>
      <p className={`text-xl font-bold ${highlight ? "text-primary" : "text-text-primary"}`}>
        <AnimatedCounter value={value} duration={600} />
        {suffix && <span className="text-sm font-normal text-text-secondary">{suffix}</span>}
      </p>
      <p className="text-xs text-text-tertiary">{label}</p>
    </div>
  );
}
