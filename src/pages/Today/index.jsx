import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BottomSheet from "../../components/BottomSheet.jsx";
import ExercisePicker from "../../components/ExercisePicker.jsx";
import OnboardingModal from "../../components/OnboardingModal.jsx";
import PRCelebrationModal from "../../components/PRCelebrationModal.jsx";
import QuickActions from "../../components/QuickActions.jsx";
import RestTimer from "../../components/RestTimer.jsx";
import SetCompleteAnimation from "../../components/SetCompleteAnimation.jsx";
import SmartStartCard from "../../components/SmartStartCard.jsx";
import UndoToast from "../../components/UndoToast.jsx";
import WeeklyGoalCard from "../../components/WeeklyGoalCard.jsx";
import WorkoutSuggestions from "../../components/WorkoutSuggestions.jsx";
import WorkoutSummaryCard from "../../components/WorkoutSummaryCard.jsx";

import { bodyParts } from "../../data/bodyParts.js";
import { getTodayIsoDate, getYesterdayIsoDate } from "../../lib/date.js";
import { hapticFeedback } from "../../lib/haptics.js";
import { normalizeSets } from "../../lib/sets.js";
import { calculateWorkoutStats } from "../../lib/stats.js";
import { supabase } from "../../lib/supabase.js";

import { useAuth } from "../../hooks/useAuth.jsx";
import { useExercises } from "../../hooks/useExercises.js";
import { usePRDetector } from "../../hooks/usePRDetector.js";
import { useStreak } from "../../hooks/useStreak.js";
import { useSmartSuggestion } from "../../hooks/useSmartSuggestion.js";
import { useUndoToast } from "../../hooks/useUndoToast.js";
import { useWorkout } from "../../hooks/useWorkout.js";

import { WEIGHT, REPS, REST, clampWeight, clampReps, groupSets } from "./constants.js";
import { useSetEdit } from "./hooks/useSetEdit.js";
import { useExerciseQueue } from "./hooks/useExerciseQueue.js";

import TodayHeader from "./components/TodayHeader.jsx";
import TodaySummary from "./components/TodaySummary.jsx";
import CompletedSets from "./components/CompletedSets.jsx";
import ExerciseInput from "./components/ExerciseInput.jsx";
import EditSetModal from "./components/EditSetModal.jsx";
import { ViewNoteModal, ViewPhotoModal } from "./components/ViewModals.jsx";

