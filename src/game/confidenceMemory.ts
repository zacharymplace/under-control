export function smoothConfidence({
  prev,
  next,
  alpha = 0.6,
}: {
  prev: number;
  next: number;
  alpha?: number;
}) {
  return Number((prev * alpha + next * (1 - alpha)).toFixed(2));
}
