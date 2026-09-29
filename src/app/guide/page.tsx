import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  children: ReactNode;
};

type CardProps = {
  title: string;
  body: string;
};

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-5 py-6 text-[var(--ink)]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">
            Under Control
          </div>
          <h1 className="text-3xl font-bold">Field Guide</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Keep the system viable by balancing pressure, signal, integrity, and drift.
          </p>
        </div>

        <Section title="Core Actions">
          <Card title="STABILIZE" body="Improves integrity and reduces drift, but load usually rises while you buy time." />
          <Card title="REROUTE" body="Reduces load quickly, but adds drift and can weaken integrity. Strong short-term, risky if repeated." />
          <Card title="OBSERVE" body="Improves signal clarity, but the system keeps moving while you wait. Useful early, dangerous when load is high." />
        </Section>

        <Section title="System Signals">
          <Card title="Load" body="How much pressure the system is carrying. If it reaches capacity, control is lost." />
          <Card title="Integrity" body="How structurally healthy the system is. Low integrity makes recovery harder." />
          <Card title="Signal" body="How reliable your information is. Low signal makes action timing harder." />
          <Card title="Drift" body="Hidden instability from prior decisions. High drift can make reasonable actions fail later." />
          <Card title="Pressure" body="A composite warning from load, drift, and integrity. High pressure means the window for safe action is narrowing." />
        </Section>

        <Section title="Coworkers">
          <Card title="Elena — Signal" body="Focuses on clarity and information quality. She tends to recommend OBSERVE when signal is weak." />
          <Card title="Mara — Infrastructure" body="Focuses on system integrity and stability. She tends to recommend STABILIZE when structure is weakening." />
          <Card title="Ishaan — Risk" body="Focuses on downside exposure. He tends to warn when drift or load makes the path unsafe." />
        </Section>

        <Section title="How to Think">
          <Card title="No action is always right" body="Each action solves one problem while worsening another. The right move depends on timing." />
          <Card title="Trust is contextual" body="Coworkers earn or lose trust based on whether their advice helps within their domain." />
          <Card title="Failure is traceable" body="After each run, use the report and timeline to see where the system crossed into danger." />
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs uppercase tracking-widest text-[var(--ink-muted)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Card({ title, body }: CardProps) {
  return (
    <div className="rounded-lg border border-[var(--rule-strong)] bg-[var(--paper)] p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">{body}</p>
    </div>
  );
}
