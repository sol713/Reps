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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
          数据统计
        </p>
        <h1 className="text-2xl font-bold text-text-primary">训练分析</h1>
      </header>

      {!hasData ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p className="empty-state-title">暂无数据</p>
          <p className="empty-state-description">开始训练吧!</p>
        </div>
      ) : (
        <>
          <section className="card">
            <VolumeTrendChart
              data={trendData}
              metric={metric}
              onMetricChange={setMetric}
              onPeriodChange={setPeriod}
              period={period}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="card">
              <BodyPartPieChart data={bodyPartDistribution} />
            </section>
            <section className="card">
              <PRProgressChart data={prProgress} />
            </section>
          </div>

          <section className="card">
            <TrainingHeatmap data={heatmapData} />
          </section>
        </>
      )}
    </div>
  );
}
