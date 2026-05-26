type FeedbackValue = {
  title?: string;
  effects?: string[];
  note?: string;
};

type FeedbackSummary = {
  avgPressure?: number;
  peakLoad?: number;
  peakDrift?: number;
};

export function FeedbackPanel({
  feedback,
  summary,
}: {
  feedback: FeedbackValue | null | undefined;
  summary?: FeedbackSummary | null;
}) {
  if (!feedback) return null;

  return (
    <section className="rounded-lg border border-[#1F2630] bg-[#12161C] p-4">
      <h2 className="mb-2 font-bold">{feedback.title}</h2>

      <div className="space-y-1 text-sm">
        {(feedback.effects || []).map((effect) => (
          <div key={effect}>{effect}</div>
        ))}
      </div>

      <p className="mt-2 text-sm text-[#8A93A3]">{feedback.note}</p>

      {summary && (
        <div className="mt-3 text-xs text-[#8A93A3]">
          Avg Pressure: {summary.avgPressure} • Peak Load: {summary.peakLoad} • Peak Drift: {summary.peakDrift}
        </div>
      )}
    </section>
  );
}
