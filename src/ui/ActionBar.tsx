"use client";

import { scoreActionDecisively, spreadActionScores, getActionReason } from "@/game/actionScoring";
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

  return "{getActionReason(action as any, game)}";
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
      <div className="uc-action-grid">
        {actions.map((action) => {
          const isConflictLocked = conflictLocked.includes(action);
          const isBehaviorLocked = behaviorLocked.includes(action);
          const isLocked =
    collapseLocked.includes(action) ||
    collapseLocked.includes(action) || locked.includes(action);
          const isDisabled = disabled || isLocked;

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
              <div className="uc-action-reason">
                {getPostCollapseNote(action, game) ||
                  getPressureDistortionNote(action, game) ||
                  explainAction(action, game, isBehaviorLocked, isConflictLocked)}
              </div>
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
