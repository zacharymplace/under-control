export function applyDecisionGate({
  action,
  strength,
  threshold = 0.55,
}: {
  action: string | null;
  strength: number;
  threshold?: number;
}) {
  if (!action) return "observe";
  if (strength < threshold) return "observe";
  return action;
}
