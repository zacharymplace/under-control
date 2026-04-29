"use client";

import {
  getAdvisorTrustTrajectory,
  getCommitmentStatus,
  getRecoveryProgress,
  getRecoveryStatus,
} from "@/game/runLegibility";
import { getDominantNeedLabel } from "@/game/dominantNeed";
import { getTrajectoryRiskLabel } from "@/game/trajectoryRisk";

export function RunLegibility({ game }: { game: any }) {
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
