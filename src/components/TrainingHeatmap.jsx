import { ActivityCalendar } from "react-activity-calendar";

export default function TrainingHeatmap({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-app-muted">暂无训练数据</p>
      </div>
    );
  }

  const calendarData = data.map((item) => ({
    date: item.date,
    count: item.count,
    level: item.level
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-app-text">训练热力图</h3>
      <div className="overflow-x-auto">
        <ActivityCalendar
          blockSize={12}
          colorScheme="light"
          data={calendarData}
          fontSize={12}
          labels={{
            legend: {
              less: "少",
              more: "多"
            },
            months: [
              "1月", "2月", "3月", "4月", "5月", "6月",
              "7月", "8月", "9月", "10月", "11月", "12月"
            ],
            totalCount: "{{count}} 次训练",
            weekdays: ["日", "一", "二", "三", "四", "五", "六"]
          }}
          showWeekdayLabels
          theme={{
            light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#2d9687", "#10B981"],
            dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"]
          }}
        />
      </div>
    </div>
  );
}
