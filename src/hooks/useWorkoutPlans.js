import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "./useAuth.jsx";

export function useWorkoutPlans(startDate, endDate) {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlans = useCallback(async () => {
    if (!user || !startDate || !endDate) {
      setPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("workout_plans")
      .select("id, template_id, planned_date, completed, notes, workout_templates(id, name, color)")
      .gte("planned_date", startDate)
      .lte("planned_date", endDate)
      .order("planned_date", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const normalized = (data || []).map((plan) => ({
      id: plan.id,
      templateId: plan.template_id,
      templateName: plan.workout_templates?.name || "未知模板",
      templateColor: plan.workout_templates?.color || "#8b5cf6",
      plannedDate: plan.planned_date,
      completed: plan.completed,
      notes: plan.notes
    }));

    setPlans(normalized);
    setLoading(false);
  }, [user, startDate, endDate]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const addPlan = async (templateId, plannedDate, notes = "") => {
    if (!user || !templateId || !plannedDate) return null;

    const { data, error: insertError } = await supabase
      .from("workout_plans")
      .insert({
        user_id: user.id,
        template_id: templateId,
        planned_date: plannedDate,
        notes
      })
      .select("id, template_id, planned_date, completed, notes, workout_templates(id, name, color)")
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }

    const newPlan = {
      id: data.id,
      templateId: data.template_id,
      templateName: data.workout_templates?.name || "未知模板",
      templateColor: data.workout_templates?.color || "#8b5cf6",
      plannedDate: data.planned_date,
      completed: data.completed,
      notes: data.notes
    };

    setPlans((prev) => [...prev, newPlan].sort((a, b) => a.plannedDate.localeCompare(b.plannedDate)));
    return newPlan;
  };

  const deletePlan = async (planId) => {
    const { error: deleteError } = await supabase
      .from("workout_plans")
      .delete()
      .eq("id", planId);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setPlans((prev) => prev.filter((p) => p.id !== planId));
    return true;
  };

  const toggleComplete = async (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return false;

    const { error: updateError } = await supabase
      .from("workout_plans")
      .update({ completed: !plan.completed })
      .eq("id", planId);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, completed: !p.completed } : p))
    );
    return true;
  };

  const getPlansByDate = useCallback(
    (date) => {
      return plans.filter((p) => p.plannedDate === date);
    },
    [plans]
  );

  return {
    plans,
    loading,
    error,
    addPlan,
    deletePlan,
    toggleComplete,
    getPlansByDate,
    refresh: fetchPlans
  };
}
