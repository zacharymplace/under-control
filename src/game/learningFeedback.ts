type LearningFeedbackAdvisor = {
  id?: string;
  name?: string;
};

export function applyLearningFeedback({
  credibility,
  advisors,
  correct,
}: {
  credibility: Record<string, number>;
  advisors: LearningFeedbackAdvisor[];
  correct: boolean;
}) {
  const next = { ...(credibility || {}) };

  advisors.forEach((advisor) => {
    const key = (advisor.id || advisor.name || "").toUpperCase();
    const current = next[key] ?? 1;

    if (correct) {
      next[key] = Math.min(1.5, current + 0.05);
    } else {
      next[key] = Math.max(0.5, current - 0.06);
    }
  });

  return next;
}
