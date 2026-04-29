"use client";

import { scoreActionDecisively, spreadActionScores, getActionReason } from "@/game/actionScoring";
import { getInvalidActions } from "@/game/actionScoring";
import { getDisagreementPenalty } from "@/game/disagreementScore";
import {
  buildWeightedSupport,
  getWeightedSupportMultiplier,
} from "@/game/personaConfidence";
import {
  getConflictSeverity,
  getLockedActions as getConflictLockedActions,
} from "@/game/conflictSystem";
import { getLockedActions as getBehaviorLockedActions } from "@/game/lockIn";
import { getPressureDistortionNote } from "@/game/pressureDistortion";
import { getTrajectoryPenalty, getTrajectoryRiskLabel } from "@/game/trajectoryRisk";
import { getDominantNeedLabel } from "@/game/dominantNeed";
import { getNeedNeglectPenalty, getNeedNeglectInsight } from "@/game/needNeglect";
import { getCommitmentScore, getCommitmentLabel } from "@/game/commitment";
import { getSystemPhase } from "@/game/phase";
import { getLateCorrectionPenalty, getPointOfNoReturn, getMissedCommitmentWindow } from "@/game/irreversibility";
import { getPhasePenalty } from "@/game/phasePenalty";
import { getDecisionWindow, getDecisionWindowPenalty } from "@/game/decisionWindow";
import { getPostCollapseEffectiveness, getPostCollapseNote } from "@/game/postCollapse";
import { getCollapseLockedActions } from "@/game/collapseLock";
import { isStabilizationComplete } from "@/game/recoveryCompletion";
import { getRecoveryProgress, getRecoveryStatus, getCommitmentStatus, getAdvisorTrustTrajectory } from "@/game/runLegibility";

function scoreAction(
  action: string,
  game: any,
  suggestions: string[],
  disagreementMultiplier: number
) {
  let score = 1;

  const signal = game.signalClarity ?? game.signal ?? 0;

  if (game.drift > 50 && action === "STABILIZE") score += 0.5;
  if (game.load > 80 && action === "REROUTE") score += 0.5;
  if (signal < 55 && action === "OBSERVE") score += 0.5;

  
  const trajectoryPenalty = getTrajectoryPenalty(game);
  const needNeglectPenalty = getNeedNeglectPenalty(game);
  const commitmentScore = getCommitmentScore(game);
  const lateCorrectionPenalty = getLateCorrectionPenalty(action, game);
  const phasePenalty = getPhasePenalty(action, game);

  const decisionWindowPenalty = getDecisionWindowPenalty(action, game);
  const postCollapseEffectiveness = getPostCollapseEffectiveness(action, game);

  let recoveryPenalty = 1;
  if (action !== "STABILIZE" && !isStabilizationComplete(game) && game.drift > 50) {
    recoveryPenalty = 0.7;
  }

      return (
    score *
    disagreementMultiplier *
    getWeightedSupportMultiplier(action, game) *
    trajectoryPenalty *
    needNeglectPenalty *
    commitmentScore *
    lateCorrectionPenalty *
    phasePenalty *
    recoveryPenalty
  ).toFixed(2);
}

function explainAction(action: string, game: any, isBehaviorLocked: boolean, isConflictLocked: boolean) {
  if (isBehaviorLocked) return "Behavior lock: repeated pattern is constraining this option";
  if (isConflictLocked) return "Conflict lock";

  const signal = game.signalClarity ?? game.signal ?? 0;

  if (game.drift > 50 && action === "STABILIZE") return "High drift favors stabilization";
  if (game.load > 80 && action === "REROUTE") return "High load favors reroute";
  if (signal < 55 && action === "OBSERVE") return "Low signal favors observation";

  return "No strong signal advantage";
}


function getControlDoctrine(game: any) {
  const instability = game.drift ?? game.instability ?? 0;
  const load = game.load ?? 0;
  const pressure = game.pressure ?? "";
  const history = game.actionHistory || [];
  const lastAction = history[history.length - 1];

  if (lastAction === "REROUTE") {
    return "Doctrine: REROUTE creates hidden instability. STABILIZE next to pay it back.";
  }

  if ((pressure === "HIGH" || pressure === "CRITICAL") && instability >= 35) {
    return "Doctrine: pressure is high. Stabilize until instability is clearly safe.";
  }

  if (instability >= 40) {
    return "Doctrine: instability is elevated. STABILIZE before releasing more load.";
  }

  if (instability < 40 && load >= 65) {
    return "Doctrine: instability is controlled. REROUTE to release load pressure.";
  }

  return "Doctrine: keep the system balanced. Do not repeat actions without a reason.";
}



