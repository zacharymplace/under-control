import { getTrajectoryInsight } from "./trajectoryRisk";

export function getAdvisorTrajectoryNote(name: string, game: any) {
  const insight = getTrajectoryInsight(game);
  if (!insight) return null;

  const key = name.toUpperCase();

  if (insight.includes("primary need")) {
    if (key === "ELENA") return "You are reading the system, but not acting on the primary signal.";
    if (key === "MARA") return "Your actions are misaligned with the correction path the system needs.";
    if (key === "ISHAAN") return "You are optimizing the wrong risk dimension.";
  }

  if (insight.includes("oscillation")) {
    if (key === "ELENA") return "Your strategy is oscillating. The read is getting less reliable.";
    if (key === "MARA") return "You are switching correction paths too quickly to stabilize structure.";
    if (key === "ISHAAN") return "Strategy instability is now part of the risk profile.";
  }

  if (insight.includes("reroutes")) {
    if (key === "MARA") return "Repeated reroutes are creating structural debt.";
    if (key === "ISHAAN") return "Reroute is becoming a risk amplifier, not just relief.";
    if (key === "ELENA") return "Load relief is visible, but the hidden cost is being under-read.";
  }

  if (insight.includes("observation")) {
    if (key === "ELENA") return "Signal is improving, but continued observation is becoming delay.";
    if (key === "ISHAAN") return "Waiting is now increasing downside exposure.";
    if (key === "MARA") return "The system needs correction, not more reading.";
  }

  if (insight.includes("stabilization")) {
    if (key === "MARA") return "Structure is protected, but load pressure is still unresolved.";
    if (key === "ISHAAN") return "Over-stabilization is delaying pressure release.";
    if (key === "ELENA") return "The current read is too narrow. Load trend needs attention.";
  }

  return null;
}
