export function FeedbackPanel({ feedback }: any) {
  if (!feedback) return null;

  return (
    <section className="rounded-lg border border-[#1F2630] bg-[#12161C] p-4">
      <h2 className="mb-2 font-bold">{feedback.title}</h2>

      <div className="space-y-1 text-sm">
        {feedback.effects.map((effect: string) => (
          <div key={effect}>{effect}</div>
        ))}
      </div>

      <p className="mt-2 text-sm text-[#8A93A3]">{feedback.note}</p>
    </section>
  );
}
