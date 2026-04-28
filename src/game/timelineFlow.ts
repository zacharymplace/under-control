export function buildFlowNarrative(prev: any, curr: any) {
  if (!prev) return null;

  if (prev.action === "REROUTE" && curr.drift > prev.drift) {
    return "Instability carried forward from prior rerouting.";
  }

  if (prev.action === "STABILIZE" && curr.load > prev.load) {
    return "Stabilization increased pressure load.";
  }

  if (prev.action === "OBSERVE" && curr.pressure > prev.pressure) {
    return "Delay allowed pressure to continue rising.";
  }

  return null;
}
