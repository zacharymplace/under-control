export function TutorialPanel({ game }: any) {
  const terminal = game.state === "FAILED" || game.state === "STABILIZED";
  if (terminal) return null;

  const steps = game.tutorialSteps || [];
  const step = steps.find((s: any) => s.turn === game.turn);

  if (!step && !game.scenarioOpening) return null;

  return (
    <section className="mb-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
      <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
        {game.modeLabel || "Scenario"}
      </div>

      {game.turn === 1 && game.scenarioOpening && (
        <p className="mb-3 text-sm text-[#8A93A3]">{game.scenarioOpening}</p>
      )}

      {step && (
        <>
          <h2 className="font-bold">{step.title}</h2>
          <p className="mt-1 text-sm text-[#8A93A3]">{step.body}</p>
        </>
      )}
    </section>
  );
}
