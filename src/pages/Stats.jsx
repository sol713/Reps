import { useState } from "react";
import BodyPartPieChart from "../components/BodyPartPieChart.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import PRProgressChart from "../components/PRProgressChart.jsx";
import TrainingHeatmap from "../components/TrainingHeatmap.jsx";
import VolumeTrendChart from "../components/VolumeTrendChart.jsx";
import { useStats } from "../hooks/useStats.js";

export default function Stats() {
  const [period, setPeriod] = useState("week");
  const [metric, setMetric] = useState("volume");
  
  const days = period === "week" ? 7 : 30;
  const {
    loading,
    volumeTrend,
    setsTrend,
    repsTrend,
    bodyPartDistribution,
    prProgress,
    heatmapData
  } = useStats(days);

  if (loading) {
    return <LoadingScreen />;
  }

  const trendData =
    metric === "volume" ? volumeTrend : metric === "sets" ? setsTrend : repsTrend;

  const hasData =
    volumeTrend.some((d) => d.value > 0) ||
    bodyPartDistribution.length > 0 ||
    prProgress.length > 0 ||
    heatmapData.length > 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
          数据统计
        </p>
        <h1 className="text-xl font-bold text-app-text">训练分析</h1>
      </header>

      {!hasData ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-app-muted">暂无数据</p>
            <p className="mt-2 text-sm text-app-muted">开始训练吧!</p>
          </div>
        </div>
      ) : (
        <>
          <section className="neo-surface-soft rounded-card border border-app-divider p-5">
            <VolumeTrendChart
              data={trendData}
              metric={metric}
              onMetricChange={setMetric}
              onPeriodChange={setPeriod}
              period={period}
            />
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="neo-surface-soft rounded-card border border-app-divider p-5">
              <BodyPartPieChart data={bodyPartDistribution} />
            </section>
            <section className="neo-surface-soft rounded-card border border-app-divider p-5">
              <PRProgressChart data={prProgress} />
            </section>
          </div>

          <section className="neo-surface-soft rounded-card border border-app-divider p-5">
            <TrainingHeatmap data={heatmapData} />
          </section>
        </>
      )}
    </div>
  );
}
