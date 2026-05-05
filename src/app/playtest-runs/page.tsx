"use client";

import { useEffect, useMemo, useState } from "react";

type RunTelemetry = {
  schemaVersion?: string;
  exportedAt?: string;
  route?: string;
  scenario?: {
    id?: string;
    label?: string;
  };
  status?: string;
  cycleReached?: number;
  cyclesSurvived?: number;
  maxCycles?: number;
  score?: number;
  operatorProfile?: {
    name?: string;
    summary?: string;
  };
  finalState?: {
    integrity?: number;
    pressure?: number;
    cascadeRisk?: number;
    cascadeBreaches?: number;
    energy?: number;
  };
  actions?: {
    total?: number;
    observe?: number;
    reroute?: number;
    stabilize?: number;
    reckless?: number;
    observedBeforeCriticalAction?: number;
  };
  advisors?: Array<{
    id?: string;
    name?: string;
    trust?: number;
    confidence?: number;
    state?: string;
  }>;
  nodes?: Array<{
    id?: string;
    label?: string;
    state?: string;
    pressure?: number;
    volatility?: number;
    integrity?: number;
  }>;
  events?: Array<{
    cycle?: number;
    tone?: string;
    message?: string;
  }>;
};

type ImportedRun = {
  id: string;
  filename: string;
  importedAt: string;
  telemetry: RunTelemetry;
};

type ScenarioSummary = {
  key: string;
  label: string;
  totalRuns: number;
  wins: number;
  losses: number;
  winRate: number;
  avgCycles: number;
  avgScore: number;
  avgIntegrity: number;
  avgCascade: number;
  avgActions: number;
  avgObserve: number;
  avgReroute: number;
  avgStabilize: number;
  avgTrust: number;
  avgReckless: number;
  zeroActionRuns: number;
  dominantAction: string;
  recommendation: string;
  recommendationSeverity: "watch" | "tune" | "urgent";
};

const RUN_STORAGE_KEY = "under-control.playtest-runs.v0.1";

function recommendScenarioBalance(input: {
  label: string;
  totalRuns: number;
  winRate: number;
  avgCycles: number;
  avgCascade: number;
  avgIntegrity: number;
  avgActions: number;
  avgReckless: number;
  zeroActionRuns: number;
  dominantAction: string;
}) {
  const {
    label,
    totalRuns,
    winRate,
    avgCycles,
    avgCascade,
    avgIntegrity,
    avgActions,
    avgReckless,
    zeroActionRuns,
    dominantAction,
  } = input;

  if (zeroActionRuns > 0) {
    return {
      severity: "watch" as const,
      recommendation:
        "Low-confidence sample: this scenario includes zero-action/no-action telemetry. Import fresh committed-action runs before tuning.",
    };
  }

  if (totalRuns < 3) {
    return {
      severity: "watch" as const,
      recommendation:
        "Collect at least 3 runs before making balance changes for this scenario.",
    };
  }

  if (winRate < 25 && avgCycles < 7) {
    return {
      severity: "urgent" as const,
      recommendation:
        "Too punishing early. Reduce starting cascade pressure, critical-node pressure growth, or ignored-critical penalties.",
    };
  }

  if (winRate < 35 && avgCascade >= 80) {
    return {
      severity: "tune" as const,
      recommendation:
        "Losses are cascade-heavy. Add stronger cascade relief, earlier warnings, or soften late-cycle cascade penalties.",
    };
  }

  if (winRate > 75 && avgIntegrity > 55) {
    return {
      severity: "tune" as const,
      recommendation:
        "Likely too forgiving. Increase late-cycle pressure drift or require cleaner stabilization for a win.",
    };
  }

  if (avgActions < 5 && avgCycles < 8) {
    return {
      severity: "tune" as const,
      recommendation:
        "Players may not understand when to intervene. Strengthen priority prompts, guided moves, or first-run onboarding.",
    };
  }

  if (avgReckless >= 2) {
    return {
      severity: "tune" as const,
      recommendation:
        "Reckless interventions are common. Improve observe affordances or make hidden-risk warnings more visible.",
    };
  }

  if (dominantAction === "OBSERVE" && winRate < 45) {
    return {
      severity: "watch" as const,
      recommendation:
        "Observation may be delaying recovery. Consider clearer timing cues for when to transition from observe to action.",
    };
  }

  if (dominantAction === "REROUTE" && avgCascade > 70) {
    return {
      severity: "watch" as const,
      recommendation:
        "Rerouting may be transferring too much unresolved load. Review load-transfer values and connected-node penalties.",
    };
  }

  if (dominantAction === "STABILIZE" && winRate < 45) {
    return {
      severity: "watch" as const,
      recommendation:
        "Direct repair is not converting into recovery. Review stabilize strength, cooldown, and hidden-risk penalties.",
    };
  }

  if (label === "Critical Cascade" && winRate < 40) {
    return {
      severity: "tune" as const,
      recommendation:
        "Critical Cascade is doing its job, but may need one extra recovery lever: lower starting cascade or improve early Risk guidance.",
    };
  }

  if (label === "Recovery Window" && winRate < 55) {
    return {
      severity: "tune" as const,
      recommendation:
        "Recovery Window should teach success. Reduce initial pressure or make the first priority more explicit.",
    };
  }

  return {
    severity: "watch" as const,
    recommendation:
      "Scenario appears near target range. Keep collecting runs before adjusting.",
  };
}

