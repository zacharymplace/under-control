export function PlayerTendency({ tendency }: { tendency: any }) {
  if (!tendency) {
    return <div>Unformed</div>;
  }

  return (
    <div>
      <div>Style: {tendency.dominantStyle}</div>
      <div>Risk: {tendency.riskProfile}</div>
    </div>
  );
}
