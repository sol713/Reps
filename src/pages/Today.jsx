import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BodyPartSelector from "../components/BodyPartSelector.jsx";
import BottomSheet from "../components/BottomSheet.jsx";
import DropSetInput from "../components/DropSetInput.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";
import Modal from "../components/Modal.jsx";
import PRCelebrationModal from "../components/PRCelebrationModal.jsx";
import RepsPicker from "../components/RepsPicker.jsx";
import RestTimer from "../components/RestTimer.jsx";
import SetCompleteAnimation from "../components/SetCompleteAnimation.jsx";
import SetRow from "../components/SetRow.jsx";
import StreakBadge from "../components/StreakBadge.jsx";
import UndoToast from "../components/UndoToast.jsx";
import WeightPicker from "../components/WeightPicker.jsx";
import WorkoutSummaryCard from "../components/WorkoutSummaryCard.jsx";
import { bodyParts } from "../data/bodyParts.js";
import { formatDate, getTodayIsoDate, getYesterdayIsoDate } from "../lib/date.js";
import { hapticFeedback } from "../lib/haptics.js";
import { normalizeSets } from "../lib/sets.js";
import { calculateWorkoutStats } from "../lib/stats.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useExercises } from "../hooks/useExercises.js";
import { usePRDetector } from "../hooks/usePRDetector.js";
import { useStreak } from "../hooks/useStreak.js";
import { useUndoToast } from "../hooks/useUndoToast.js";
import { useWorkout } from "../hooks/useWorkout.js";

function groupSets(sets) {
  const groups = new Map();
  sets.forEach((set) => {
    const current = groups.get(set.exercise_id) ?? {
      exerciseId: set.exercise_id,
      exerciseName: set.exercise_name,
      sets: []
    };
    current.sets.push(set);
    groups.set(set.exercise_id, current);
  });
  return Array.from(groups.values());
}

const WEIGHT_MIN = 5;
const WEIGHT_MAX = 50;
const REPS_MIN = 5;
const REPS_MAX = 30;

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampWeight(value) {
  return clampValue(Number(value ?? WEIGHT_MIN), WEIGHT_MIN, WEIGHT_MAX);
}

function clampReps(value) {
  return clampValue(Number(value ?? REPS_MIN), REPS_MIN, REPS_MAX);
}

