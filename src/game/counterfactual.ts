export type CounterfactualState = {
  load: number;
  drift: number;
  integrity: number;
  signalClarity?: number;
  signal?: number;
  [key: string]: unknown;
};

export type CounterfactualLogEntry = {
  turn?: number;
  action?: string;
  before: CounterfactualState;
  after?: CounterfactualState;
};

export type CounterfactualGameState = {
  state?: string;
  actionLog?: CounterfactualLogEntry[];
};

export function simulateAlternatePath(
  game: CounterfactualGameState,
  turnIndex: number,
  action: string
) {
  const log = game.actionLog || [];
  if (!log[turnIndex]) return null;

  const entry = log[turnIndex];
  const base = { ...entry.before };

  const result = applyAction(base, action);

  return {
    turn: entry.turn,
    chosen: entry.action,
    alternate: action,
    before: base,
    after: result,
    deltas: computeDeltas(base, result),
    outcome: summarizeOutcome(action, base, result),
  };
}

function applyAction(state: CounterfactualState, action: string) {
  const next = { ...state };

  if (action === "STABILIZE") {
    next.drift = Math.max(0, state.drift - 10);
    next.integrity = Math.min(100, state.integrity + 8);
    next.load += 6;
  }

  if (action === "REROUTE") {
    next.load = Math.max(0, state.load - 12);
    next.drift += 6;
    next.integrity -= 2;
  }

  if (action === "OBSERVE") {
    next.signalClarity = Math.min(100, (state.signalClarity ?? 0) + 10);
    next.load += 6;
    next.drift += 4;
  }

  return next;
}

function computeDeltas(before: CounterfactualState, after: CounterfactualState) {
  return {
    load: (after.load ?? 0) - (before.load ?? 0),
    drift: (after.drift ?? 0) - (before.drift ?? 0),
    integrity: (after.integrity ?? 0) - (before.integrity ?? 0),
    signal:
      (after.signalClarity ?? 0) - (before.signalClarity ?? 0),
  };
}

function summarizeOutcome(
  action: string,
  before: CounterfactualState,
  after: CounterfactualState
) {
  if (action === "REROUTE" && after.load < before.load) {
    return "Load pressure would have been reduced before failure.";
  }

  if (action === "STABILIZE" && after.drift < before.drift) {
    return "Drift would have been controlled earlier.";
  }

  if (action === "OBSERVE") {
    return "Signal clarity would improve, but pressure continues.";
  }

  return "Alternate action changes system trajectory.";
}
