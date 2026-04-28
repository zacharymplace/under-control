export function getActionJudgment(action: string, before: any, after: any) {
  const driftUp = (after.drift ?? 0) > (before.drift ?? 0);
  const loadUp = (after.load ?? 0) > (before.load ?? 0);
  const integrityDown = (after.integrity ?? 0) < (before.integrity ?? 0);

  // simple heuristics (tight, not overfit)
  if (action === "STABILIZE") {
    if (!driftUp && !integrityDown) {
      return "Good call. You reduced instability without sacrificing structure.";
    }
    if (loadUp) {
      return "Mixed result. Structure improved, but pressure is building.";
    }
    return "Weak stabilize. The system is not actually becoming safer.";
  }

  if (action === "REROUTE") {
    if (!loadUp && driftUp) {
      return "Risky trade. You relieved load but increased hidden instability.";
    }
    if (!loadUp && !driftUp) {
      return "Good reroute. Load dropped without destabilizing the system.";
    }
    return "Inefficient reroute. Pressure is not meaningfully reduced.";
  }

  if (action === "OBSERVE") {
    if (!loadUp && !driftUp) {
      return "Valid pause. You gained clarity without worsening the system.";
    }
    return "Costly hesitation. The system degraded while you waited.";
  }

  return null;
}