export default function Today() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [currentBodyPart, setCurrentBodyPart] = useState("chest");
  const [currentExercise, setCurrentExercise] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [setType, setSetType] = useState("normal");
  const [segments, setSegments] = useState([{ weight: 20, reps: 8 }]);
  const [isResting, setIsResting] = useState(false);
  const [restKey, setRestKey] = useState(0);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [yesterdayStats, setYesterdayStats] = useState(undefined);
  const [sessionPRs, setSessionPRs] = useState([]);
  const [editingSet, setEditingSet] = useState(null);
  const [editWeight, setEditWeight] = useState(WEIGHT_MIN);
  const [editReps, setEditReps] = useState(REPS_MIN);
  const [editSegments, setEditSegments] = useState([]);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const deleteTimersRef = useRef(new Map());

  const {
    exercises,
    recentExercises,
    markAsRecent,
    loading: exercisesLoading,
    error: exercisesError
  } = useExercises();
  const {
    sets,
    addSet,
    deleteSet,
    updateSet,
    removeLocalSet,
    restoreLocalSet,
    getExerciseHistory,
    loading: workoutLoading,
    error: workoutError
  } = useWorkout();
  const { streak } = useStreak(sets.length);
  const { newPR, checkForPR, clearPR } = usePRDetector();
  const { toast, showUndo, handleUndo } = useUndoToast();

  const today = getTodayIsoDate();
  const todayGroups = useMemo(() => groupSets(sets), [sets]);
  const todayStats = useMemo(() => calculateWorkoutStats(sets), [sets]);
  const todaySummary = useMemo(
    () => ({
      bodyLabel: todayStats.bodyParts.join("、") || "-",
      exerciseCount: todayStats.exerciseCount,
      setCount: todayStats.totalSets
    }),
    [todayStats]
  );

  useEffect(() => {
    let isActive = true;

    const loadHistory = async () => {
      if (!currentExercise) {
        setExerciseHistory([]);
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      const history = await getExerciseHistory(currentExercise.id, 3);
      if (!isActive) {
        return;
      }
      setExerciseHistory(history);
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [currentExercise, getExerciseHistory, sets.length]);

  useEffect(() => {
    if (!currentExercise || exerciseHistory.length === 0) {
      return;
    }
    const latest = exerciseHistory[0];
    if (latest.set_type === "normal") {
      setWeight(clampWeight(latest.weight ?? 20));
      setReps(clampReps(latest.reps ?? 8));
    } else if (latest.segments?.length) {
      setSegments(
        latest.segments.map((segment) => ({
          weight: clampWeight(segment.weight),
          reps: clampReps(segment.reps)
        }))
      );
    }
  }, [currentExercise, exerciseHistory]);

  useEffect(() => {
    if (setType === "drop_set" && segments.length === 0) {
      setSegments([{ weight: clampWeight(weight), reps: clampReps(reps) }]);
    }
  }, [reps, setType, segments.length, weight]);

  useEffect(() => {
    return () => {
      deleteTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      deleteTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadYesterday = async () => {
      if (!user || !showSummary) {
        return;
      }

      setYesterdayStats(undefined);
      const yesterday = getYesterdayIsoDate();
      const { data, error } = await supabase
        .from("workout_logs")
        .select(
          "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,created_at,exercises(name,body_part))"
        )
        .eq("date", yesterday)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (error || !data) {
        setYesterdayStats(null);
        return;
      }

      const normalizedSets = normalizeSets(data.workout_sets ?? []);
      setYesterdayStats(calculateWorkoutStats(normalizedSets));
    };

    loadYesterday();

    return () => {
      isActive = false;
    };
  }, [showSummary, user]);

  const handleSelectExercise = (exercise) => {
    setCurrentExercise(exercise);
    markAsRecent(exercise.id);
    setShowExercisePicker(false);
  };

  const handleRecordSet = async () => {
    if (!currentExercise || workoutLoading) {
      return;
    }
    const startRestTimer = () => {
      setIsResting(true);
      setRestKey(Date.now());
    };
    if (setType === "normal") {
      const safeWeight = clampWeight(weight);
      const safeReps = clampReps(reps);
      if (safeWeight !== weight) {
        setWeight(safeWeight);
      }
      if (safeReps !== reps) {
        setReps(safeReps);
      }
      if (safeReps < REPS_MIN || safeWeight < WEIGHT_MIN) {
        return;
      }
      startRestTimer();
      const result = await addSet(currentExercise, {
        set_type: "normal",
        weight: safeWeight,
        reps: safeReps
      });
      if (!result) {
        return;
      }
      setShowComplete(true);
      const pr = await checkForPR({
        exerciseId: result.exercise_id,
        weight: result.weight,
        setId: result.id,
        exerciseName: result.exercise_name
      });
      if (pr) {
        setSessionPRs((prev) => [pr, ...prev]);
      }
    } else {
      const normalizedSegments = segments
        .map((segment) => ({
          weight: clampWeight(segment.weight),
          reps: clampReps(segment.reps)
        }))
        .filter((segment) => Number.isFinite(segment.weight) && Number.isFinite(segment.reps));
      if (normalizedSegments.length === 0) {
        return;
      }
      setSegments(normalizedSegments);
      startRestTimer();
      const result = await addSet(currentExercise, {
        set_type: "drop_set",
        segments: normalizedSegments
      });
      if (!result) {
        return;
      }
      setShowComplete(true);
    }
  };

  const handleEditOpen = (set) => {
    setEditError("");
    setEditLoading(false);
    setEditingSet(set);
    if (set.set_type === "drop_set") {
      const nextSegments = (set.segments ?? []).map((segment) => ({
        weight: clampWeight(segment.weight),
        reps: clampReps(segment.reps)
      }));
      setEditSegments(nextSegments);
      const lastSegment = nextSegments[nextSegments.length - 1];
      if (lastSegment) {
        setEditWeight(lastSegment.weight);
        setEditReps(lastSegment.reps);
      } else {
        setEditWeight(WEIGHT_MIN);
        setEditReps(REPS_MIN);
      }
      return;
    }
    setEditWeight(clampWeight(set.weight));
    setEditReps(clampReps(set.reps));
  };

  const handleEditClose = () => {
    setEditingSet(null);
    setEditError("");
  };

  const handleEditSave = async () => {
    if (!editingSet || editLoading) {
      return;
    }

    setEditLoading(true);
    setEditError("");

    if (editingSet.set_type === "drop_set") {
      const normalizedSegments = (editSegments ?? [])
        .map((segment) => ({
          weight: clampWeight(segment.weight),
          reps: clampReps(segment.reps)
        }))
        .filter((segment) => Number.isFinite(segment.weight) && Number.isFinite(segment.reps));

      if (normalizedSegments.length === 0) {
        setEditError("递减组至少保留一档");
        setEditLoading(false);
        return;
      }

      setEditSegments(normalizedSegments);
      const updated = await updateSet(editingSet.id, {
        set_type: "drop_set",
        segments: normalizedSegments
      });

      if (!updated) {
        setEditError("更新失败，请稍后重试");
        setEditLoading(false);
        return;
      }
    } else {
      const safeWeight = clampWeight(editWeight);
      const safeReps = clampReps(editReps);
      setEditWeight(safeWeight);
      setEditReps(safeReps);
      const updated = await updateSet(editingSet.id, {
        set_type: "normal",
        weight: safeWeight,
        reps: safeReps
      });

      if (!updated) {
        setEditError("更新失败，请稍后重试");
        setEditLoading(false);
        return;
      }
    }

    setEditLoading(false);
    setEditingSet(null);
  };

  const lastRecord = exerciseHistory[0];

  const handleDeleteSet = (setId) => {
    const index = sets.findIndex((set) => set.id === setId);
    if (index < 0) {
      return;
    }

    const removedSet = sets[index];
    removeLocalSet(setId);
    hapticFeedback("warning");

    showUndo(`已删除第 ${removedSet.set_number} 组`, () => {
      const timerId = deleteTimersRef.current.get(setId);
      if (timerId) {
        clearTimeout(timerId);
        deleteTimersRef.current.delete(setId);
      }
      restoreLocalSet(removedSet, index);
    });

    const timerId = setTimeout(async () => {
      const deleted = await deleteSet(setId);
      if (!deleted) {
        restoreLocalSet(removedSet, index);
      }
      deleteTimersRef.current.delete(setId);
    }, 4500);

    deleteTimersRef.current.set(setId, timerId);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
            今日训练
          </p>
          <h1 className="text-xl font-bold text-app-text">{formatDate(today)}</h1>
          <div className="mt-2">
            <StreakBadge streak={streak} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-full border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all hover:border-app-muted hover:bg-gray-50 active:scale-95 neo-surface-soft neo-pressable"
            to="/history"
          >
            历史
          </Link>
          <Link
            className="rounded-full border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all hover:border-app-muted hover:bg-gray-50 active:scale-95 neo-surface-soft neo-pressable"
            to="/stats"
          >
            统计
          </Link>
          <Link
            className="rounded-full border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all hover:border-app-muted hover:bg-gray-50 active:scale-95 neo-surface-soft neo-pressable"
            to="/exercises"
          >
            动作库
          </Link>
          <button
            className="rounded-full border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all hover:border-app-muted hover:bg-gray-50 active:scale-95 neo-surface-soft neo-pressable"
            type="button"
            onClick={signOut}
          >
            退出
          </button>
        </div>
      </header>

      {user?.email && (
        <p className="text-xs text-app-muted">已登录：{user.email}</p>
      )}

      <BodyPartSelector
        options={bodyParts.map((part) => part.label)}
        selected={currentBodyPart}
        onChange={setCurrentBodyPart}
      />

      <button
        className="interactive-card neo-surface-soft neo-pressable flex items-center justify-between rounded-card border border-app-divider bg-white px-4 py-4 text-left shadow-card"
        type="button"
        onClick={() => setShowExercisePicker(true)}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-app-muted">选择动作</p>
          <p className="mt-0.5 text-base font-bold text-app-text">
            {currentExercise?.name ?? "点击选择动作"}
          </p>
        </div>
        <span className="rounded-full bg-app-primary/10 px-3 py-1 text-xs font-semibold text-app-primary">
          搜索
        </span>
      </button>

      {currentExercise && (
        <section className="fade-in space-y-4 rounded-card neo-surface-soft p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
                当前动作
              </p>
              <h2 className="text-lg font-bold text-app-text">{currentExercise.name}</h2>
            </div>
            <button
              className="rounded-button border border-app-divider bg-white px-3 py-1.5 text-xs font-semibold text-app-muted shadow-sm transition-all hover:border-app-muted hover:bg-gray-50 active:scale-95 neo-surface-soft neo-pressable"
              type="button"
              onClick={() => navigate("/history")}
            >
              历史
            </button>
          </div>

          <button
            className="flex w-full items-center gap-2 rounded-input border border-app-divider bg-gray-50 px-4 py-2.5 text-left text-sm text-app-muted transition-colors hover:bg-gray-100 neo-inset"
            type="button"
            onClick={() => navigate("/history")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {historyLoading
              ? "历史加载中..."
              : lastRecord
                ? lastRecord.set_type === "drop_set"
                  ? `上次：${lastRecord.segments
                    ?.map((segment) => `${segment.weight}kg×${segment.reps}`)
                    .join(" → ")}`
                  : `上次：${lastRecord.weight ?? ""}kg × ${lastRecord.reps ?? ""}`
                : "暂无历史记录"}
          </button>

          <div className="grid gap-3 md:grid-cols-2">
            <WeightPicker
              value={weight}
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              onChange={setWeight}
            />
            <RepsPicker value={reps} min={REPS_MIN} max={REPS_MAX} onChange={setReps} />
          </div>

          <div className="flex gap-2">
            {[
              { key: "normal", label: "普通组" },
              { key: "drop_set", label: "递减组" }
            ].map((item) => {
              const isActive = setType === item.key;
              return (
                <button
                  className={`flex-1 rounded-button border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                      ? "btn-primary border-transparent text-white"
                      : "border-app-divider bg-white text-app-muted hover:border-app-muted hover:bg-gray-50 active:scale-98"
                    }`}
                  key={item.key}
                  type="button"
                  onClick={() => setSetType(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {setType === "drop_set" && (
            <DropSetInput
              segments={segments}
              onAddSegment={() =>
                setSegments((prev) => [
                  ...prev,
                  { weight: clampWeight(weight), reps: clampReps(reps) }
                ])
              }
              onRemoveSegment={(index) =>
                setSegments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
              }
              onUpdateSegment={(index, field, value) =>
                setSegments((prev) =>
                  prev.map((segment, itemIndex) =>
                    itemIndex === index
                      ? {
                        ...segment,
                        [field]:
                          field === "weight" ? clampWeight(value) : clampReps(value)
                      }
                      : segment
                  )
                )
              }
            />
          )}

          <button
            className="btn-primary w-full rounded-button px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
            type="button"
            disabled={workoutLoading}
            onClick={handleRecordSet}
          >
            记录本组 ✓
          </button>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-app-text">已完成</h3>
          <span className="rounded-full bg-app-success/10 px-2 py-0.5 text-xs font-semibold text-app-success">
            {sets.length} 组
          </span>
        </div>
        {workoutLoading ? (
          <div className="rounded-card border border-dashed border-app-divider bg-gray-50 neo-inset py-8 text-center">
            <p className="text-sm text-app-muted">加载中...</p>
          </div>
        ) : workoutError ? (
          <div className="rounded-card border border-dashed border-app-divider bg-gray-50 neo-inset py-8 text-center">
            <p className="text-sm text-red-500">{workoutError}</p>
          </div>
        ) : todayGroups.length === 0 ? (
          <div className="rounded-card border border-dashed border-app-divider bg-gray-50 neo-inset py-8 text-center">
            <p className="text-sm text-app-muted">还没有记录，开始你的第一组训练吧！</p>
          </div>
        ) : (
          todayGroups.map((group) => (
            <div className="fade-in space-y-2" key={group.exerciseId}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-app-text">{group.exerciseName}</p>
                <span className="text-xs text-app-muted">
                  {group.sets.length} 组
                </span>
              </div>
              <div className="space-y-2">
                {group.sets.map((set) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    onDelete={handleDeleteSet}
                    onEdit={handleEditOpen}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="stat-card rounded-card neo-surface-soft p-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
          今日总览
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-input bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-4">
            <p className="text-xs font-medium text-app-muted">部位</p>
            <p className="mt-1 text-sm font-bold text-app-text">{todaySummary.bodyLabel}</p>
          </div>
          <div className="rounded-input bg-gradient-to-br from-purple-50 to-pink-50 px-3 py-4">
            <p className="text-xs font-medium text-app-muted">动作</p>
            <p className="mt-1 text-lg font-bold text-app-text">{todaySummary.exerciseCount}</p>
          </div>
          <div className="rounded-input bg-gradient-to-br from-green-50 to-emerald-50 px-3 py-4">
            <p className="text-xs font-medium text-app-muted">组数</p>
            <p className="mt-1 text-lg font-bold text-app-text">{todaySummary.setCount}</p>
          </div>
        </div>
      </section>

      {sets.length > 0 && (
        <button
          className="btn-primary w-full rounded-button px-4 py-3 text-sm font-semibold text-white"
          type="button"
          onClick={() => setShowSummary(true)}
        >
          训练完成
        </button>
      )}

      {isResting && (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <RestTimer
            key={restKey}
            duration={60}
            onComplete={() => setIsResting(false)}
            onSkip={() => setIsResting(false)}
          />
        </div>
      )}

      <BottomSheet
        isOpen={showExercisePicker}
        title="选择动作"
        onClose={() => setShowExercisePicker(false)}
      >
        <ExercisePicker
          bodyPart={currentBodyPart}
          exercises={exercises}
          recentExercises={recentExercises}
          loading={exercisesLoading}
          error={exercisesError}
          onSelect={handleSelectExercise}
          onAdd={() => {
            setShowExercisePicker(false);
            navigate("/exercises");
          }}
        />
      </BottomSheet>

      <WorkoutSummaryCard
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        todayStats={todayStats}
        yesterdayStats={yesterdayStats}
        streak={streak}
        newPRs={sessionPRs}
      />

      <PRCelebrationModal pr={newPR} isOpen={Boolean(newPR)} onClose={clearPR} />

      <SetCompleteAnimation
        isVisible={showComplete}
        onComplete={() => setShowComplete(false)}
      />

      <UndoToast toast={toast} onUndo={handleUndo} />

      <Modal isOpen={Boolean(editingSet)} onClose={handleEditClose}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-app-muted">
                编辑记录
              </p>
              <h3 className="text-lg font-bold text-app-text">
                {editingSet?.exercise_name ?? "当前动作"}
              </h3>
              <p className="text-xs text-app-muted">第 {editingSet?.set_number} 组</p>
            </div>
            <button
              className="rounded-full border border-app-divider px-3 py-1 text-xs font-semibold text-app-muted"
              type="button"
              onClick={handleEditClose}
            >
              取消
            </button>
          </div>

          {editingSet?.set_type === "drop_set" ? (
            <DropSetInput
              segments={editSegments}
              onAddSegment={() =>
                setEditSegments((prev) => [
                  ...prev,
                  { weight: clampWeight(editWeight), reps: clampReps(editReps) }
                ])
              }
              onRemoveSegment={(index) =>
                setEditSegments((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
              }
              onUpdateSegment={(index, field, value) =>
                setEditSegments((prev) =>
                  prev.map((segment, itemIndex) =>
                    itemIndex === index
                      ? {
                        ...segment,
                        [field]:
                          field === "weight" ? clampWeight(value) : clampReps(value)
                      }
                      : segment
                  )
                )
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <WeightPicker
                value={editWeight}
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                onChange={setEditWeight}
              />
              <RepsPicker
                value={editReps}
                min={REPS_MIN}
                max={REPS_MAX}
                onChange={setEditReps}
              />
            </div>
          )}

          {editError && <p className="text-sm text-red-500">{editError}</p>}

          <button
            className="btn-primary w-full rounded-button px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            type="button"
            disabled={editLoading}
            onClick={handleEditSave}
          >
            {editLoading ? "保存中..." : "保存修改"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
