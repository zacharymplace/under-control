type RunWithActions = {
  actionHistory?: string[];
};

type PlayerProfile = {
  stabilizeBias: number;
  rerouteBias: number;
  observeBias: number;
};

type AdaptiveModifiers = {
  loadPressureMult: number;
  driftPenaltyMult: number;
  signalDecayMult: number;
};

export function derivePlayerProfile(runs: RunWithActions[]): PlayerProfile | null {
  if (!runs.length) return null;

  let stabilize = 0;
  let reroute = 0;
  let observe = 0;

  runs.forEach((run) => {
    (run.actionHistory || []).forEach((action) => {
      if (action === "STABILIZE") stabilize++;
      if (action === "REROUTE") reroute++;
      if (action === "OBSERVE") observe++;
    });
  });

  return {
    stabilizeBias: stabilize,
    rerouteBias: reroute,
    observeBias: observe,
  };
}

export function deriveAdaptiveModifiers(
  profile: PlayerProfile | null
): AdaptiveModifiers {
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

function defaultModifiers(): AdaptiveModifiers {
  return {
    loadPressureMult: 1,
    driftPenaltyMult: 1,
    signalDecayMult: 1,
  };
}
