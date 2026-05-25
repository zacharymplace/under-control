type FlowState = {
  action?: string;
  drift?: number;
  load?: number;
  pressure?: number;
};

export function buildFlowNarrative(
  prev: FlowState | null | undefined,
  curr: FlowState
) {
  if (!prev) return null;

  if (prev.action === "REROUTE" && (curr.drift ?? 0) > (prev.drift ?? 0)) {
    return "Instability carried forward from prior rerouting.";
  }

  if (prev.action === "STABILIZE" && (curr.load ?? 0) > (prev.load ?? 0)) {
    return "Stabilization increased pressure load.";
  }

  if (prev.action === "OBSERVE" && (curr.pressure ?? 0) > (prev.pressure ?? 0)) {
    return "Delay allowed pressure to continue rising.";
  }

  return null;
}
