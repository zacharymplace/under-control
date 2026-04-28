export function evaluatePersonaOutcome(prev: any, next: any, persona: any) {
  if (next.state === "FAILED") return "BAD";

  if (persona.name === "ELENA") {
    return next.signalClarity > prev.signalClarity ? "GOOD" : "BAD";
  }

  if (persona.name === "MARA") {
    const integrityProtected = next.integrity >= prev.integrity;
    const driftContained = next.drift <= prev.drift + 4;
    return integrityProtected || driftContained ? "GOOD" : "BAD";
  }

  if (persona.name === "ISHAAN") {
    const avoidedCriticalDrift = next.drift < 55;
    const avoidedCriticalLoad = next.load < 100;
    return avoidedCriticalDrift && avoidedCriticalLoad ? "GOOD" : "BAD";
  }

  return "NEUTRAL";
}

export function evaluateOutcome(prev: any, next: any, action: string) {
  if (next.state === "FAILED") return "BAD";

  if (action === "REROUTE") {
    return next.load < prev.load && next.drift < 55 ? "GOOD" : "BAD";
  }

  if (action === "STABILIZE") {
    return next.integrity > prev.integrity && next.load < 100 ? "GOOD" : "BAD";
  }

  if (action === "OBSERVE") {
    return next.signalClarity > prev.signalClarity && next.load < 100 ? "GOOD" : "BAD";
  }

  return "NEUTRAL";
}
