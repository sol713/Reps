import { useState } from "react";
import { clampWeight, clampReps, WEIGHT, REPS } from "../constants.js";

export function useSetEdit({ updateSet }) {
  const [editingSet, setEditingSet] = useState(null);
  const [editWeight, setEditWeight] = useState(WEIGHT.MIN);
  const [editReps, setEditReps] = useState(REPS.MIN);
  const [editSegments, setEditSegments] = useState([]);
  const [editRpe, setEditRpe] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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
        setEditWeight(WEIGHT.MIN);
        setEditReps(REPS.MIN);
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

  return {
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
  };
}
