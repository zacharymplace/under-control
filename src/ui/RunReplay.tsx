"use client";

import { buildFailureExplanation, buildRunReplay } from "@/game/runReplay";

export function RunReplay({ game }: { game: any }) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return null;

  const replay = buildRunReplay(game);
  const explanation = buildFailureExplanation(game);

  if (!replay) return null;

  return (
    <section className="uc-replay">
      <div className="uc-replay-head">
        <div>
          <div className="uc-replay-kicker">Run Replay</div>
          <h2 className="uc-replay-title">{explanation.title}</h2>
        </div>
      </div>

      <div className="uc-replay-reasons">
        {explanation.reasons.map((reason: string, index: number) => (
          <div key={index} className="uc-replay-reason">
            {reason}
          </div>
        ))}
      </div>

      <div className="uc-correct-action">
        <div className="uc-replay-kicker">Likely Correct Action</div>
        <div className="uc-correct-action-main">
          {explanation.likelyCorrectAction.action}
        </div>
        <div className="uc-correct-action-copy">
          {explanation.likelyCorrectAction.reason}
        </div>
      </div>

      <div className="uc-replay-list">
        {replay.map((entry: any) => (
          <article key={entry.turn} className="uc-replay-item">
            <div className="uc-replay-row">
              <div>
                <div className="uc-replay-turn">Turn {entry.turn}</div>
                <div className="uc-replay-action">{entry.action}</div>
              </div>
              <div className="uc-replay-summary">{entry.summary}</div>
            </div>

            <div className="uc-replay-deltas">
              <Delta label="Load" value={entry.loadDelta} invert={false} />
              <Delta label="Drift" value={entry.driftDelta} invert={false} />
              <Delta label="Integrity" value={entry.integrityDelta} invert />
              <Delta label="Signal" value={entry.signalDelta} invert />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Delta({ label, value, invert = false }: any) {
  const good = invert ? value > 0 : value < 0;
  const bad = invert ? value < 0 : value > 0;

  const cls = good ? "good" : bad ? "bad" : "neutral";
  const sign = value > 0 ? "+" : "";

  return (
    <div className={`uc-delta ${cls}`}>
      {label}: {sign}
      {value}
    </div>
  );
}
