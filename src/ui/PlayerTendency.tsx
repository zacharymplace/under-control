type PlayerTendencyValue = {
  dominantStyle?: string;
  riskProfile?: string;
};

export function PlayerTendency({
  tendency,
}: {
  tendency: PlayerTendencyValue | null | undefined;
}) {
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