function getRecommendedControlGuidance(game: any) {
  const instability = game.drift ?? game.instability ?? 0;
  const pressure = game.pressure ?? "";
  const phase = game.phase ?? (game.turn >= 12 ? "late" : game.turn >= 6 ? "mid" : "early");
  const history = game.actionHistory || [];
  const lastAction = history[history.length - 1];

  const ignoredTotal = Object.values(game.ignoredCounts || {}).reduce(
    (sum: number, value: any) => sum + Number(value || 0),
    0
  );

  const suggestions = (game.personas || [])
    .map((p: any) => p.suggestion || p.suggests || p.recommendation)
    .filter(Boolean);

  const uniqueSuggestions = new Set(suggestions);
  const disagreement = suggestions.length
    ? Math.min(1, uniqueSuggestions.size / Math.max(1, suggestions.length))
    : 0;

  const degradeConfidence = (confidence: "LOW" | "MEDIUM" | "HIGH") => {
    if (ignoredTotal >= 6) return "LOW";
    if (disagreement > 0.6 && confidence === "HIGH") return "MEDIUM";
    if (phase === "late" && confidence === "HIGH") return "MEDIUM";
    return confidence;
  };

  // Low-confidence misread: guidance is advisory, not an oracle.
  const noise = Math.random();
  if ((pressure === "HIGH" || pressure === "CRITICAL") && noise < 0.08) {
    return {
      bias: "UNCERTAIN",
      confidence: "LOW",
      note: "Signal interpretation is unstable under pressure. Validate against the system state.",
    };
  }

  if (ignoredTotal >= 6) {
    return {
      bias: "UNCERTAIN",
      confidence: "LOW",
      note: "Advisory confidence has degraded because prior guidance was ignored.",
    };
  }

  if (disagreement > 0.6) {
    return {
      bias: "BALANCED",
      confidence: "LOW",
      note: "Advisors are not aligned. No clear control path is reliable.",
    };
  }

  if (lastAction === "REROUTE") {
    return {
      bias: "STABILIZE",
      confidence: degradeConfidence("HIGH"),
      note: "Recent reroute may have introduced hidden instability. Stabilization is favored.",
    };
  }

  if (phase === "late" && instability >= 35) {
    return {
      bias: "STABILIZE",
      confidence: degradeConfidence("MEDIUM"),
      note: "Late phase. Stability is harder to recover if instability is allowed to compound.",
    };
  }

  if ((pressure === "HIGH" || pressure === "CRITICAL") && instability >= 35 && instability <= 45) {
    return {
      bias: "BALANCED",
      confidence: "LOW",
      note: "The system is in a transitional band. Both pressure relief and stabilization carry tradeoffs.",
    };
  }

  if (instability >= 50) {
    return {
      bias: "STABILIZE",
      confidence: degradeConfidence("HIGH"),
      note: "Instability is elevated. Further stabilization is likely required before pressure relief.",
    };
  }

  if (instability >= 35) {
    if (lastAction === "STABILIZE") {
      return {
        bias: "REROUTE",
        confidence: degradeConfidence("MEDIUM"),
        note: "Instability is partially contained. Load relief may be viable, but risk remains.",
      };
    }

    return {
      bias: "STABILIZE",
      confidence: degradeConfidence("MEDIUM"),
      note: "Instability remains active. Stabilization is favored, but not guaranteed.",
    };
  }

  return {
    bias: "REROUTE",
    confidence: degradeConfidence("MEDIUM"),
    note: "Instability appears controlled. Pressure relief may be the stronger option.",
  };
}

