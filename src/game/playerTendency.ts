export type PlayerTendencyProfile = {
  observeCount: number;
  stabilizeCount: number;
  rerouteCount: number;
  lateStabilizeCount: number;
  ignoredRiskCount: number;
  pressureDelayCount: number;
};

export function getInitialPlayerTendency(): PlayerTendencyProfile {
  return {
    observeCount: 0,
    stabilizeCount: 0,
    rerouteCount: 0,
    lateStabilizeCount: 0,
    ignoredRiskCount: 0,
    pressureDelayCount: 0,
  };
}

export function updatePlayerTendency(
  profile: PlayerTendencyProfile | undefined,
  game: any,
  action: string
): PlayerTendencyProfile {
  const next = profile ? { ...profile } : getInitialPlayerTendency();

  if (action === "OBSERVE") next.observeCount += 1;
  if (action === "STABILIZE") next.stabilizeCount += 1;
  if (action === "REROUTE") next.rerouteCount += 1;

  if ((game.drift ?? 0) >= 50 && action !== "STABILIZE") {
    next.lateStabilizeCount += 1;
  }

  if ((game.drift ?? 0) >= 45 && action === "OBSERVE") {
    next.ignoredRiskCount += 1;
  }

  if ((game.load ?? 0) >= 85 && action !== "REROUTE") {
    next.pressureDelayCount += 1;
  }

  return next;
}

export function getPlayerTendency(profile?: PlayerTendencyProfile | null) {
  if (!profile) {
    return {
      label: "Unformed",
      description: "Not enough decisions have been made yet.",
    };
  }

  if (profile.pressureDelayCount >= 3) {
    return {
      label: "Pressure Delayer",
      description: "You tend to wait too long before releasing load pressure.",
    };
  }

  if (profile.lateStabilizeCount >= 3) {
    return {
      label: "Late Stabilizer",
      description: "You tend to let drift compound before correcting it.",
    };
  }

  if (profile.observeCount >= 4) {
    return {
      label: "Signal Seeker",
      description: "You tend to seek clarity while pressure keeps moving.",
    };
  }

  if (profile.stabilizeCount >= 4) {
    return {
      label: "Structure Bias",
      description: "You tend to preserve structure even when pressure needs release.",
    };
  }

  if (profile.rerouteCount >= 4) {
    return {
      label: "Pressure Reliever",
      description: "You tend to release load quickly, even when instability may rise.",
    };
  }

  return {
    label: "Balanced Operator",
    description: "Your action pattern is still relatively balanced.",
  };
}
