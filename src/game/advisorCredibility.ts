export type AdvisorCredibilityMap = Record<string, number>;

type AdvisorCredibilityCandidate = {
  id?: string | number | null;
  name?: string | number | null;
  label?: string | number | null;
  suggests?: string | null;
  action?: string | null;
  suggestion?: string | null;
  [key: string]: unknown;
};

function advisorKey(advisor: AdvisorCredibilityCandidate) {
  return String(advisor.id || advisor.name || advisor.label || "").toUpperCase();
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createInitialAdvisorCredibility(advisors: AdvisorCredibilityCandidate[]): AdvisorCredibilityMap {
  const map: AdvisorCredibilityMap = {};

  for (const advisor of advisors) {
    const key = advisorKey(advisor);
    if (key) map[key] = 0.5;
  }

  return map;
}

export function getAdvisorCredibility(advisor: AdvisorCredibilityCandidate, credibility: AdvisorCredibilityMap = {}) {
  const key = advisorKey(advisor);
  return credibility[key] ?? 0.5;
}

export function updateAdvisorCredibility({
  previous = {},
  advisors = [],
  finalAction,
  judgment,
}: {
  previous?: AdvisorCredibilityMap;
  advisors: AdvisorCredibilityCandidate[];
  finalAction: string;
  judgment?: string | null;
}) {
  const next = { ...previous };

  const judgmentText = String(judgment || "").toLowerCase();
  const good =
    judgmentText.includes("good") ||
    judgmentText.includes("correct") ||
    judgmentText.includes("aligned") ||
    judgmentText.includes("effective");

  const bad =
    judgmentText.includes("poor") ||
    judgmentText.includes("wrong") ||
    judgmentText.includes("misaligned") ||
    judgmentText.includes("late") ||
    judgmentText.includes("risk");

  for (const advisor of advisors) {
    const key = advisorKey(advisor);
    if (!key) continue;

    const suggestion = advisor.suggests || advisor.action || advisor.suggestion;
    const aligned = suggestion === finalAction;

    const current = next[key] ?? 0.5;
    let target = current;

    if (aligned && good) target = current + 0.06;
    else if (aligned && bad) target = current - 0.06;
    else if (!aligned && good) target = current - 0.025;
    else if (!aligned && bad) target = current + 0.025;

    next[key] = Number(clamp01(target).toFixed(2));
  }

  return next;
}
