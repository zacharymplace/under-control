import { getTrajectoryInsight } from "./trajectoryRisk";
import { getNeedNeglectInsight } from "./needNeglect";
import { getCommitmentInsight } from "./commitment";
import { getPointOfNoReturn, getMissedCommitmentWindow } from "./irreversibility";

export function buildRunReplay(game: any) {
  const log = game.actionLog || [];
  if (!log.length) return null;

  const recent = log.slice(-5);

  return recent.map((entry: any) => {
    const before = entry.before || {};
    const after = entry.after || {};

    const loadDelta = (after.load ?? 0) - (before.load ?? 0);
    const driftDelta = (after.drift ?? 0) - (before.drift ?? 0);
    const integrityDelta = (after.integrity ?? 0) - (before.integrity ?? 0);
    const signalDelta =
      (after.signalClarity ?? after.signal ?? 0) -
      (before.signalClarity ?? before.signal ?? 0);

    return {
      turn: entry.turn,
      action: entry.action,
      loadDelta,
      driftDelta,
      integrityDelta,
      signalDelta,
      before,
      after,
      summary: summarizeTurn(entry.action, loadDelta, driftDelta, integrityDelta, signalDelta),
    };
  });
}

function summarizeTurn(
  action: string,
  loadDelta: number,
  driftDelta: number,
  integrityDelta: number,
  signalDelta: number
) {
  if (action === "STABILIZE") {
    if (loadDelta > 0 && driftDelta <= 0) {
      return "Structure improved, but load pressure continued building.";
    }
    return "Stabilization protected structure, but did not fully resolve pressure.";
  }

  if (action === "REROUTE") {
    if (loadDelta < 0 && driftDelta > 0) {
      return "Load dropped, but hidden instability increased.";
    }
    return "Reroute shifted pressure, with mixed downstream effects.";
  }

  if (action === "OBSERVE") {
    if (signalDelta > 0 && (loadDelta > 0 || driftDelta > 0)) {
      return "Signal improved while system pressure continued moving.";
    }
    return "Observation improved clarity, but cost time.";
  }

  return "Decision changed system state.";
}

export function buildFailureExplanation(game: any) {
  const log = game.actionLog || [];
  const final = log.length ? log[log.length - 1].after : game;
  const isSuccess = game.state === "STABILIZED";

  const reasons: string[] = [];

  if (isSuccess) {
    reasons.push("Control was restored through adaptive execution.");
  }

  if ((final.load ?? game.load ?? 0) >= 95) {
    reasons.push(isSuccess ? "Load approached system limits but was managed" : "Load saturated the system");
  }

  if ((final.drift ?? game.drift ?? 0) >= 55) {
    reasons.push(isSuccess ? "Drift approached recovery limits but remained controllable" : "Drift exceeded recovery capacity");
  }

  const ignoredTotal = Object.values(game.ignoredCounts || {}).reduce(
    (sum: number, value: any) => sum + Number(value || 0),
    0
  );

  if (ignoredTotal >= 6) {
    reasons.push(isSuccess ? "Critical advisor signals created pressure but were managed" : "Critical advisor signals were repeatedly ignored");
  }

  const actions = log.map((entry: any) => entry.action);
  const lastThree = actions.slice(-3);

  if (lastThree.length >= 3 && new Set(lastThree).size === 1) {
    reasons.push(`Repeated ${lastThree[0]} decisions narrowed recovery options`);
  }

  const trajectoryInsight = getTrajectoryInsight(game);
  if (trajectoryInsight) {
    reasons.push(trajectoryInsight);
  }

  const needNeglectInsight = getNeedNeglectInsight(game);
  if (needNeglectInsight) {
    reasons.push(needNeglectInsight);
  }

  const commitmentInsight = getCommitmentInsight(game);
  if (commitmentInsight) {
    reasons.push(commitmentInsight);
  }

  const missedWindow = getMissedCommitmentWindow(game);
  if (missedWindow) {
    reasons.push(missedWindow);
  }

  const pointOfNoReturn = getPointOfNoReturn(game);
  if (pointOfNoReturn) {
    reasons.push(pointOfNoReturn);
  }

  if (game.pointOfNoReturn?.turn) {
    const turnsSince = (game.turn ?? 1) - game.pointOfNoReturn.turn;
    reasons.push(
      `Point of no return reached on Turn ${game.pointOfNoReturn.turn}.`
    );
    reasons.push("Post-collapse actions were only partially effective.");
    if (turnsSince >= 3) {
      reasons.push("Recovery capacity degraded over time after collapse.");
    }
  }

  if (!reasons.length) {
    reasons.push("Multiple small timing errors compounded into failure");
  }

  return {
    title: game.state === "STABILIZED" ? "Success explanation" : "Failure explanation",
    reasons,
    likelyCorrectAction: getLikelyCorrectAction(final, game),
  };
}

function getLikelyCorrectAction(final: any, game?: any) {
  if (game?.state === "STABILIZED") {
    const actions = (game.actionLog || []).map((entry: any) => entry.action);
    const usedReroute = actions.includes("REROUTE");
    const usedStabilize = actions.includes("STABILIZE");

    if (usedReroute && usedStabilize) {
      return {
        action: "ADAPTIVE CONTROL",
        reason: "REROUTE relieved load while STABILIZE restored structure and contained instability.",
      };
    }

    return {
      action: "SUSTAINED CONTROL",
      reason: "The run survived pressure through sufficient corrective action.",
    };
  }

  if ((final.drift ?? 0) >= 55) {
    return {
      action: "STABILIZE",
      reason: "High drift required correction before continuing pressure relief.",
    };
  }

  if ((final.load ?? 0) >= 90) {
    return {
      action: "REROUTE",
      reason: "Load pressure needed release before capacity failure.",
    };
  }

  return {
    action: "OBSERVE",
    reason: "Signal clarity was insufficient for confident action.",
  };
}