export default function Today() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [currentExercise, setCurrentExercise] = useState(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [weight, setWeight] = useState(WEIGHT.DEFAULT);
  const [reps, setReps] = useState(REPS.DEFAULT);
  const [setType, setSetType] = useState("normal");
  const [segments, setSegments] = useState([{ weight: WEIGHT.DEFAULT, reps: REPS.DEFAULT }]);
  const [isResting, setIsResting] = useState(false);
  const [restKey, setRestKey] = useState(0);
  const [restDuration, setRestDuration] = useState(REST.DEFAULT);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [yesterdayStats, setYesterdayStats] = useState(undefined);
  const [sessionPRs, setSessionPRs] = useState([]);
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

  const {
    activeTemplate,
    setActiveTemplate,
    templateExerciseIndex,
    setTemplateExerciseIndex,
    exerciseQueue,
    setExerciseQueue,
    queueIndex,
    setQueueIndex,
    handleNextTemplateExercise,
    handleNextQueueExercise,
    resetQueue
  } = useExerciseQueue();

  const {
    editingSet,
    editWeight,
    setEditWeight,
    editReps,
    setEditReps,
    editSegments,
    setEditSegments,
    editRpe,
    setEditRpe,
    editNotes,
    setEditNotes,
    editError,
    editLoading,
    handleEditOpen,
    handleEditClose,
    handleEditSave
  } = useSetEdit({ updateSet });

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
  }, [location.state, activeTemplate, startWorkout, navigate, location.pathname, setActiveTemplate, setTemplateExerciseIndex]);

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
      if (!isActive) return;
      setExerciseHistory(history);
      setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [currentExercise, getExerciseHistory, sets.length]);

  useEffect(() => {
    if (!currentExercise || exerciseHistory.length === 0) return;
    const latest = exerciseHistory[0];
    if (latest.set_type === "normal") {
      setWeight(clampWeight(latest.weight ?? WEIGHT.DEFAULT));
      setReps(clampReps(latest.reps ?? REPS.DEFAULT));
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
      if (!user || !showSummary) return;

      setYesterdayStats(undefined);
      const yesterday = getYesterdayIsoDate();
      const { data, error } = await supabase
        .from("workout_logs")
        .select(
          "id,date,workout_sets(id,exercise_id,set_number,set_type,weight,reps,segments,created_at,exercises(name,body_part))"
        )
        .eq("date", yesterday)
        .maybeSingle();

      if (!isActive) return;

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
    if (!currentExercise || workoutLoading) return;
    
    const startRestTimer = () => {
      setIsResting(true);
      setRestKey(Date.now());
    };
    
    if (setType === "normal") {
      const safeWeight = clampWeight(weight);
      const safeReps = clampReps(reps);
      if (safeWeight !== weight) setWeight(safeWeight);
      if (safeReps !== reps) setReps(safeReps);
      if (safeReps < REPS.MIN || safeWeight < WEIGHT.MIN) return;
      
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
      
      if (!result) return;
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
      if (pr) setSessionPRs((prev) => [pr, ...prev]);
    } else {
      const normalizedSegments = segments
        .map((segment) => ({
          weight: clampWeight(segment.weight),
          reps: clampReps(segment.reps)
        }))
        .filter((segment) => Number.isFinite(segment.weight) && Number.isFinite(segment.reps));
      if (normalizedSegments.length === 0) return;
      
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
      
      if (!result) return;
      setRpe(null);
      setSetNotes("");
      setPhotoPath(null);
      setShowComplete(true);
    }
  };

  const handleQuickRecord = async (quickWeight, quickReps) => {
    if (!currentExercise || workoutLoading) return;
    
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
    
    if (!result) return;
    
    setWeight(safeWeight);
    setReps(safeReps);
    setShowComplete(true);
    
    const pr = await checkForPR({
      exerciseId: result.exercise_id,
      weight: result.weight,
      setId: result.id,
      exerciseName: result.exercise_name
    });
    
    if (pr) setSessionPRs((prev) => [pr, ...prev]);
  };

  const handleFinishWorkout = async () => {
    await endWorkout();
    setShowSummary(true);
    resetQueue();
  };

  const handleDeleteSet = (setId) => {
    const index = sets.findIndex((set) => set.id === setId);
    if (index < 0) return;

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
      if (!deleted) restoreLocalSet(removedSet, index);
      deleteTimersRef.current.delete(setId);
    }, 4500);

    deleteTimersRef.current.set(setId, timerId);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-4 pb-tab-bar pt-6">
      <TodayHeader
        today={today}
        activeTemplate={activeTemplate}
        exerciseQueue={exerciseQueue}
        queueIndex={queueIndex}
        templateExerciseIndex={templateExerciseIndex}
        todayLog={todayLog}
        getWorkoutDuration={getWorkoutDuration}
        streak={streak}
      />

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

      <ExerciseInput
        currentExercise={currentExercise}
        weight={weight}
        setWeight={setWeight}
        reps={reps}
        setReps={setReps}
        setType={setType}
        setSetType={setSetType}
        segments={segments}
        setSegments={setSegments}
        rpe={rpe}
        setRpe={setRpe}
        setNotes={setNotes}
        setSetNotes={setSetNotes}
        photoPath={photoPath}
        setPhotoPath={setPhotoPath}
        exerciseHistory={exerciseHistory}
        historyLoading={historyLoading}
        workoutLoading={workoutLoading}
        onRecordSet={handleRecordSet}
        onQuickRecord={handleQuickRecord}
        activeTemplate={activeTemplate}
        templateExerciseIndex={templateExerciseIndex}
        exerciseQueue={exerciseQueue}
        queueIndex={queueIndex}
        onNextTemplateExercise={() => handleNextTemplateExercise(setCurrentExercise, setWeight, setReps, setRestDuration)}
        onNextQueueExercise={() => handleNextQueueExercise(setCurrentExercise, setWeight, setReps)}
      />

      <CompletedSets
        sets={sets}
        groups={todayGroups}
        currentExercise={currentExercise}
        exercises={exercises}
        loading={workoutLoading}
        error={workoutError}
        onSelectExercise={setCurrentExercise}
        onDeleteSet={handleDeleteSet}
        onEditSet={handleEditOpen}
        onViewNote={setViewingNote}
        onViewPhoto={setViewingPhoto}
      />

      {sets.length > 0 && <TodaySummary summary={todaySummary} />}

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

      <EditSetModal
        editingSet={editingSet}
        editWeight={editWeight}
        setEditWeight={setEditWeight}
        editReps={editReps}
        setEditReps={setEditReps}
        editSegments={editSegments}
        setEditSegments={setEditSegments}
        editRpe={editRpe}
        setEditRpe={setEditRpe}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        editError={editError}
        editLoading={editLoading}
        onClose={handleEditClose}
        onSave={handleEditSave}
        clampWeight={clampWeight}
        clampReps={clampReps}
      />

      <ViewNoteModal viewingNote={viewingNote} onClose={() => setViewingNote(null)} />
      <ViewPhotoModal viewingPhoto={viewingPhoto} onClose={() => setViewingPhoto(null)} />

      <OnboardingModal />
    </div>
  );
}
