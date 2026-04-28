"use client";

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

  const weightedSupport = getWeightedSupportMultiplier(action, game);
  const trajectoryPenalty = getTrajectoryPenalty(game);
  const needNeglectPenalty = getNeedNeglectPenalty(game);
  const commitmentScore = getCommitmentScore(game);
  const lateCorrectionPenalty = getLateCorrectionPenalty(action, game);
  const phasePenalty = getPhasePenalty(action, game);

  return (
    score *
    disagreementMultiplier *
    weightedSupport *
    trajectoryPenalty *
    needNeglectPenalty *
    commitmentScore *
    lateCorrectionPenalty *
    phasePenalty
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

export function ActionBar({
  game,
  onAction,
  disabled = false,
}: {
  game: any;
  onAction?: (action: string) => void;
  disabled?: boolean;
}) {
  const actions = ["STABILIZE", "REROUTE", "OBSERVE"];
  const advisors = game.personas || [];

  const suggestions = advisors
    .map((a: any) => a.suggests || a.action || a.suggestion)
    .filter(Boolean);

  const conflictSeverity = getConflictSeverity(suggestions);
  const conflictLocked = getConflictLockedActions(suggestions, conflictSeverity);
  const behaviorLocked = getBehaviorLockedActions(game);
  const locked = Array.from(new Set([...conflictLocked, ...behaviorLocked]));

  const disagreementMultiplier = getDisagreementPenalty(suggestions);
  const weightedSupport = buildWeightedSupport(game);

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
          const isLocked = locked.includes(action);
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
                score: {scoreAction(action, game, suggestions, disagreementMultiplier)}
              </div>
              <div className="uc-action-score">
                support: {(weightedSupport[action] ?? 0).toFixed(2)}
              </div>
              <div className="uc-action-reason">
                {getPressureDistortionNote(action, game) ||
                  explainAction(action, game, isBehaviorLocked, isConflictLocked)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="uc-footer-note">Alignment impact: {impact}</div>
      <div className="uc-footer-note">Trajectory: {getTrajectoryRiskLabel(game)}</div>
      <div className="uc-footer-note">Commitment: {getCommitmentLabel(game)}</div>
      <div className="uc-footer-note">Phase: {getSystemPhase(game)}</div>
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