function summarizeByScenario(runs: ImportedRun[]): ScenarioSummary[] {
  const groups = new Map<string, ImportedRun[]>();

  for (const run of runs) {
    const scenarioId = run.telemetry.scenario?.id ?? "unknown";
    const scenarioLabel = run.telemetry.scenario?.label ?? "Unknown Scenario";
    const key = scenarioId + "::" + scenarioLabel;
    const current = groups.get(key) ?? [];

    current.push(run);
    groups.set(key, current);
  }

  return Array.from(groups.entries())
    .map(([key, groupRuns]) => {
      const first = groupRuns[0]?.telemetry;
      const label = first?.scenario?.label ?? "Unknown Scenario";
      const totalRuns = groupRuns.length;
      const wins = groupRuns.filter((run) => run.telemetry.status === "won").length;
      const losses = groupRuns.filter((run) => run.telemetry.status === "lost").length;

      const winRate = totalRuns > 0 ? Math.round((wins / totalRuns) * 100) : 0;
      const avgCycles = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.cyclesSurvived), 0) /
          totalRuns
      );
      const avgScore = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.score), 0) / totalRuns
      );
      const avgIntegrity = Math.round(
        groupRuns.reduce(
          (sum, run) => sum + safeNumber(run.telemetry.finalState?.integrity),
          0
        ) / totalRuns
      );
      const avgCascade = Math.round(
        groupRuns.reduce(
          (sum, run) => sum + safeNumber(run.telemetry.finalState?.cascadeRisk),
          0
        ) / totalRuns
      );
      const avgActions = Math.round(
        groupRuns.reduce((sum, run) => sum + actionTotal(run.telemetry), 0) / totalRuns
      );
      const avgObserve = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.actions?.observe), 0) /
          totalRuns
      );
      const avgReroute = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.actions?.reroute), 0) /
          totalRuns
      );
      const avgStabilize = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.actions?.stabilize), 0) /
          totalRuns
      );
      const avgTrust = Math.round(
        groupRuns.reduce((sum, run) => sum + averageTrust(run.telemetry), 0) / totalRuns
      );
      const avgReckless = Math.round(
        groupRuns.reduce((sum, run) => sum + safeNumber(run.telemetry.actions?.reckless), 0) /
          totalRuns
      );
      const zeroActionRuns = groupRuns.filter((run) => actionTotal(run.telemetry) === 0).length;

      const actionTotals = {
        OBSERVE: groupRuns.reduce(
          (sum, run) => sum + safeNumber(run.telemetry.actions?.observe),
          0
        ),
        REROUTE: groupRuns.reduce(
          (sum, run) => sum + safeNumber(run.telemetry.actions?.reroute),
          0
        ),
        STABILIZE: groupRuns.reduce(
          (sum, run) => sum + safeNumber(run.telemetry.actions?.stabilize),
          0
        ),
      };

      const dominantAction = Object.entries(actionTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "NONE";

      const recommendation = recommendScenarioBalance({
        label,
        totalRuns,
        winRate,
        avgCycles,
        avgCascade,
        avgIntegrity,
        avgActions,
        avgReckless,
        zeroActionRuns,
        dominantAction,
      });

      return {
        key,
        label,
        totalRuns,
        wins,
        losses,
        winRate,
        avgCycles,
        avgScore,
        avgIntegrity,
        avgCascade,
        avgActions,
        avgObserve,
        avgReroute,
        avgStabilize,
        avgTrust,
        avgReckless,
        zeroActionRuns,
        dominantAction,
        recommendation: recommendation.recommendation,
        recommendationSeverity: recommendation.severity,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function statusColor(status: string | undefined) {
  if (status === "won") return "#86efac";
  if (status === "lost") return "#fb7185";
  return "#fbbf24";
}

function averageTrust(run: RunTelemetry) {
  const advisors = run.advisors ?? [];
  if (advisors.length === 0) return 0;

  return Math.round(
    advisors.reduce((sum, advisor) => sum + safeNumber(advisor.trust), 0) / advisors.length
  );
}

function actionTotal(run: RunTelemetry) {
  return safeNumber(run.actions?.total);
}

function mostUsedAction(run: RunTelemetry) {
  const ranked = [
    ["OBSERVE", safeNumber(run.actions?.observe)] as const,
    ["REROUTE", safeNumber(run.actions?.reroute)] as const,
    ["STABILIZE", safeNumber(run.actions?.stabilize)] as const,
  ].sort((a, b) => b[1] - a[1]);

  return ranked[0][1] > 0 ? ranked[0][0] : "NONE";
}

function criticalNodeCount(run: RunTelemetry) {
  return (run.nodes ?? []).filter((node) => node.state === "critical").length;
}

function analyze(runs: ImportedRun[]) {
  if (runs.length === 0) {
    return ["No runs loaded yet. Export JSON from /playable-v01, then import it here."];
  }

  const wins = runs.filter((run) => run.telemetry.status === "won").length;
  const losses = runs.filter((run) => run.telemetry.status === "lost").length;

  const avgCycles = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.cyclesSurvived), 0) / runs.length
  );

  const avgScore = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.score), 0) / runs.length
  );

  const avgCascade = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.finalState?.cascadeRisk), 0) /
      runs.length
  );

  const avgActions = Math.round(
    runs.reduce((sum, run) => sum + actionTotal(run.telemetry), 0) / runs.length
  );

  const notes = [
    `${runs.length} run${runs.length === 1 ? "" : "s"} loaded: ${wins} won, ${losses} lost.`,
    `Average cycles survived: ${avgCycles}. Average score: ${avgScore}.`,
    `Average committed actions: ${avgActions}. Average final cascade: ${avgCascade}%.`,
  ];

  if (runs.length >= 3 && losses / runs.length > 0.7) {
    notes.push("Balance note: loss rate is high. Consider softening critical growth or cascade penalties.");
  }

  if (runs.length >= 3 && wins / runs.length > 0.7) {
    notes.push("Balance note: win rate is high. Consider increasing late-cycle pressure.");
  }

  return notes;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  const escaped = text.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(csvCell).join(",");
  const bodyRows = rows.map((row) => headers.map((header) => csvCell(row[header])).join(","));

  return [headerRow, ...bodyRows].join("\n");
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const csv = toCsv(rows);
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.1 }}>
        {label}
      </div>
      <div style={{ color: "#f8fafc", fontSize: 14, marginTop: 3 }}>
        {value}
      </div>
    </div>
  );
}

