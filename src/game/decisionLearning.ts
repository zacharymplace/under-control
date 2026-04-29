export function classifyOutcome({
  correct,
  confidence,
  weight,
}: {
  correct: boolean;
  confidence: number;
  weight: number;
}) {
  if (correct && weight > 0.7) return "reinforce_strong";
  if (correct) return "reinforce";
  if (!correct && weight > 0.7) return "overweight_penalty";
  return "minor_penalty";
}
