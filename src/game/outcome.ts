type OutcomeState = {
  state?: string;
  signalClarity?: number;
  integrity?: number;
  drift?: number;
  load?: number;
};

type OutcomePersona = {
  name?: string;
};

export function evaluatePersonaOutcome(
  prev: OutcomeState,
  next: OutcomeState,
  persona: OutcomePersona
) {
  if (next.state === "FAILED") return "BAD";

  if (persona.name === "ELENA") {
    return (next.signalClarity ?? 0) > (prev.signalClarity ?? 0) ? "GOOD" : "BAD";
  }

  if (persona.name === "MARA") {
    const integrityProtected = (next.integrity ?? 0) >= (prev.integrity ?? 0);
    const driftContained = (next.drift ?? 0) <= (prev.drift ?? 0) + 4;
    return integrityProtected || driftContained ? "GOOD" : "BAD";
  }

  if (persona.name === "ISHAAN") {
    const avoidedCriticalDrift = (next.drift ?? 0) < 55;
    const avoidedCriticalLoad = (next.load ?? 0) < 100;
    return avoidedCriticalDrift && avoidedCriticalLoad ? "GOOD" : "BAD";
  }

  return "NEUTRAL";
}

export function evaluateOutcome(
  prev: OutcomeState,
  next: OutcomeState,
  action: string
) {
  if (next.state === "FAILED") return "BAD";

  if (action === "REROUTE") {
    return (next.load ?? 0) < (prev.load ?? 0) && (next.drift ?? 0) < 55
      ? "GOOD"
      : "BAD";
  }

  if (action === "STABILIZE") {
    return (next.integrity ?? 0) > (prev.integrity ?? 0) && (next.load ?? 0) < 100
      ? "GOOD"
      : "BAD";
  }

  if (action === "OBSERVE") {
    return (next.signalClarity ?? 0) > (prev.signalClarity ?? 0) && (next.load ?? 0) < 100
      ? "GOOD"
      : "BAD";
  }

  return "NEUTRAL";
}
