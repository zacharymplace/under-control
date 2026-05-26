import { getDecisionWindow } from "./decisionWindow";

export type PointOfNoReturn = {
  turn: number;
  load: number;
  drift: number;
  reason: string;
};

type PointOfNoReturnGameState = {
  pointOfNoReturn?: PointOfNoReturn | null;
  turn?: number;
  load?: number;
  drift?: number;
  pressure?: string;
};

export function maybeMarkPointOfNoReturn(
  game: PointOfNoReturnGameState
): PointOfNoReturn | null {
  if (game.pointOfNoReturn) return game.pointOfNoReturn;

  const window = getDecisionWindow(game);

  if (window.state !== "COLLAPSED") return null;

  return {
    turn: game.turn ?? 1,
    load: game.load ?? 0,
    drift: game.drift ?? 0,
    reason: window.note,
  };
}
