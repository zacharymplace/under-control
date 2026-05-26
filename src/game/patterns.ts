export type PatternType =
  | "STABILITY_ILLUSION"
  | "TIMING_FAILURE"
  | "PRESSURE_FAILURE"
  | "CONTROL_FAILURE"
  | "SIGNAL_FAILURE";

export type Pattern = {
  type: PatternType;
  label: string;
  description: string;
  turns: number[];
};

type PatternLogEntry = {
  action?: string;
  drift?: number;
  integrity?: number;
};

export function buildPatterns(log: PatternLogEntry[]): Pattern[] {
  if (!log || log.length < 2) return [];

  const patterns: Pattern[] = [];

  let stabilityLoop = 0;
  let observationLoop = 0;

  for (let i = 1; i < log.length; i++) {
    const prev = log[i - 1];
    const curr = log[i];

    const driftUp = (curr.drift ?? 0) > (prev.drift ?? 0);
    const integrityUp = (curr.integrity ?? 0) > (prev.integrity ?? 0);
    const action = curr.action;

    if (action === "STABILIZE" && integrityUp && driftUp) {
      stabilityLoop++;
    }

    if (action === "OBSERVE" && driftUp) {
      observationLoop++;
    }
  }

  if (stabilityLoop >= 2) {
    patterns.push({
      type: "STABILITY_ILLUSION",
      label: "False Stability Loop",
      description:
        "Stabilization improved integrity while drift continued accelerating.",
      turns: [],
    });
  }

  if (observationLoop >= 2) {
    patterns.push({
      type: "TIMING_FAILURE",
      label: "Repeated Observation Loop",
      description:
        "Observation improved signal while pressure continued rising without action.",
      turns: [],
    });
  }

  return patterns;
}
