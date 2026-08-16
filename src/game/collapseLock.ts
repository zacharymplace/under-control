type CollapseGameState = {
  pointOfNoReturn?: {
    turn?: number;
  } | null;
  turn?: number;
  load?: number;
};

export function getCollapseLockedActions(game: CollapseGameState) {
  if (!game.pointOfNoReturn) return [];

  const collapseTurn = game.pointOfNoReturn.turn ?? game.turn ?? 1;
  const turnsSince = Math.max(0, (game.turn ?? 1) - collapseTurn);
  const load = game.load ?? 0;

  if (turnsSince >= 3 || load >= 95) {
    return ["OBSERVE"];
  }

  if (turnsSince >= 5) {
    return ["OBSERVE", "REROUTE"];
  }

  return [];
}
