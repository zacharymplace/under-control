type PlayerProfilePanelValue = {
  tendency?: string;
  coachingNote?: string;
  totalRuns?: number;
  dominantAction?: string;
  averageTurn?: number;
  commonFailure?: string;
};

type MetricProps = {
  label: string;
  value?: string | number | null;
};

export function PlayerProfilePanel({
  profile,
}: {
  profile: PlayerProfilePanelValue | null | undefined;
}) {
  if (!profile) return null;

  return (
    <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
          Player Pattern
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#5A646F]">
          Cross-run profile
        </div>
      </div>

      <div className="text-xl font-bold text-[#E6EAF0]">
        {profile.tendency}
      </div>

      <div className="mt-2 text-sm text-[#8A93A3]">
        {profile.coachingNote}
      </div>

      <div className="mt-4 grid gap-2 text-xs md:grid-cols-4">
        <Metric label="Runs" value={profile.totalRuns} />
        <Metric label="Dominant Action" value={profile.dominantAction} />
        <Metric label="Avg Turn" value={profile.averageTurn} />
        <Metric label="Common Failure" value={profile.commonFailure} />
      </div>
    </section>
  );
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
        {label}
      </div>
      <div className="mt-1 font-bold text-[#E6EAF0]">{value}</div>
    </div>
  );
}
