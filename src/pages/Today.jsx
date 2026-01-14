import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomSheet from "../components/BottomSheet.jsx";
import DropSetInput from "../components/DropSetInput.jsx";
import ExercisePicker from "../components/ExercisePicker.jsx";
import Modal from "../components/Modal.jsx";
import OnboardingModal from "../components/OnboardingModal.jsx";
import PRCelebrationModal from "../components/PRCelebrationModal.jsx";
import QuickActions from "../components/QuickActions.jsx";
import QuickRecordPanel from "../components/QuickRecordPanel.jsx";
import NumberPicker from "../components/NumberPicker.jsx";
import RestTimer from "../components/RestTimer.jsx";
import RPESelector from "../components/RPESelector.jsx";
import SetCompleteAnimation from "../components/SetCompleteAnimation.jsx";
import SetNoteInput from "../components/SetNoteInput.jsx";
import SetRow from "../components/SetRow.jsx";
import SmartStartCard from "../components/SmartStartCard.jsx";
import StreakBadge from "../components/StreakBadge.jsx";
import UndoToast from "../components/UndoToast.jsx";
import WeeklyGoalCard from "../components/WeeklyGoalCard.jsx";
import WorkoutSuggestions from "../components/WorkoutSuggestions.jsx";
import PhotoUploader from "../components/PhotoUploader.jsx";

import WorkoutSummaryCard from "../components/WorkoutSummaryCard.jsx";
import { bodyParts } from "../data/bodyParts.js";
import { formatDate, getTodayIsoDate, getYesterdayIsoDate } from "../lib/date.js";
import { hapticFeedback } from "../lib/haptics.js";
import { normalizeSets } from "../lib/sets.js";
import { clamp } from "../lib/math.js";
import { calculateWorkoutStats } from "../lib/stats.js";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useExercises } from "../hooks/useExercises.js";
import { usePRDetector } from "../hooks/usePRDetector.js";
import { useStreak } from "../hooks/useStreak.js";
import { useSmartSuggestion } from "../hooks/useSmartSuggestion.js";
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
  return Array.from(groups.values()).reverse();
}

const WEIGHT_MIN = 5;
const WEIGHT_MAX = 50;
const REPS_MIN = 5;
const REPS_MAX = 30;

function clampWeight(value) {
  return clamp(Number(value ?? WEIGHT_MIN), WEIGHT_MIN, WEIGHT_MAX);
}

function clampReps(value) {
  return clamp(Number(value ?? REPS_MIN), REPS_MIN, REPS_MAX);
}

