import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";
import { presetTemplates } from "../data/presetTemplates.js";

const TEMPLATE_SELECT = `
  id,
  name,
  description,
  color,
  is_archived,
  created_at,
  updated_at,
  template_exercises(
    id,
    exercise_id,
    order_index,
    target_sets,
    target_reps_min,
    target_reps_max,
    target_weight,
    rest_seconds,
    notes,
    exercises(id,name,body_part)
  )
`;

function normalizeTemplate(template) {
  if (!template) return null;
  
  const exercises = (template.template_exercises ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((te) => ({
      id: te.id,
      exerciseId: te.exercise_id,
      exerciseName: te.exercises?.name ?? "",
      bodyPart: te.exercises?.body_part ?? "",
      orderIndex: te.order_index,
      targetSets: te.target_sets ?? 3,
      targetRepsMin: te.target_reps_min ?? 8,
      targetRepsMax: te.target_reps_max ?? 12,
      targetWeight: te.target_weight,
      restSeconds: te.rest_seconds ?? 90,
      notes: te.notes ?? ""
    }));

  return {
    id: template.id,
    name: template.name,
    description: template.description ?? "",
    color: template.color ?? "#0A84FF",
    isArchived: template.is_archived ?? false,
    createdAt: template.created_at,
    updatedAt: template.updated_at,
    exercises
  };
}

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTemplates = useCallback(async () => {
    if (!user) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("workout_templates")
      .select(TEMPLATE_SELECT)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTemplates((data ?? []).map(normalizeTemplate));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const getTemplate = useCallback(async (templateId) => {
    if (!templateId) return null;

    const { data, error: fetchError } = await supabase
      .from("workout_templates")
      .select(TEMPLATE_SELECT)
      .eq("id", templateId)
      .single();

    if (fetchError) {
      setError(fetchError.message);
      return null;
    }

    return normalizeTemplate(data);
  }, []);

  const createTemplate = useCallback(async ({ name, description, color, exercises }) => {
    if (!user || !name) return null;

    const { data: template, error: createError } = await supabase
      .from("workout_templates")
      .insert({
        user_id: user.id,
        name,
        description: description ?? "",
        color: color ?? "#0A84FF"
      })
      .select("id")
      .single();

    if (createError) {
      setError(createError.message);
      return null;
    }

    if (exercises?.length > 0) {
      const exerciseRows = exercises.map((ex, index) => ({
        template_id: template.id,
        exercise_id: ex.exerciseId,
        order_index: index,
        target_sets: ex.targetSets ?? 3,
        target_reps_min: ex.targetRepsMin ?? 8,
        target_reps_max: ex.targetRepsMax ?? 12,
        target_weight: ex.targetWeight ?? null,
        rest_seconds: ex.restSeconds ?? 90,
        notes: ex.notes ?? ""
      }));

      const { error: insertError } = await supabase
        .from("template_exercises")
        .insert(exerciseRows);

      if (insertError) {
        setError(insertError.message);
        return null;
      }
    }

    await fetchTemplates();
    return template.id;
  }, [user, fetchTemplates]);

  const updateTemplate = useCallback(async (templateId, { name, description, color, exercises }) => {
    if (!templateId) return false;

    const { error: updateError } = await supabase
      .from("workout_templates")
      .update({
        name,
        description: description ?? "",
        color: color ?? "#0A84FF"
      })
      .eq("id", templateId);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    if (exercises !== undefined) {
      const { error: deleteError } = await supabase
        .from("template_exercises")
        .delete()
        .eq("template_id", templateId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      if (exercises.length > 0) {
        const exerciseRows = exercises.map((ex, index) => ({
          template_id: templateId,
          exercise_id: ex.exerciseId,
          order_index: index,
          target_sets: ex.targetSets ?? 3,
          target_reps_min: ex.targetRepsMin ?? 8,
          target_reps_max: ex.targetRepsMax ?? 12,
          target_weight: ex.targetWeight ?? null,
          rest_seconds: ex.restSeconds ?? 90,
          notes: ex.notes ?? ""
        }));

        const { error: insertError } = await supabase
          .from("template_exercises")
          .insert(exerciseRows);

        if (insertError) {
          setError(insertError.message);
          return false;
        }
      }
    }

    await fetchTemplates();
    return true;
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (templateId) => {
    if (!templateId) return false;

    const { error: deleteError } = await supabase
      .from("workout_templates")
      .delete()
      .eq("id", templateId);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    return true;
  }, []);

  const archiveTemplate = useCallback(async (templateId) => {
    if (!templateId) return false;

    const { error: updateError } = await supabase
      .from("workout_templates")
      .update({ is_archived: true })
      .eq("id", templateId);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    return true;
  }, []);

  const duplicateTemplate = useCallback(async (templateId) => {
    const original = await getTemplate(templateId);
    if (!original) return null;

    return createTemplate({
      name: `${original.name} (副本)`,
      description: original.description,
      color: original.color,
      exercises: original.exercises
    });
  }, [getTemplate, createTemplate]);

  const importPresetTemplates = useCallback(async () => {
    if (!user) return { ok: false, count: 0 };

    const { data: exercises } = await supabase
      .from("exercises")
      .select("id,name,body_part");

    if (!exercises) return { ok: false, count: 0 };

    const exerciseMap = new Map();
    exercises.forEach((ex) => {
      const key = `${ex.name}|${ex.body_part}`;
      exerciseMap.set(key, ex.id);
    });

    let importedCount = 0;

    for (const preset of presetTemplates) {
      const mappedExercises = [];
      const missingExercises = [];

      for (const ex of preset.exercises) {
        const key = `${ex.name}|${ex.bodyPart}`;
        const exerciseId = exerciseMap.get(key);
        
        if (exerciseId) {
          mappedExercises.push({
            exerciseId,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax
          });
        } else {
          missingExercises.push(ex);
        }
      }

      for (const missing of missingExercises) {
        const { data: newEx } = await supabase
          .from("exercises")
          .insert({
            name: missing.name,
            body_part: missing.bodyPart,
            is_preset: false,
            user_id: user.id
          })
          .select("id")
          .single();

        if (newEx) {
          const key = `${missing.name}|${missing.bodyPart}`;
          exerciseMap.set(key, newEx.id);
          mappedExercises.push({
            exerciseId: newEx.id,
            targetSets: missing.targetSets,
            targetRepsMin: missing.targetRepsMin,
            targetRepsMax: missing.targetRepsMax
          });
        }
      }

      if (mappedExercises.length > 0) {
        const result = await createTemplate({
          name: preset.name,
          description: preset.description,
          color: preset.color,
          exercises: mappedExercises
        });
        if (result) importedCount++;
      }
    }

    return { ok: true, count: importedCount };
  }, [user, createTemplate]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    archiveTemplate,
    duplicateTemplate,
    importPresetTemplates
  };
}
