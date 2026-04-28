export function evaluateOutcome(prev: any, next: any, action: string) {
  const terminalFailure = next.state === "FAILED";

  if (terminalFailure) return "BAD";

  if (action === "REROUTE") {
    const loadImproved = next.load < prev.load;
    const driftNotCritical = next.drift < 55;
    return loadImproved && driftNotCritical ? "GOOD" : "BAD";
  }

  if (action === "STABILIZE") {
    const integrityImproved = next.integrity > prev.integrity;
    const driftImprovedOrStable = next.drift <= prev.drift + 1;
    const loadNotCritical = next.load < 100;
    return integrityImproved && driftImprovedOrStable && loadNotCritical
      ? "GOOD"
      : "BAD";
  }

  if (action === "OBSERVE") {
    const signalImproved = next.signalClarity > prev.signalClarity;
    const loadNotCritical = next.load < 100;
    return signalImproved && loadNotCritical ? "GOOD" : "BAD";
  }

  return "NEUTRAL";
}
