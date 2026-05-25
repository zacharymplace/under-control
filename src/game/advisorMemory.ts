export type AdvisorMemory = {
  trustDelta: number;
  ignoredCount: number;
  correctCalls: number;
  incorrectCalls: number;
  stressLevel: number;
};

export type AdvisorMemoryMap = Record<string, AdvisorMemory>;

export function createInitialAdvisorMemory(): AdvisorMemoryMap {
  return {
    ELENA: { trustDelta: 0, ignoredCount: 0, correctCalls: 0, incorrectCalls: 0, stressLevel: 0 },
    MARA: { trustDelta: 0, ignoredCount: 0, correctCalls: 0, incorrectCalls: 0, stressLevel: 0 },
    ISHAAN: { trustDelta: 0, ignoredCount: 0, correctCalls: 0, incorrectCalls: 0, stressLevel: 0 },
  };
}

export function normalizeAdvisorMemory(
  memory: Partial<AdvisorMemoryMap> | null | undefined
): AdvisorMemoryMap {
  const normalized = createInitialAdvisorMemory();

  if (!memory) return normalized;

  for (const [name, value] of Object.entries(memory)) {
    if (value) {
      normalized[name] = value;
    }
  }

  return normalized;
}

export function getAdvisorMemoryNote(
  name: string,
  memory: Partial<AdvisorMemoryMap> | null | undefined
) {
  const m = normalizeAdvisorMemory(memory)[name.toUpperCase()];
  if (!m) return null;

  if (m.ignoredCount >= 5) return "Memory: influence degraded by repeated ignored guidance.";
  if (m.stressLevel >= 3) return "Memory: stress is shaping future recommendations.";
  if (m.correctCalls >= 3) return "Memory: recent calls have been reinforced.";
  if (m.incorrectCalls >= 3) return "Memory: reliability is under review.";

  return null;
}
