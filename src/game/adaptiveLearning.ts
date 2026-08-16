type AdaptiveLearningRun = {
  correct?: boolean;
  confidence?: number;
};

export function deriveAdaptiveModifiers(runs: AdaptiveLearningRun[]) {
  if (!runs || runs.length === 0) return null;

  const recent = runs.slice(-20);

  const accuracy =
    recent.filter((run) => run.correct).length / recent.length;

  const avgConfidence =
    recent.reduce((total, run) => total + (run.confidence || 0), 0) / recent.length;

  const failureRate = 1 - accuracy;

  return {
    confidenceBias: Number((1 + (accuracy - 0.5) * 0.4).toFixed(2)),
    riskPenalty: Number((1 - failureRate * 0.3).toFixed(2)),
    smoothing: Number((0.5 + avgConfidence * 0.2).toFixed(2)),
  };
}
