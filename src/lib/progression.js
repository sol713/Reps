export function calculateProgressionSuggestion(history, settings = {}) {
  const { weightIncrement = 2.5 } = settings;

  if (!history || history.length === 0) {
    return null;
  }

  const normalSets = history.filter((s) => s.set_type === "normal" && s.weight && s.reps);

  if (normalSets.length === 0) {
    return null;
  }

  const recentSets = normalSets.slice(0, 10);
  const lastSet = recentSets[0];

  const avgWeight = recentSets.reduce((sum, s) => sum + s.weight, 0) / recentSets.length;
  const avgReps = recentSets.reduce((sum, s) => sum + s.reps, 0) / recentSets.length;

  const maxWeight = Math.max(...recentSets.map((s) => s.weight));
  const maxReps = Math.max(...recentSets.map((s) => s.reps));

  const isProgressingWeight = recentSets.length >= 3 && 
    recentSets[0].weight >= recentSets[recentSets.length - 1].weight;

  const isHighReps = lastSet.reps >= 12;
  const isMediumReps = lastSet.reps >= 8 && lastSet.reps < 12;
  const isLowReps = lastSet.reps < 8;

  let suggestion = {
    type: "maintain",
    suggestedWeight: lastSet.weight,
    suggestedReps: lastSet.reps,
    reason: "",
    confidence: "medium"
  };

  if (isHighReps && recentSets.slice(0, 3).every((s) => s.reps >= 12)) {
    suggestion = {
      type: "increase_weight",
      suggestedWeight: lastSet.weight + weightIncrement,
      suggestedReps: 8,
      reason: `连续完成 12+ 次，建议加重 ${weightIncrement}kg`,
      confidence: "high"
    };
  } else if (isLowReps && lastSet.reps < 6) {
    suggestion = {
      type: "decrease_weight",
      suggestedWeight: Math.max(lastSet.weight - weightIncrement, weightIncrement),
      suggestedReps: 8,
      reason: "次数偏低，建议减轻重量保证训练质量",
      confidence: "medium"
    };
  } else if (isMediumReps && isProgressingWeight) {
    suggestion = {
      type: "maintain",
      suggestedWeight: lastSet.weight,
      suggestedReps: lastSet.reps + 1,
      reason: "保持当前重量，尝试增加 1 次",
      confidence: "high"
    };
  } else {
    suggestion = {
      type: "maintain",
      suggestedWeight: lastSet.weight,
      suggestedReps: lastSet.reps,
      reason: "保持当前状态，继续积累",
      confidence: "medium"
    };
  }

  return {
    ...suggestion,
    stats: {
      avgWeight: Math.round(avgWeight * 10) / 10,
      avgReps: Math.round(avgReps * 10) / 10,
      maxWeight,
      maxReps,
      totalSets: recentSets.length
    },
    lastSet: {
      weight: lastSet.weight,
      reps: lastSet.reps
    }
  };
}

export function formatSuggestionMessage(suggestion) {
  if (!suggestion) return null;

  const { type, suggestedWeight, suggestedReps, reason } = suggestion;

  const icon = {
    increase_weight: "📈",
    decrease_weight: "📉",
    maintain: "💪"
  }[type];

  return {
    icon,
    primary: `${suggestedWeight}kg × ${suggestedReps}`,
    secondary: reason
  };
}