export default function Today() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [currentExercise, setCurrentExercise] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [setType, setSetType] = useState("normal");
  const [segments, setSegments] = useState([{ weight: 20, reps: 8 }]);
  const [isResting, setIsResting] = useState(false);
  const [restKey, setRestKey] = useState(0);
  const [restDuration, setRestDuration] = useState(60);
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
  const [editRpe, setEditRpe] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templateExerciseIndex, setTemplateExerciseIndex] = useState(0);
  const [exerciseQueue, setExerciseQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [rpe, setRpe] = useState(null);
  const [setNotes, setSetNotes] = useState("");
  const [photoPath, setPhotoPath] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [pickerInitialBodyPart, setPickerInitialBodyPart] = useState(null);
  const deleteTimersRef = useRef(new Map());

  const labelToKeyMap = useMemo(() => {
    const map = {};
    bodyParts.forEach((part) => {
      map[part.label] = part.key;
    });
    return map;
  }, []);

  const {
    exercises,
    recentExercises,
    markAsRecent,
    loading: exercisesLoading,
    error: exercisesError
  } = useExercises();
  const {
    todayLog,
    sets,
    addSet,
    deleteSet,
    updateSet,
    removeLocalSet,
    restoreLocalSet,
    getExerciseHistory,
    startWorkout,
    endWorkout,
    getWorkoutDuration,
    loading: workoutLoading,
    error: workoutError
  } = useWorkout();
  const { streak } = useStreak(sets.length);
  const { newPR, checkForPR, clearPR } = usePRDetector();
  const { toast, showUndo, handleUndo } = useUndoToast();
  const {
    loading: smartLoading,
    suggestedPart,
    lastWorkout: smartLastWorkout,
    recentParts,
    getExercisesFromLastWorkout
  } = useSmartSuggestion();

  const handleSmartStart = async () => {
    const exercisesList = getExercisesFromLastWorkout();
    if (exercisesList.length === 0) return;

    await startWorkout();

    setExerciseQueue(exercisesList);
    setQueueIndex(0);

    const firstExercise = exercisesList[0];
    setCurrentExercise({
      id: firstExercise.exerciseId,
      name: firstExercise.exerciseName,
      body_part: firstExercise.bodyPart
    });

    if (firstExercise.sets.length > 0) {
      const lastSet = firstExercise.sets[firstExercise.sets.length - 1];
      setWeight(clampWeight(lastSet.weight));
      setReps(clampReps(lastSet.reps));
    }

    hapticFeedback("success");
  };

  const handleChangeSuggestedPart = () => {
    setShowExercisePicker(true);
  };

  const handleWorkoutSuggestionSelect = (suggestion) => {
    const firstExerciseLabel = suggestion.exercises?.[0];
    const bodyPartKey = firstExerciseLabel ? labelToKeyMap[firstExerciseLabel] : null;
    setPickerInitialBodyPart(bodyPartKey);
    setShowExercisePicker(true);
  };

  useEffect(() => {
    const template = location.state?.template;
    if (template && !activeTemplate) {
      setActiveTemplate(template);
      setTemplateExerciseIndex(0);
      startWorkout(template.id);
      
      if (template.exercises?.length > 0) {
        const firstEx = template.exercises[0];
        setCurrentExercise({
          id: firstEx.exerciseId,
          name: firstEx.exerciseName,
          body_part: firstEx.bodyPart
        });
        if (firstEx.targetWeight) {
          setWeight(clampWeight(firstEx.targetWeight));
        }
        setReps(clampReps(firstEx.targetRepsMin ?? 8));
        if (firstEx.restSeconds) {
          setRestDuration(firstEx.restSeconds);
        }
      }
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, activeTemplate, startWorkout, navigate, location.pathname]);

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
    setPickerInitialBodyPart(null);
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
        reps: safeReps,
        rest_seconds: restDuration,
        rpe: rpe,
        notes: setNotes.trim() || null,
        photo_url: photoPath
      });
      if (!result) {
        return;
      }
      setRpe(null);
      setSetNotes("");
      setPhotoPath(null);
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
        segments: normalizedSegments,
        rest_seconds: restDuration,
        rpe: rpe,
        notes: setNotes.trim() || null,
        photo_url: photoPath
      });
      if (!result) {
        return;
      }
      setRpe(null);
      setSetNotes("");
      setPhotoPath(null);
      setShowComplete(true);
    }
  };

  const handleQuickRecord = async (quickWeight, quickReps) => {
    if (!currentExercise || workoutLoading) {
      return;
    }
    
    const safeWeight = clampWeight(quickWeight);
    const safeReps = clampReps(quickReps);
    
    setIsResting(true);
    setRestKey(Date.now());
    
    const result = await addSet(currentExercise, {
      set_type: "normal",
      weight: safeWeight,
      reps: safeReps,
      rest_seconds: restDuration
    });
    
    if (!result) {
      return;
    }
    
    setWeight(safeWeight);
    setReps(safeReps);
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
  };

  const handleNextTemplateExercise = () => {
    if (!activeTemplate?.exercises) return;
    
    const nextIndex = templateExerciseIndex + 1;
    if (nextIndex >= activeTemplate.exercises.length) {
      setActiveTemplate(null);
      return;
    }
    
    const nextEx = activeTemplate.exercises[nextIndex];
    setTemplateExerciseIndex(nextIndex);
    setCurrentExercise({
      id: nextEx.exerciseId,
      name: nextEx.exerciseName,
      body_part: nextEx.bodyPart
    });
    if (nextEx.targetWeight) {
      setWeight(clampWeight(nextEx.targetWeight));
    }
    setReps(clampReps(nextEx.targetRepsMin ?? 8));
    if (nextEx.restSeconds) {
      setRestDuration(nextEx.restSeconds);
    }
  };

  const handleNextQueueExercise = () => {
    if (exerciseQueue.length === 0) return;
    
    const nextIndex = queueIndex + 1;
    if (nextIndex >= exerciseQueue.length) {
      setExerciseQueue([]);
      setQueueIndex(0);
      return;
    }
    
    const nextEx = exerciseQueue[nextIndex];
    setQueueIndex(nextIndex);
    setCurrentExercise({
      id: nextEx.exerciseId,
      name: nextEx.exerciseName,
      body_part: nextEx.bodyPart
    });
    
    if (nextEx.sets.length > 0) {
      const lastSet = nextEx.sets[nextEx.sets.length - 1];
      setWeight(clampWeight(lastSet.weight));
      setReps(clampReps(lastSet.reps));
    }
    
    hapticFeedback("light");
  };

  const handleFinishWorkout = async () => {
    await endWorkout();
    setShowSummary(true);
    setActiveTemplate(null);
    setExerciseQueue([]);
    setQueueIndex(0);
  };

  const handleEditOpen = (set) => {
    setEditError("");
    setEditLoading(false);
    setEditingSet(set);
    setEditRpe(set.rpe ?? null);
    setEditNotes(set.notes ?? "");
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
        segments: normalizedSegments,
        rpe: editRpe,
        notes: editNotes.trim() || null
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
        reps: safeReps,
        rpe: editRpe,
        notes: editNotes.trim() || null
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
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              {activeTemplate ? activeTemplate.name : "今日训练"}
            </p>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">{formatDate(today)}</h1>
            {todayLog?.startedAt && (
              <p className="text-sm font-medium text-text-secondary mt-1">
                已训练 {getWorkoutDuration() ?? 0} 分钟
              </p>
            )}
          </div>
          <StreakBadge streak={streak} />
        </div>
        {activeTemplate && (
          <div className="mt-4 flex items-center gap-3">
            <div className="progress-bar flex-1">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${((templateExerciseIndex + 1) / activeTemplate.exercises.length) * 100}%`
                }}
              />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {templateExerciseIndex + 1}/{activeTemplate.exercises.length}
            </span>
          </div>
        )}
        {!activeTemplate && exerciseQueue.length > 1 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="progress-bar flex-1">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${((queueIndex + 1) / exerciseQueue.length) * 100}%`,
                  background: 'var(--gradient-success)'
                }}
              />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {queueIndex + 1}/{exerciseQueue.length}
            </span>
          </div>
        )}
      </header>

      <WeeklyGoalCard targetDays={6} />

      <QuickActions />

      {!todayLog && !smartLoading && suggestedPart && (
        <SmartStartCard
          suggestedPart={suggestedPart}
          lastWorkout={smartLastWorkout}
          exerciseCount={getExercisesFromLastWorkout().length}
          onStart={handleSmartStart}
          onChangePart={handleChangeSuggestedPart}
        />
      )}

      {!currentExercise && !smartLoading && sets.length === 0 && (
        <WorkoutSuggestions
          lastWorkoutParts={recentParts}
          onSelect={handleWorkoutSuggestionSelect}
        />
      )}

      <button
        className="card card-interactive group flex items-center justify-between p-5"
        type="button"
        onClick={() => setShowExercisePicker(true)}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary group-hover:text-primary transition-colors">选择动作</p>
          <p className="mt-1 text-xl font-bold text-text-primary group-hover:text-gradient transition-all">
            {currentExercise?.name ?? "点击选择动作"}
          </p>
        </div>
        <span className="chip group-hover:bg-primary/10 group-hover:text-primary transition-all">
           🔍 搜索
        </span>
      </button>

      {currentExercise && (
        <section className="animate-fade-in card space-y-5 border-t-4 border-t-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                当前动作
              </p>
              <h2 className="text-2xl font-bold text-text-primary mt-1">{currentExercise.name}</h2>
            </div>
          </div>

          <button
            className="flex w-full items-center gap-3 rounded-xl bg-bg-tertiary/50 border border-border-primary px-4 py-3 text-left text-sm text-text-secondary transition-all hover:bg-bg-tertiary active:scale-[0.98]"
            type="button"
            onClick={() => navigate("/history")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-secondary text-primary">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">
              {historyLoading
                ? "历史加载中..."
                : lastRecord
                  ? lastRecord.set_type === "drop_set"
                    ? `上次：${lastRecord.segments
                      ?.map((segment) => `${segment.weight}kg×${segment.reps}`)
                      .join(" → ")}`
                    : `上次：${lastRecord.weight ?? ""}kg × ${lastRecord.reps ?? ""}`
                  : "暂无历史记录"}
            </span>
          </button>

          <QuickRecordPanel
            exerciseHistory={exerciseHistory}
            currentWeight={weight}
            currentReps={reps}
            onApply={(w, r) => {
              setWeight(clampWeight(w));
              setReps(clampReps(r));
            }}
            onQuickRecord={handleQuickRecord}
          />

          <div className="rounded-2xl bg-bg-tertiary/30 p-4 border border-border-primary grid gap-4 md:grid-cols-2">
            <NumberPicker
              label="重量"
              value={weight}
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              step={2.5}
              precision={2}
              unit="kg"
              onChange={setWeight}
            />
            <NumberPicker
              label="次数"
              value={reps}
              min={REPS_MIN}
              max={REPS_MAX}
              step={1}
              unit="次"
              onChange={setReps}
            />
          </div>

          <div className="flex gap-2 rounded-xl bg-bg-tertiary/50 p-1">
            {[
              { key: "normal", label: "普通组" },
              { key: "drop_set", label: "递减组" }
            ].map((item) => {
              const isActive = setType === item.key;
              return (
                <button
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-white text-primary shadow-sm dark:bg-bg-secondary" 
                      : "text-text-tertiary hover:text-text-secondary"
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

          <RPESelector value={rpe} onChange={setRpe} />

          <SetNoteInput value={setNotes} onChange={setSetNotes} />

          <PhotoUploader
            photoUrl={null}
            onUpload={(path) => setPhotoPath(path)}
            onRemove={() => setPhotoPath(null)}
          />

          <button
            className="btn btn-primary w-full text-lg shadow-glow h-12"
            type="button"
            disabled={workoutLoading}
            onClick={handleRecordSet}
          >
            记录本组 ✓
          </button>
          {activeTemplate && templateExerciseIndex < activeTemplate.exercises.length - 1 && (
            <button
              className="btn btn-secondary w-full text-base"
              type="button"
              onClick={handleNextTemplateExercise}
            >
              下一动作 →
            </button>
          )}
          {!activeTemplate && exerciseQueue.length > 1 && queueIndex < exerciseQueue.length - 1 && (
            <button
              className="btn btn-secondary w-full text-base"
              type="button"
              onClick={handleNextQueueExercise}
            >
              下一动作 →
            </button>
          )}
        </section>
      )}

      {sets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-lg text-text-primary">已完成</h3>
            <span className="chip bg-success/10 text-success border border-success/20 font-bold">{sets.length} 组</span>
          </div>
          {workoutLoading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : workoutError ? (
            <div className="empty-state">
              <p className="text-sm text-danger">{workoutError}</p>
            </div>
          ) : (
            todayGroups.map((group) => {
              const isCurrentExercise = currentExercise?.id === group.exerciseId;
              return (
                <div className="animate-fade-in" key={group.exerciseId}>
                  <button
                    className="card card-interactive mb-2 flex w-full items-center justify-between p-4"
                    type="button"
                    onClick={() => {
                      if (isCurrentExercise) {
                        setCurrentExercise(null);
                      } else {
                        const ex = exercises.find((e) => e.id === group.exerciseId);
                        if (ex) {
                          setCurrentExercise(ex);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isCurrentExercise ? "bg-primary text-white" : "bg-bg-tertiary text-text-tertiary"}`}>
                        <svg
                          className={`h-4 w-4 transition-transform ${isCurrentExercise ? "rotate-90" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span className={`font-bold ${isCurrentExercise ? "text-primary" : "text-text-primary"}`}>{group.exerciseName}</span>
                    </div>
                    <span className="text-sm font-medium text-text-secondary bg-bg-tertiary px-2 py-1 rounded-md">
                      {group.sets.length} 组
                    </span>
                  </button>
                  {isCurrentExercise && (
                    <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary/20 ml-4">
                      {group.sets.map((set) => (
                        <SetRow
                          key={set.id}
                          set={set}
                          onDelete={handleDeleteSet}
                          onEdit={handleEditOpen}
                          onViewNote={(s) => setViewingNote(s)}
                          onViewPhoto={(s) => setViewingPhoto(s)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {sets.length > 0 && (
        <section className="card relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 relative z-10">
          今日总览
        </p>
        <div className="grid grid-cols-3 gap-4 text-center relative z-10">
          <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-text-secondary">部位</p>
            <p className="mt-2 text-sm font-bold text-text-primary truncate">{todaySummary.bodyLabel}</p>
          </div>
          <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-text-secondary">动作</p>
            <p className="mt-1 text-2xl font-black text-gradient">{todaySummary.exerciseCount}</p>
          </div>
          <div className="rounded-2xl bg-bg-tertiary/40 border border-border-primary p-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-text-secondary">组数</p>
            <p className="mt-1 text-2xl font-black text-gradient">{todaySummary.setCount}</p>
          </div>
        </div>
        </section>
      )}

      {sets.length > 0 && (
        <button
          className="btn btn-primary w-full text-lg font-bold h-14 shadow-lg shadow-primary/30"
          type="button"
          onClick={handleFinishWorkout}
        >
          ✨ 训练完成
        </button>
      )}

      {isResting && (
        <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom)+16px)] z-40 px-4">
          <RestTimer
            key={restKey}
            duration={restDuration}
            onComplete={() => setIsResting(false)}
            onSkip={() => setIsResting(false)}
          />
        </div>
      )}

      <BottomSheet
        isOpen={showExercisePicker}
        title="选择动作"
        onClose={() => {
          setShowExercisePicker(false);
          setPickerInitialBodyPart(null);
        }}
      >
        <ExercisePicker
          initialBodyPart={pickerInitialBodyPart ?? currentExercise?.body_part ?? null}
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
              <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                编辑记录
              </p>
              <h3 className="text-lg font-bold text-text-primary">
                {editingSet?.exercise_name ?? "当前动作"}
              </h3>
              <p className="text-sm text-text-secondary">第 {editingSet?.set_number} 组</p>
            </div>
            <button
              className="btn-ghost min-h-[36px] px-3 py-1.5 text-sm font-semibold"
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
              <NumberPicker
                label="重量"
                value={editWeight}
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={2.5}
                precision={2}
                unit="kg"
                onChange={setEditWeight}
              />
              <NumberPicker
                label="次数"
                value={editReps}
                min={REPS_MIN}
                max={REPS_MAX}
                step={1}
                unit="次"
                onChange={setEditReps}
              />
            </div>
          )}

          <RPESelector value={editRpe} onChange={setEditRpe} compact />

          <SetNoteInput value={editNotes} onChange={setEditNotes} compact />

          {editError && <p className="text-sm text-danger">{editError}</p>}

          <button
            className="btn btn-primary w-full"
            type="button"
            disabled={editLoading}
            onClick={handleEditSave}
          >
            {editLoading ? "保存中..." : "保存修改"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(viewingNote)} onClose={() => setViewingNote(null)}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              训练笔记
            </p>
            <h3 className="text-lg font-bold text-text-primary">
              {viewingNote?.exercise_name ?? "当前动作"}
            </h3>
            <p className="text-sm text-text-secondary">第 {viewingNote?.set_number} 组</p>
          </div>
          <div className="rounded-lg bg-bg-secondary p-4">
            <p className="text-text-primary whitespace-pre-wrap">{viewingNote?.notes}</p>
          </div>
          <button
            className="btn btn-secondary w-full"
            type="button"
            onClick={() => setViewingNote(null)}
          >
            关闭
          </button>
        </div>
      </Modal>

      <Modal isOpen={Boolean(viewingPhoto)} onClose={() => setViewingPhoto(null)}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
              训练照片
            </p>
            <h3 className="text-lg font-bold text-text-primary">
              {viewingPhoto?.exercise_name ?? "当前动作"}
            </h3>
            <p className="text-sm text-text-secondary">第 {viewingPhoto?.set_number} 组</p>
          </div>
          {viewingPhoto?.photo_url && (
            <img
              src={supabase.storage.from("workout-photos").getPublicUrl(viewingPhoto.photo_url).data?.publicUrl}
              alt="训练照片"
              className="w-full rounded-lg"
            />
          )}
          <button
            className="btn btn-secondary w-full"
            type="button"
            onClick={() => setViewingPhoto(null)}
          >
            关闭
          </button>
        </div>
      </Modal>

      <OnboardingModal />
    </div>
  );
}
