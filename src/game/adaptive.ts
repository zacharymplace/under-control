export function derivePlayerProfile(runs: any[]) {
  if (!runs.length) return null;

  let stabilize = 0;
  let reroute = 0;
  let observe = 0;

  runs.forEach((run) => {
    (run.actionHistory || []).forEach((a: string) => {
      if (a === "STABILIZE") stabilize++;
      if (a === "REROUTE") reroute++;
      if (a === "OBSERVE") observe++;
    });
  });

  return {
    stabilizeBias: stabilize,
    rerouteBias: reroute,
    observeBias: observe,
  };
}

export function deriveAdaptiveModifiers(profile: any) {
  if (!profile) return defaultModifiers();

  const total =
    profile.stabilizeBias +
    profile.rerouteBias +
    profile.observeBias;

  if (total === 0) return defaultModifiers();

  const stabilizeRatio = profile.stabilizeBias / total;
  const rerouteRatio = profile.rerouteBias / total;
  const observeRatio = profile.observeBias / total;

  return {
    loadPressureMult: 1 + stabilizeRatio * 0.4,
    driftPenaltyMult: 1 + rerouteRatio * 0.4,
    signalDecayMult: 1 + (1 - observeRatio) * 0.4,
  };
}

function defaultModifiers() {
  return {
    loadPressureMult: 1,
    driftPenaltyMult: 1,
    signalDecayMult: 1,
  };
}
