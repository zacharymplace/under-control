
// --- Advisor-driven execution risk ---
export function computeDisagreementRisk(game: any) {
  const personas = game.personas || [];
  if (!personas.length) return { risk: 0, consensus: 1 };

  // assume each persona has `suggestion` (ActionName)
  const counts: Record<string, number> = {};
  for (const p of personas) {
    const a = (p.suggestion || p.suggests || "").toString();
    if (!a) continue;
    counts[a] = (counts[a] || 0) + 1;
  }

  const total = Object.values(counts).reduce((a,b)=>a+b, 0) || 1;
  const max = Math.max(...Object.values(counts), 0);
  const consensus = max / total;           // 1 = full agreement
  const disagreement = 1 - consensus;      // 0..1

  // amplify in later phases
  const phase = (game.turn ?? 1) > 6 ? 1.25 : (game.turn ?? 1) > 3 ? 1.1 : 1.0;

  return {
    risk: Math.min(1, disagreement * phase),
    consensus
  };
}

export function maybeOverrideAction(selected: ActionName, game: any) {
  const { risk, consensus } = computeDisagreementRisk(game);

  // do not override when consensus is strong
  if (consensus >= 0.7) return { action: selected, overridden: false, reason: "" };

  // cap override probability
  const p = Math.min(0.55, risk);

  if (Math.random() < p) {
    const personas = game.personas || [];
    const counts: Record<string, number> = {};
    for (const p of personas) {
      const a = (p.suggestion || p.suggests || "").toString();
      if (!a) continue;
      counts[a] = (counts[a] || 0) + 1;
    }
    // pick majority suggestion
    const majority = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] as ActionName | undefined;
    if (majority && majority !== selected) {
      return { action: majority, overridden: true, reason: "High advisor disagreement caused an override" };
    }
  }

  return { action: selected, overridden: false, reason: "" };
}

export function applyOutcomeVariance(next: any, action: ActionName, game: any) {
  const { risk } = computeDisagreementRisk(game);
  if (risk <= 0.2) return next;

  // scale variance by risk
  const jitter = (base: number) => Math.round(base * (0.5 * risk) * (Math.random() - 0.5) * 2);

  const n = { ...next };

  // small bounded noise on key axes
  if (typeof n.load === "number") n.load = clampValue(n.load + jitter(6));
  if (typeof n.drift === "number") n.drift = clampValue(n.drift + jitter(6));
  if (typeof n.integrity === "number") n.integrity = clampValue(n.integrity + jitter(4));
  if (typeof n.signalClarity === "number") n.signalClarity = clampValue(n.signalClarity + jitter(6));

  return n;
}


export function getInvalidActions(game: any): ActionName[] {
  const invalid: ActionName[] = [];

  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;
  const signal = game.signalClarity ?? 100;

  // High load → OBSERVE becomes invalid (too passive)
  if (load > 85) {
    invalid.push("OBSERVE");
  }

  // High drift → REROUTE becomes dangerous
  if (drift > 40) {
    invalid.push("REROUTE");
  }

  // Low integrity → anything except STABILIZE is invalid
  if (integrity < 60) {
    invalid.push("REROUTE", "OBSERVE");
  }

  // Low signal → acting is invalid
  if (signal < 55) {
    invalid.push("STABILIZE", "REROUTE");
  }

  return [...new Set(invalid)];
}

import { getDominantNeed } from "./dominantNeed";
import { getSystemPhase } from "./phase";
import { getDecisionWindow } from "./decisionWindow";

type ActionName = "STABILIZE" | "REROUTE" | "OBSERVE";

function clampValue(n: number, min = 0, max = 100) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clampScore(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Number(n.toFixed(2)));
}

function advisorAlignment(action: ActionName, advisors: any[]) {
  return advisors.filter((a) => {
    const suggestion = a.suggests || a.action || a.suggestion;
    return suggestion === action;
  }).length;
}

function signalWeightedSupport(support: number, game: any) {
  const signal = Math.max(0, Math.min(100, game.signalClarity ?? 0));
  return support * (signal / 100);
}

function needMultiplier(action: ActionName, game: any) {
  const need = getDominantNeed(game);

  if (need === "STABILIZE") return action === "STABILIZE" ? 1.45 : action === "REROUTE" ? 0.85 : 0.8;
  if (need === "REROUTE") return action === "REROUTE" ? 1.35 : action === "STABILIZE" ? 0.9 : 0.85;
  if (need === "OBSERVE") return action === "OBSERVE" ? 1.45 : action === "REROUTE" ? 0.85 : 0.8;

  return action === "REROUTE" ? 1.05 : action === "OBSERVE" ? 1.12 : 1;
}

