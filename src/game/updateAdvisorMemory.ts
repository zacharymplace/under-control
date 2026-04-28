import { AdvisorMemoryMap, normalizeAdvisorMemory } from "./advisorMemory";

export function classifyJudgment(judgment: string | null) {
  if (!judgment) return "neutral";

  const lower = judgment.toLowerCase();

  if (lower.includes("good") || lower.includes("valid") || lower.includes("maintained")) {
    return "good";
  }

  if (lower.includes("risky") || lower.includes("costly") || lower.includes("weak") || lower.includes("inefficient")) {
    return "bad";
  }

  return "neutral";
}

export function updateAdvisorMemory({
  memory,
  advisors,
  action,
  judgment,
}: {
  memory?: AdvisorMemoryMap;
  advisors: any[];
  action: string;
  judgment: string | null;
}): AdvisorMemoryMap {
  const next = normalizeAdvisorMemory(memory);
  const kind = classifyJudgment(judgment);

  advisors.forEach((advisor) => {
    const key = (advisor.name || "").toUpperCase();
    if (!key || !next[key]) return;

    const suggestion = advisor.suggests || advisor.action || advisor.suggestion || "UNKNOWN";
    const followed = suggestion === action;
    const m = { ...next[key] };

    if (followed) {
      m.trustDelta += 1;
    } else {
      m.trustDelta -= 1;
      m.ignoredCount += 1;
    }

    if (kind === "good") {
      if (followed) m.correctCalls += 1;
      else m.incorrectCalls += 1;
      m.stressLevel = Math.max(0, m.stressLevel - 1);
    }

    if (kind === "bad") {
      if (followed) m.incorrectCalls += 1;
      else m.correctCalls += 1;
      m.stressLevel += 1;
    }

    if (kind === "neutral") {
      m.stressLevel = Math.max(0, m.stressLevel - 1);
    }

    next[key] = m;
  });

  return next;
}
