"use client";

import { getPlayerTendency } from "@/game/playerTendency";

export function PlayerTendency({ profile }: { profile: any }) {
  const tendency = getPlayerTendency(profile);

  return (
    <section className="uc-player-tendency">
      <div className="uc-replay-kicker">Player tendency</div>
      <div className="uc-player-tendency-title">{tendency.label}</div>
      <div className="uc-player-tendency-copy">{tendency.description}</div>
    </section>
  );
}
