import { buildPlayerProfile } from "@/game/playerProfile";
import { buildPlayerNarrative } from "@/game/playerNarrative";
import { PlayerProfilePanel } from "@/ui/PlayerProfilePanel";
import { PlayerNarrativePanel } from "@/ui/PlayerNarrativePanel";
import { classifyPlayerArchetype } from "@/game/playerArchetype";
async function getRuns() {
  const res = await fetch("http://localhost:3000/api/analytics", {
    cache: "no-store",
  }).catch(() => null);

  if (!res) return [];
  const data = await res.json();
  return data.runs ?? [];
}
export default async function AnalyticsPage() {
  const runs = await getRuns();
  const total = runs.length;
  const failed = runs.filter((r: any) => r.result === "FAILED").length;
  const stabilized = runs.filter((r: any) => r.result === "STABILIZED").length;
  const avgTurn =
    total === 0
      ? 0
      : Math.round(runs.reduce((sum: number, r: any) => sum + r.turn, 0) / total);
  const avgPressure =
      : Math.round(
          runs.reduce(
            (sum: number, r: any) => sum + (r.summary?.avgPressure ?? 0),
            0
          ) / total
        );
  const maxTurn = runs.reduce((max: number, r: any) => Math.max(max, r.turn), 0);
  const actionCounts = countActions(runs);
  const trustAverages = averageTrust(runs);
  const archetype = classifyPlayerArchetype(runs);
  const playerProfile = buildPlayerProfile(runs);
  const playerNarrative = buildPlayerNarrative(playerProfile, runs);
return (
    <main className="min-h-screen bg-[#0B0D10] px-5 py-6 text-[#E6EAF0]">
      <>
      <PlayerProfilePanel profile={playerProfile} />
        <PlayerNarrativePanel narrative={playerNarrative} />
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
            Under Control
          </div>
          <h1 className="text-2xl font-bold">Run Analytics</h1>
        </div>
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="Runs" value={total} />
          <Metric label="Failed" value={failed} />
          <Metric label="Stabilized" value={stabilized} />
          <Metric label="Avg Turn" value={avgTurn} />
          <Metric label="Best Turn" value={maxTurn} />
        </section>
        <section className="mb-6 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
            Pressure
          <div className="text-3xl font-bold">{avgPressure}</div>
          <div className="mt-1 text-sm text-[#8A93A3]">
            Average pressure across completed runs
          <div className="mt-4">
            <Trend runs={runs.slice(-20)} />
        <section className="mb-6 grid gap-3 md:grid-cols-2">
          <Panel title="Action Distribution">
            <Bar label="STABILIZE" value={actionCounts.STABILIZE} total={actionCounts.total} />
            <Bar label="REROUTE" value={actionCounts.REROUTE} total={actionCounts.total} />
            <Bar label="OBSERVE" value={actionCounts.OBSERVE} total={actionCounts.total} />
          </Panel>
          <Panel title="Average Persona Trust">
            <TrustRow label="ELENA" value={trustAverages.ELENA} />
            <TrustRow label="MARA" value={trustAverages.MARA} />
            <TrustRow label="ISHAAN" value={trustAverages.ISHAAN} />
            Player Archetype
          <div className="mt-2 text-xl font-bold">{archetype}</div>
            Derived from action distribution across runs
        <section className="space-y-2">
          {runs
            .slice()
            .reverse()
            .slice(0, 20)
            .map((run: any, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-[#2A313A] bg-[#12161C] p-4"
              >
                <div className="mb-1 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
                  <span>{run.result}</span>
                  <span>Turn {run.turn}</span>
                </div>
                <div className="text-sm text-[#8A93A3]">
                  Load {run.load} • Integrity {run.integrity} • Signal{" "}
                  {run.signalClarity} • Drift {run.drift}
                {run.trust && (
                  <div className="mt-1 text-xs text-[#5A646F]">
                    Trust — Elena {run.trust.ELENA ?? 0} • Mara{" "}
                    {run.trust.MARA ?? 0} • Ishaan {run.trust.ISHAAN ?? 0}
                  </div>
                )}
              </div>
            ))}
      </div>
    </main>
  );
function countActions(runs: any[]) {
  const counts: any = {
    STABILIZE: 0,
    REROUTE: 0,
    OBSERVE: 0,
    total: 0,
  };
  runs.forEach((run) => {
    (run.actionHistory || []).forEach((action: string) => {
      if (counts[action] !== undefined) {
        counts[action]++;
        counts.total++;
      }
    });
  });
  return counts;
function averageTrust(runs: any[]) {
  if (!runs.length) return { ELENA: 0, MARA: 0, ISHAAN: 0 };
  const totals: any = { ELENA: 0, MARA: 0, ISHAAN: 0 };
    totals.ELENA += run.trust?.ELENA ?? 0;
    totals.MARA += run.trust?.MARA ?? 0;
    totals.ISHAAN += run.trust?.ISHAAN ?? 0;
  return {
    ELENA: Math.round(totals.ELENA / runs.length),
    MARA: Math.round(totals.MARA / runs.length),
    ISHAAN: Math.round(totals.ISHAAN / runs.length),
function Metric({ label, value }: { label: string; value: number }) {
    <div className="rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
      <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
        {label}
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
function Panel({ title, children }: any) {
      <div className="mb-3 text-xs uppercase tracking-widest text-[#8A93A3]">
        {title}
      <div className="space-y-3">{children}</div>
function Bar({ label, value, total }: any) {
  const pct = total ? Math.round((value / total) * 100) : 0;
    <div>
      <div className="mb-1 flex justify-between text-xs text-[#8A93A3]">
        <span>{label}</span>
        <span>
          {value} / {pct}%
        </span>
      <div className="h-2 rounded bg-[#1A1F26]">
        <div
          className="h-2 rounded bg-[#4FAF7B]"
          style={{ width: `${pct}%` }}
        />
function TrustRow({ label, value }: any) {
  const width = Math.min(100, Math.abs(value) * 20);
  const color = value >= 0 ? "bg-[#4FAF7B]" : "bg-[#C75C5C]";
        <span>{value}</span>
        <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
function Trend({ runs }: any) {
  const values = runs.map((r: any) => r.summary?.avgPressure || 0);
    <div className="flex h-24 items-end gap-1">
      {values.map((v: number, i: number) => (
          key={i}
          style={{ height: `${Math.min(100, v)}%` }}
          className="w-2 bg-[#3A82F7]"
      ))}
    </>
