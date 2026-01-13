import { useEffect, useState } from "react";
import { bodyParts } from "../data/bodyParts.js";
import { calculateVolume } from "../lib/stats.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

export function useStats(days = 7) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [volumeTrend, setVolumeTrend] = useState([]);
  const [setsTrend, setSetsTrend] = useState([]);
  const [repsTrend, setRepsTrend] = useState([]);
  const [bodyPartDistribution, setBodyPartDistribution] = useState([]);
  const [prProgress, setPrProgress] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        const { data: logs, error: logsError } = await supabase
          .from("workout_logs")
          .select(
            "id,date,workout_sets(id,exercise_id,set_type,weight,reps,segments,exercises(name,body_part))"
          )
          .gte("date", startDateStr)
          .lte("date", endDateStr)
          .order("date", { ascending: true });

        if (logsError) throw logsError;

        const trendMap = new Map();
        const bodyPartMap = new Map();

        for (let i = 0; i < days; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split("T")[0];
          trendMap.set(dateStr, {
            date: dateStr,
            volume: 0,
            sets: 0,
            reps: 0
          });
        }

        (logs || []).forEach((log) => {
          const sets = log.workout_sets || [];
          const trendData = trendMap.get(log.date);

          sets.forEach((set) => {
            const volume = calculateVolume([set]);

            const reps =
              set.set_type === "drop_set"
                ? (set.segments || []).reduce(
                    (sum, seg) => sum + (seg.reps || 0),
                    0
                  )
                : set.reps || 0;

            if (trendData) {
              trendData.volume += volume;
              trendData.sets += 1;
              trendData.reps += reps;
            }

            const bodyPart = set.exercises?.body_part;
            if (bodyPart) {
              const current = bodyPartMap.get(bodyPart) || {
                bodyPart,
                volume: 0,
                sets: 0
              };
              current.volume += volume;
              current.sets += 1;
              bodyPartMap.set(bodyPart, current);
            }
          });
        });

        const trendArray = Array.from(trendMap.values());
        setVolumeTrend(
          trendArray.map((d) => ({
            date: d.date,
            value: Math.round(d.volume)
          }))
        );
        setSetsTrend(
          trendArray.map((d) => ({
            date: d.date,
            value: d.sets
          }))
        );
        setRepsTrend(
          trendArray.map((d) => ({
            date: d.date,
            value: d.reps
          }))
        );

        const bodyPartArray = Array.from(bodyPartMap.values()).map((item) => {
          const bodyPartInfo = bodyParts.find((bp) => bp.key === item.bodyPart);
          return {
            name: bodyPartInfo?.label || item.bodyPart,
            value: item.sets,
            volume: Math.round(item.volume)
          };
        });
        setBodyPartDistribution(bodyPartArray);

        await fetchPRProgress();
        await fetchHeatmapData();

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, days]);

  const fetchPRProgress = async () => {
    try {
      const { data, error: prError } = await supabase
        .from("pr_records")
        .select("id,exercise_id,weight,achieved_at,exercises(name)")
        .order("achieved_at", { ascending: true })
        .limit(100);

      if (prError) throw prError;

      const exerciseMap = new Map();
      (data || []).forEach((pr) => {
        const exerciseName = pr.exercises?.name || "未知动作";
        if (!exerciseMap.has(exerciseName)) {
          exerciseMap.set(exerciseName, []);
        }
        exerciseMap.get(exerciseName).push({
          date: pr.achieved_at.split("T")[0],
          weight: Number(pr.weight),
          exerciseName
        });
      });

      const topExercises = Array.from(exerciseMap.entries())
        .slice(0, 5)
        .flatMap(([_, records]) => records);

      setPrProgress(topExercises);
    } catch (err) {
      console.error("Failed to fetch PR progress:", err);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const { data, error: heatmapError } = await supabase
        .from("workout_logs")
        .select("date,workout_sets(id,set_type,weight,reps,segments)")
        .gte("date", startDateStr)
        .lte("date", endDateStr);

      if (heatmapError) throw heatmapError;

      const heatmap = (data || []).map((log) => {
        const sets = log.workout_sets || [];
        return {
          date: log.date,
          count: sets.length,
          level: Math.min(4, Math.floor(sets.length / 5))
        };
      });

      setHeatmapData(heatmap);
    } catch (err) {
      console.error("Failed to fetch heatmap data:", err);
    }
  };

  return {
    loading,
    error,
    volumeTrend,
    setsTrend,
    repsTrend,
    bodyPartDistribution,
    prProgress,
    heatmapData
  };
}