function hardStateAdjustment(action: ActionName, game: any) {
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;
  const signal = game.signalClarity ?? 100;

  let adjustment = 0;

  const invalid = getInvalidActions(game);
  if (invalid.includes(action)) {
    return 0.05; // effectively unselectable
  }

  if (drift > 50 && action === "REROUTE") adjustment -= 0.6;
  if (signal < 65 && action !== "OBSERVE") adjustment -= 1.25;
  if (integrity < 60 && action !== "STABILIZE") adjustment -= 0.7;
  if (load > 85 && action !== "REROUTE") adjustment -= 0.45;

  if (signal < 70 && action === "OBSERVE") adjustment += 0.95;
  if (integrity < 70 && action === "STABILIZE") adjustment += 0.45;
  if (load > 75 && action === "REROUTE") adjustment += 0.35;

  return adjustment;
}

function phaseMultiplier(game: any) {
  const phase = getSystemPhase(game);
  if (phase === "late") return 1.25;
  if (phase === "mid") return 1.12;
  return 1;
}

function decisionWindowMultiplier(game: any) {
  const window = getDecisionWindow(game);
  if (window.state === "COLLAPSED") return 1.35;
  if (window.state === "NARROWING") return 1.2;
  if (window.state === "COMPRESSED") return 1.08;
  return 1;
}


function getPhasePressureMultiplier(game: any, action: ActionName) {
  const phase = getSystemPhase(game);
  const signal = game.signalClarity ?? 100;
  const integrity = game.integrity ?? 100;

  if (phase === "early") {
    if (signal < 70 && action !== "OBSERVE") return 0.55;
    return 1;
  }

  if (phase === "mid") {
    if (action === "OBSERVE") return 0.75;
    return 1.1;
  }

  if (phase === "late") {
    if (integrity < 65 && action !== "STABILIZE") return 0.35;
    if (signal < 70 && action !== "OBSERVE") return 0.5;
    return 1.25;
  }

  return 1;
}

export function scoreActionDecisively({
  action,
  baseScore,
  support,
  game,
  advisors,
}: {
  action: ActionName;
  baseScore: number;
  support: number;
  game: any;
  advisors: any[];
}) {
  const alignment = advisorAlignment(action, advisors);
  const fragmentedPenalty = alignment === 1 && advisors.length >= 3 ? -0.2 : 0;
  const alignmentBonus = alignment * 0.25;
  const adjustedSupport = signalWeightedSupport(support, game);

  const raw =
    (baseScore +
      adjustedSupport * 0.12 +
      alignmentBonus +
      fragmentedPenalty +
      hardStateAdjustment(action, game)) *
    needMultiplier(action, game) *
    phaseMultiplier(game) *
    getPhasePressureMultiplier(game, action) *
    decisionWindowMultiplier(game);

  return clampScore(raw);
}

export function spreadActionScores<T extends Record<ActionName, number>>(scores: T): T {
  const values = Object.values(scores);
  const max = Math.max(...values);
  const min = Math.min(...values);

  if (!Number.isFinite(max) || max <= 0) return scores;

  const spread = max - min;
  if (spread >= 0.25) return scores;

  return Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, clampScore(Math.pow(v / max, 1.65) * max)])
  ) as T;
}

export function getActionReason(action: ActionName, game: any) {
  const need = getDominantNeed(game);

  if (need === action) {
    if (action === "STABILIZE") return "Structure risk makes stabilization the clearest move";
    if (action === "REROUTE") return "Load pressure makes reroute the clearest move";
    if (action === "OBSERVE") return "Low signal makes observation the clearest move";
  }

  const drift = game.drift ?? 0;
  const integrity = game.integrity ?? 100;
  const signal = game.signalClarity ?? 100;
  const load = game.load ?? 0;

  if (signal < 70 && action === "OBSERVE") return "Signal clarity still favors observation";
  if (drift > 50 && action === "REROUTE") return "Reroute is risky while instability is elevated";
  if (integrity < 60 && action !== "STABILIZE") return "Structure risk argues against this action";
  if (signal < 65 && action !== "OBSERVE") return "Signal is too weak for confident action";
  if (load > 85 && action !== "REROUTE") return "Load pressure needs relief";

  return "No decisive state advantage";
}
