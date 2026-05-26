type PlayerTakeawayInput = {
  runArc?: {
    mid?: string;
    late?: string;
  } | null;
  failureDriver?: string | null;
};

export function buildPlayerTakeaway({ runArc, failureDriver }: PlayerTakeawayInput) {
  if (!runArc || !failureDriver) return null;

  if (runArc.late === "Drift dominance") {
    return "You reduced load, but instability compounded faster than recovery.";
  }

  if (runArc.mid === "Pressure accumulating") {
    return "You allowed pressure to build without creating release capacity.";
  }

  if (failureDriver.includes("Load reached capacity")) {
    return "You protected structure, but failed to relieve pressure in time.";
  }

  return "Your actions were locally correct, but failed at system scale.";
}
