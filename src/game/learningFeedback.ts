export function applyLearningFeedback({
  credibility,
  advisors,
  correct,
}: {
  credibility: Record<string, number>;
  advisors: any[];
  correct: boolean;
}) {
  const next = { ...(credibility || {}) };

  advisors.forEach((a) => {
    const key = String(a.id || a.name || "").toUpperCase();
    const current = next[key] ?? 1;

    // small, compounding adjustments
    if (correct) {
      next[key] = Math.min(1.5, current + 0.05);
    } else {
      next[key] = Math.max(0.5, current - 0.06);
    }
  });

  return next;
}