export function ActionBar({
  game,
  onAction,
  disabled = false,
}: {
  game: any;
  onAction?: (action: string) => void;
  disabled?: boolean;
}) {
  
  const advisors = game.personas || [];
  

  const invalidActions = getInvalidActions(game);

  const actions = ["STABILIZE", "REROUTE", "OBSERVE"];

  const collapseLocked = getCollapseLockedActions(game);


  const suggestions = advisors
    .map((a: any) => a.suggests || a.action || a.suggestion)
    .filter(Boolean);

  const conflictSeverity = getConflictSeverity(suggestions);
  const conflictLocked = getConflictLockedActions(suggestions, conflictSeverity);
  const behaviorLocked = getBehaviorLockedActions(game);
  const locked = Array.from(new Set([...conflictLocked, ...behaviorLocked]));

  const disagreementMultiplier = getDisagreementPenalty(suggestions);
  const weightedSupport = buildWeightedSupport(game);

const decisiveScores = spreadActionScores({
    STABILIZE: scoreActionDecisively({
      action: "STABILIZE",
      baseScore: 0.81,
      support: weightedSupport?.STABILIZE ?? 0,
      game,
      advisors,
    }),
    REROUTE: scoreActionDecisively({
      action: "REROUTE",
      baseScore: 0.9,
      support: weightedSupport?.REROUTE ?? 0,
      game,
      advisors,
    }),
    OBSERVE: scoreActionDecisively({
      action: "OBSERVE",
      baseScore: 0.9,
      support: weightedSupport?.OBSERVE ?? 0,
      game,
      advisors,
    }),
  });

  const impact =
    disagreementMultiplier > 1
      ? "Aligned signal"
      : disagreementMultiplier < 1
      ? "Conflict detected"
      : "Partial disagreement";

  return (
    <section>
      <div style={{ marginBottom: "12px", fontSize: "13px", opacity: 0.9 }}>
        Guidance: {getRecommendedControlGuidance(game).bias} ({getRecommendedControlGuidance(game).confidence}) — {getRecommendedControlGuidance(game).note}
      </div>

      <div className="uc-action-grid">
        {actions.map((action) => {
          const isConflictLocked = conflictLocked.includes(action);
          const isBehaviorLocked = behaviorLocked.includes(action);
          const isLocked =
    collapseLocked.includes(action) ||
    collapseLocked.includes(action) || locked.includes(action);
          const isDisabled = disabled || isLocked;

          const isInvalid = invalidActions.includes(action as any);

          return (
            <button
              key={action}
              className={`uc-action ${isLocked ? "locked" : ""}`}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onAction?.(action);
              }}
            >
              <div className="uc-action-name">{action}</div>
              <div className="uc-action-score">
                score: {(decisiveScores[action as keyof typeof decisiveScores] ?? scoreAction(action, game, suggestions, disagreementMultiplier)).toFixed(2)}
              </div>
              <div className="uc-action-score">
                support: {(weightedSupport[action] ?? 0).toFixed(2)}
              </div>
              <div className="uc-action-reason">{isInvalid ? "System cannot tolerate this action under current conditions" : getActionReason(action as any, game)}</div>
            </button>
          );
        })}
      </div>

      <div className="uc-footer-note">Alignment impact: {impact}</div>
      <div className="uc-footer-note">Recovery: {getRecoveryProgress(game)}% · {getRecoveryStatus(game)}</div>
      <div className="uc-footer-note">Trajectory: {getTrajectoryRiskLabel(game)}</div>
      <div className="uc-footer-note">Commitment: {getCommitmentStatus(game)}</div>
      <div className="uc-footer-note">Trust trajectory: {getAdvisorTrustTrajectory(game)}</div>
      <div className="uc-footer-note">Phase: {getSystemPhase(game)}</div>
      <div className="uc-footer-note">Decision window:
      {collapseLocked.length > 0 && (
        <div className="uc-footer-note" style={{ color: "#ef4444" }}>Action space collapsing under system pressure</div>
      )} {getDecisionWindow(game).label}</div>
      {getMissedCommitmentWindow(game) && (
        <div className="uc-footer-note">Missed window: {getMissedCommitmentWindow(game)}</div>
      )}
      {getPointOfNoReturn(game) && (
        <div className="uc-footer-note">Point of no return: {getPointOfNoReturn(game)}</div>
      )}
      <div className="uc-footer-note">{getDominantNeedLabel(game)}</div>
      {getNeedNeglectInsight(game) && (
        <div className="uc-footer-note">Need neglect: {getNeedNeglectInsight(game)}</div>
      )}
      <div className="uc-footer-note">
        Scores reflect state pressure, disagreement, trust, ignored penalties,
        and confidence-weighted support.
      </div>
    </section>
  );
}

export default ActionBar;