function ScenarioSummaryCard({ summary }: { summary: ScenarioSummary }) {
  const winRate = summary.winRate;
  const balanceTone =
    summary.recommendationSeverity === "urgent"
      ? "Urgent tuning"
      : summary.recommendationSeverity === "tune"
        ? "Tune candidate"
        : "Watch";

  return (
    <article
      style={{
        border: "1px solid rgba(251,191,36,0.28)",
        background: "rgba(120,53,15,0.14)",
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              color: "#fde68a",
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            Scenario
          </div>
          <div style={{ color: "#f8fafc", fontSize: 17, marginTop: 4 }}>
            {summary.label}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
            {summary.totalRuns} run{summary.totalRuns === 1 ? "" : "s"} · {summary.wins}W /{" "}
            {summary.losses}L · {winRate}% win rate
          </div>
        </div>

        <div
          style={{
            color:
              summary.recommendationSeverity === "urgent"
                ? "#fb7185"
                : summary.recommendationSeverity === "tune"
                  ? "#fde68a"
                  : "#67e8f9",
            fontSize: 11,
            letterSpacing: 1.1,
            textAlign: "right",
            textTransform: "uppercase",
          }}
        >
          {balanceTone}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <Metric label="Avg Cycles" value={summary.avgCycles} />
        <Metric label="Avg Score" value={summary.avgScore} />
        <Metric label="Avg Actions" value={summary.avgActions} />
        <Metric label="Avg OBS" value={summary.avgObserve} />
        <Metric label="Avg RER" value={summary.avgReroute} />
        <Metric label="Avg STA" value={summary.avgStabilize} />
        <Metric label="Avg Integrity" value={summary.avgIntegrity + "%"} />
        <Metric label="Avg Cascade" value={summary.avgCascade + "%"} />
        <Metric label="Avg Trust" value={summary.avgTrust + "%"} />
        <Metric label="Avg Reckless" value={summary.avgReckless} />
        <Metric label="Zero-Action Runs" value={summary.zeroActionRuns} />
        <Metric label="Dominant Action" value={summary.dominantAction} />
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.18)",
          paddingTop: 10,
          color: "#cbd5e1",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        <div
          style={{
            color:
              summary.recommendationSeverity === "urgent"
                ? "#fb7185"
                : summary.recommendationSeverity === "tune"
                  ? "#fde68a"
                  : "#67e8f9",
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 5,
          }}
        >
          Tuning Recommendation
        </div>
        {summary.recommendation}
      </div>
    </article>
  );
}

function RunCard({ run }: { run: ImportedRun }) {
  const telemetry = run.telemetry;
  const scenario = telemetry.scenario?.label ?? "Unknown Scenario";
  const profile = telemetry.operatorProfile?.name ?? "Unclassified";
  const status = telemetry.status ?? "unknown";

  return (
    <article
      style={{
        border: "1px solid rgba(148,163,184,0.24)",
        background: "rgba(15,23,42,0.74)",
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              color: statusColor(status),
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            {status}
          </div>
          <div style={{ color: "#f8fafc", fontSize: 17, marginTop: 4 }}>
            {profile}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
            {scenario} · {run.filename}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.2 }}>
            SCORE
          </div>
          <div style={{ color: "#f8fafc", fontSize: 20 }}>
            {safeNumber(telemetry.score)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
        }}
      >
        <Metric label="Cycles" value={safeNumber(telemetry.cyclesSurvived)} />
        <Metric label="Integrity" value={safeNumber(telemetry.finalState?.integrity) + "%"} />
        <Metric label="Cascade" value={safeNumber(telemetry.finalState?.cascadeRisk) + "%"} />
        <Metric label="Trust" value={averageTrust(telemetry) + "%"} />
        <Metric label="Actions" value={actionTotal(telemetry)} />
        <Metric label="Main Action" value={mostUsedAction(telemetry)} />
        <Metric label="Reckless" value={safeNumber(telemetry.actions?.reckless)} />
        <Metric label="Critical Nodes" value={criticalNodeCount(telemetry)} />
      </div>

      {actionTotal(telemetry) === 0 && (
        <div
          style={{
            border: "1px solid rgba(251,191,36,0.34)",
            background: "rgba(120,53,15,0.18)",
            borderRadius: 12,
            padding: 10,
            color: "#fde68a",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          Low-confidence telemetry: no committed actions recorded. Use this run cautiously for balance tuning.
        </div>
      )}

      <div
        style={{
          border: "1px solid rgba(103,232,249,0.2)",
          background: "rgba(8,47,73,0.14)",
          borderRadius: 12,
          padding: 10,
          display: "grid",
          gap: 8,
        }}
      >
        <div
          style={{
            color: "#67e8f9",
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          Action Breakdown
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
          }}
        >
          <Metric label="Observe" value={safeNumber(telemetry.actions?.observe)} />
          <Metric label="Reroute" value={safeNumber(telemetry.actions?.reroute)} />
          <Metric label="Stabilize" value={safeNumber(telemetry.actions?.stabilize)} />
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.18)",
          paddingTop: 10,
          color: "#94a3b8",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        {telemetry.operatorProfile?.summary ?? "No profile summary available."}
      </div>
    </article>
  );
}

export default function PlaytestRunsPage() {
  const [runs, setRuns] = useState<ImportedRun[]>([]);
  const [hasHydratedRuns, setHasHydratedRuns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [scenarioFilter, setScenarioFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RUN_STORAGE_KEY);

      if (!raw) {
        setHasHydratedRuns(true);
        return;
      }

      const parsed = JSON.parse(raw) as ImportedRun[];

      if (Array.isArray(parsed)) {
        setRuns(parsed);
      }
    } catch {
      setError("Saved playtest runs could not be restored. Clear saved runs and re-import JSON files.");
    } finally {
      setHasHydratedRuns(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedRuns) return;

    try {
      window.localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify(runs));
    } catch {
      setError("Could not save imported runs locally. Browser storage may be full or unavailable.");
    }
  }, [hasHydratedRuns, runs]);

  const scenarioOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const run of runs) {
      const id = run.telemetry.scenario?.id ?? "unknown";
      const label = run.telemetry.scenario?.label ?? "Unknown Scenario";
      options.set(id, label);
    }

    return Array.from(options.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [runs]);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const scenarioId = run.telemetry.scenario?.id ?? "unknown";
      const status = run.telemetry.status ?? "unknown";
      const lowConfidence = actionTotal(run.telemetry) === 0;

      if (scenarioFilter !== "all" && scenarioId !== scenarioFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (confidenceFilter === "exclude_low" && lowConfidence) return false;
      if (confidenceFilter === "only_low" && !lowConfidence) return false;

      return true;
    });
  }, [confidenceFilter, runs, scenarioFilter, statusFilter]);

  const sortedRuns = useMemo(() => {
    return [...filteredRuns].sort(
      (a, b) => safeNumber(b.telemetry.score) - safeNumber(a.telemetry.score)
    );
  }, [filteredRuns]);

  const scenarioSummaries = useMemo(() => summarizeByScenario(sortedRuns), [sortedRuns]);

  const notes = useMemo(() => analyze(sortedRuns), [sortedRuns]);

  const reviewExportPayload = useMemo(() => {
    return {
      schemaVersion: "under-control.playtest-review.v0.1",
      exportedAt: new Date().toISOString(),
      route: "/playtest-runs",
      runCount: sortedRuns.length,
      totalImportedRunCount: runs.length,
      filters: {
        scenario: scenarioFilter,
        status: statusFilter,
        confidence: confidenceFilter,
      },
      balanceNotes: notes,
      scenarioSummaries,
      scenarioRecommendations: scenarioSummaries.map((summary) => ({
        scenario: summary.label,
        severity: summary.recommendationSeverity,
        recommendation: summary.recommendation,
        winRate: summary.winRate,
        avgCycles: summary.avgCycles,
        avgCascade: summary.avgCascade,
        avgActions: summary.avgActions,
        avgObserve: summary.avgObserve,
        avgReroute: summary.avgReroute,
        avgStabilize: summary.avgStabilize,
        zeroActionRuns: summary.zeroActionRuns,
        dominantAction: summary.dominantAction,
      })),
      importedRuns: sortedRuns.map((run) => ({
        id: run.id,
        filename: run.filename,
        importedAt: run.importedAt,
        status: run.telemetry.status ?? "unknown",
        scenario: run.telemetry.scenario ?? null,
        score: safeNumber(run.telemetry.score),
        cyclesSurvived: safeNumber(run.telemetry.cyclesSurvived),
        operatorProfile: run.telemetry.operatorProfile ?? null,
        finalState: run.telemetry.finalState ?? null,
        actions: run.telemetry.actions ?? null,
        averageAdvisorTrust: averageTrust(run.telemetry),
        criticalNodeCount: criticalNodeCount(run.telemetry),
        mostUsedAction: mostUsedAction(run.telemetry),
      })),
    };
  }, [confidenceFilter, notes, runs.length, scenarioFilter, scenarioSummaries, sortedRuns, statusFilter]);

  const reviewExportFilename =
    "under-control-playtest-review-" +
    new Date().toISOString().replace(/[:.]/g, "-") +
    ".json";

  const runCsvRows = useMemo(() => {
    return sortedRuns.map((run) => {
      const telemetry = run.telemetry;

      return {
        filename: run.filename,
        importedAt: run.importedAt,
        exportedAt: telemetry.exportedAt ?? "",
        status: telemetry.status ?? "unknown",
        scenarioId: telemetry.scenario?.id ?? "unknown",
        scenarioLabel: telemetry.scenario?.label ?? "Unknown Scenario",
        score: safeNumber(telemetry.score),
        cyclesSurvived: safeNumber(telemetry.cyclesSurvived),
        cycleReached: safeNumber(telemetry.cycleReached),
        maxCycles: safeNumber(telemetry.maxCycles),
        integrity: safeNumber(telemetry.finalState?.integrity),
        pressure: safeNumber(telemetry.finalState?.pressure),
        cascadeRisk: safeNumber(telemetry.finalState?.cascadeRisk),
        cascadeBreaches: safeNumber(telemetry.finalState?.cascadeBreaches),
        actionsTotal: actionTotal(telemetry),
        observe: safeNumber(telemetry.actions?.observe),
        reroute: safeNumber(telemetry.actions?.reroute),
        stabilize: safeNumber(telemetry.actions?.stabilize),
        reckless: safeNumber(telemetry.actions?.reckless),
        observedBeforeCriticalAction: safeNumber(telemetry.actions?.observedBeforeCriticalAction),
        averageAdvisorTrust: averageTrust(telemetry),
        criticalNodeCount: criticalNodeCount(telemetry),
        mostUsedAction: mostUsedAction(telemetry),
        lowConfidence: actionTotal(telemetry) === 0,
        operatorProfile: telemetry.operatorProfile?.name ?? "Unclassified",
        operatorProfileSummary: telemetry.operatorProfile?.summary ?? "",
      };
    });
  }, [sortedRuns]);

  const scenarioCsvRows = useMemo(() => {
    return scenarioSummaries.map((summary) => ({
      scenario: summary.label,
      totalRuns: summary.totalRuns,
      wins: summary.wins,
      losses: summary.losses,
      winRate: summary.winRate,
      avgCycles: summary.avgCycles,
      avgScore: summary.avgScore,
      avgIntegrity: summary.avgIntegrity,
      avgCascade: summary.avgCascade,
      avgActions: summary.avgActions,
      avgObserve: summary.avgObserve,
      avgReroute: summary.avgReroute,
      avgStabilize: summary.avgStabilize,
      avgTrust: summary.avgTrust,
      avgReckless: summary.avgReckless,
      zeroActionRuns: summary.zeroActionRuns,
      dominantAction: summary.dominantAction,
      recommendationSeverity: summary.recommendationSeverity,
      recommendation: summary.recommendation,
    }));
  }, [scenarioSummaries]);

  const csvTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runCsvFilename = "under-control-runs-" + csvTimestamp + ".csv";
  const scenarioCsvFilename = "under-control-scenarios-" + csvTimestamp + ".csv";

  async function importFiles(files: FileList | File[]) {
    setError(null);
    setMessage(null);

    const fileArray = Array.from(files).filter((file) => file.name.endsWith(".json"));

    if (fileArray.length === 0) {
      setError("No JSON files selected. Export a run from /playable-v01 first.");
      return;
    }

    const imported: ImportedRun[] = [];
    const failed: string[] = [];

    for (const file of fileArray) {
      try {
        const text = await file.text();
        const telemetry = JSON.parse(text) as RunTelemetry;

        imported.push({
          id: file.name + "-" + Date.now() + "-" + Math.random().toString(16).slice(2),
          filename: file.name,
          importedAt: new Date().toISOString(),
          telemetry,
        });
      } catch {
        failed.push(file.name);
      }
    }

    if (imported.length > 0) {
      setRuns((current) => [...imported, ...current]);
      setMessage(`Imported ${imported.length} run${imported.length === 1 ? "" : "s"}.`);
    }

    if (failed.length > 0) {
      setError(`Could not import: ${failed.join(", ")}.`);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, rgba(14,116,144,0.12), transparent 32%), #020617",
        color: "#f8fafc",
        padding: 22,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 16 }}>
        <header
          style={{
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(2,6,23,0.72)",
            borderRadius: 20,
            padding: 18,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 24, letterSpacing: 4 }}>
              PLAYTEST RUNS
            </div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
              Import exported Under Control run JSON files and compare balance patterns.
            </div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
              Export from <strong>/playable-v01</strong>, then import the downloaded JSON here.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="/playable-v01"
              style={{
                border: "1px solid rgba(251,191,36,0.42)",
                background: "rgba(120,53,15,0.26)",
                color: "#fde68a",
                borderRadius: 14,
                padding: "12px 14px",
                textDecoration: "none",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              OPEN PLAYABLE
            </a>

            <label
              style={{
                border: "1px solid rgba(103,232,249,0.5)",
                background: "rgba(8,47,73,0.45)",
                color: "#cffafe",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: "pointer",
                letterSpacing: 1.3,
                fontSize: 12,
              }}
            >
              IMPORT RUN JSON
              <input
                type="file"
                accept="application/json,.json"
                multiple
                onChange={(event) => {
                  if (event.currentTarget.files) {
                    importFiles(event.currentTarget.files);
                    event.currentTarget.value = "";
                  }
                }}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </label>

            <button
              type="button"
              onClick={() => downloadJson(reviewExportFilename, reviewExportPayload)}
              disabled={runs.length === 0}
              style={{
                border: "1px solid rgba(251,191,36,0.44)",
                background: "rgba(120,53,15,0.28)",
                color: runs.length === 0 ? "#64748b" : "#fde68a",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: runs.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              EXPORT REVIEW JSON
            </button>

            <button
              type="button"
              onClick={() => downloadCsv(runCsvFilename, runCsvRows)}
              disabled={runs.length === 0}
              style={{
                border: "1px solid rgba(103,232,249,0.44)",
                background: "rgba(8,47,73,0.34)",
                color: runs.length === 0 ? "#64748b" : "#cffafe",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: runs.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              EXPORT RUNS CSV
            </button>

            <button
              type="button"
              onClick={() => downloadCsv(scenarioCsvFilename, scenarioCsvRows)}
              disabled={runs.length === 0}
              style={{
                border: "1px solid rgba(103,232,249,0.44)",
                background: "rgba(8,47,73,0.34)",
                color: runs.length === 0 ? "#64748b" : "#cffafe",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: runs.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              EXPORT SCENARIOS CSV
            </button>

            <button
              type="button"
              onClick={() => {
                setRuns([]);
                setMessage("Cleared imported runs from this browser.");
                setError(null);
                window.localStorage.removeItem(RUN_STORAGE_KEY);
              }}
              disabled={runs.length === 0}
              style={{
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(15,23,42,0.6)",
                color: runs.length === 0 ? "#64748b" : "#cbd5e1",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: runs.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              CLEAR
            </button>
          </div>
        </header>

        <section
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            importFiles(event.dataTransfer.files);
          }}
          style={{
            border:
              "1px dashed " +
              (dragActive ? "rgba(103,232,249,0.9)" : "rgba(103,232,249,0.38)"),
            background: dragActive ? "rgba(8,47,73,0.42)" : "rgba(8,47,73,0.18)",
            borderRadius: 20,
            padding: 18,
            color: "#cbd5e1",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Drag exported run JSON files here, or click <strong>IMPORT RUN JSON</strong>. Loaded runs:{" "}
          <strong>{runs.length}</strong>. Imported runs persist in this browser.
        </section>

        <section
          style={{
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(15,23,42,0.52)",
            borderRadius: 20,
            padding: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.2, marginBottom: 6 }}>
              SCENARIO
            </div>
            <select
              value={scenarioFilter}
              onChange={(event) => setScenarioFilter(event.currentTarget.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(2,6,23,0.82)",
                color: "#e2e8f0",
                borderRadius: 12,
                padding: "10px 11px",
                fontSize: 12,
              }}
            >
              <option value="all">All scenarios</option>
              {scenarioOptions.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.2, marginBottom: 6 }}>
              STATUS
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.currentTarget.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(2,6,23,0.82)",
                color: "#e2e8f0",
                borderRadius: 12,
                padding: "10px 11px",
                fontSize: 12,
              }}
            >
              <option value="all">All statuses</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          <div>
            <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.2, marginBottom: 6 }}>
              CONFIDENCE
            </div>
            <select
              value={confidenceFilter}
              onChange={(event) => setConfidenceFilter(event.currentTarget.value)}
              style={{
                width: "100%",
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(2,6,23,0.82)",
                color: "#e2e8f0",
                borderRadius: 12,
                padding: "10px 11px",
                fontSize: 12,
              }}
            >
              <option value="all">All runs</option>
              <option value="exclude_low">Exclude low-confidence</option>
              <option value="only_low">Only low-confidence</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setScenarioFilter("all");
              setStatusFilter("all");
              setConfidenceFilter("all");
            }}
            style={{
              border: "1px solid rgba(148,163,184,0.28)",
              background: "rgba(15,23,42,0.6)",
              color: "#cbd5e1",
              borderRadius: 12,
              padding: "10px 12px",
              cursor: "pointer",
              letterSpacing: 1.1,
              fontSize: 12,
            }}
          >
            RESET FILTERS
          </button>

          <div
            style={{
              gridColumn: "1 / -1",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Showing <strong style={{ color: "#cbd5e1" }}>{sortedRuns.length}</strong> of{" "}
            <strong style={{ color: "#cbd5e1" }}>{runs.length}</strong> imported runs.
          </div>
        </section>

        {message && (
          <section
            style={{
              border: "1px solid rgba(134,239,172,0.36)",
              background: "rgba(20,83,45,0.22)",
              borderRadius: 16,
              padding: 14,
              color: "#bbf7d0",
              fontSize: 13,
            }}
          >
            {message}
          </section>
        )}

        {error && (
          <section
            style={{
              border: "1px solid rgba(251,113,133,0.45)",
              background: "rgba(127,29,29,0.22)",
              borderRadius: 16,
              padding: 14,
              color: "#fecdd3",
              fontSize: 13,
            }}
          >
            {error}
          </section>
        )}

        <section
          style={{
            border: "1px solid rgba(251,191,36,0.32)",
            background: "rgba(120,53,15,0.14)",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <div
            style={{
              color: "#fde68a",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Balance Notes
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {notes.map((note) => (
              <div key={note} style={{ color: "#e2e8f0", fontSize: 13 }}>
                {note}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            border: "1px solid rgba(103,232,249,0.24)",
            background: "rgba(8,47,73,0.12)",
            borderRadius: 20,
            padding: 16,
            display: "grid",
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                color: "#67e8f9",
                fontSize: 12,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Scenario Comparison
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 5 }}>
              Grouped run outcomes by seeded scenario.
            </div>
          </div>

          {scenarioSummaries.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>
              Import runs from different scenarios to compare balance.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 12,
              }}
            >
              {scenarioSummaries.map((summary) => (
                <ScenarioSummaryCard summary={summary} key={summary.key} />
              ))}
            </div>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 14,
          }}
        >
          {sortedRuns.map((run) => (
            <RunCard run={run} key={run.id} />
          ))}
        </section>
      </section>
    </main>
  );
}
