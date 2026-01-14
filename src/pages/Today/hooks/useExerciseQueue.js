import { useState } from "react";
import { clampWeight, clampReps } from "../constants.js";
import { hapticFeedback } from "../../../lib/haptics.js";

export function useExerciseQueue() {
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templateExerciseIndex, setTemplateExerciseIndex] = useState(0);
  const [exerciseQueue, setExerciseQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const handleNextTemplateExercise = (setCurrentExercise, setWeight, setReps, setRestDuration) => {
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

  const handleNextQueueExercise = (setCurrentExercise, setWeight, setReps) => {
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

  const resetQueue = () => {
    setActiveTemplate(null);
    setExerciseQueue([]);
    setQueueIndex(0);
  };

  return {
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
  };
}
