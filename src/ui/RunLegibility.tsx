"use client";

import {
  getAdvisorTrustTrajectory,
  getCommitmentStatus,
  getRecoveryProgress,
  getRecoveryStatus,
} from "@/game/runLegibility";
import { getDominantNeedLabel } from "@/game/dominantNeed";
import { getTrajectoryRiskLabel } from "@/game/trajectoryRisk";

type RunLegibilityGameState = {
  load?: number;
  drift?: number;
  integrity?: number;
  signal?: number;
  signalClarity?: number;
  recoveryProgress?: number;
  commitment?: string;
  trust?: Record<string, number>;
  [key: string]: unknown;
};

export function RunLegibility({ game }: { game: RunLegibilityGameState }) {
  return (
    <section className="uc-legibility">
      <div>
        <div className="uc-replay-kicker">Run read</div>
        <div className="uc-legibility-title">{getRecoveryStatus(game)}</div>
      </div>

      <div className="uc-legibility-grid">
        <div>
          <span>Recovery</span>
          <strong>{getRecoveryProgress(game)}%</strong>
        </div>
        <div>
          <span>Commitment</span>
          <strong>{getCommitmentStatus(game)}</strong>
        </div>
        <div>
          <span>Trajectory</span>
          <strong>{getTrajectoryRiskLabel(game)}</strong>
        </div>
        <div>
          <span>Trust</span>
          <strong>{getAdvisorTrustTrajectory(game)}</strong>
        </div>
      </div>

      <div className="uc-footer-note" style={{ textAlign: "left", marginTop: 10 }}>
        {getDominantNeedLabel(game)}
      </div>
    </section>
  );
}
