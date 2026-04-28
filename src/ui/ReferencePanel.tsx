"use client";
import { useState } from "react";

export function ReferencePanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="uc-ref">
      <button className="uc-ref-toggle" onClick={() => setOpen(!open)}>
        {open ? "Hide Guide" : "Show Guide"}
      </button>

      {open && (
        <div className="uc-ref-body">
          <div className="uc-ref-col">
            <div className="uc-ref-title">Actions</div>
            <div className="uc-ref-item"><b>STABILIZE</b> — protects integrity & drift, may increase load</div>
            <div className="uc-ref-item"><b>REROUTE</b> — reduces load quickly, adds instability</div>
            <div className="uc-ref-item"><b>OBSERVE</b> — improves signal clarity, costs time</div>
          </div>

          <div className="uc-ref-col">
            <div className="uc-ref-title">Advisors</div>
            <div className="uc-ref-item"><b>ELENA (Signal)</b> — clarity; can withdraw under pressure</div>
            <div className="uc-ref-item"><b>MARA (Infrastructure)</b> — structure; can over-stabilize</div>
            <div className="uc-ref-item"><b>ISHAAN (Risk)</b> — downside; can over-warn</div>
          </div>

          <div className="uc-ref-col">
            <div className="uc-ref-title">Scoring</div>
            <div className="uc-ref-item">Score = state pressure × support × disagreement</div>
            <div className="uc-ref-item">Support = trust × confidence</div>
            <div className="uc-ref-item">Ignored advice reduces support over time</div>
          </div>

          <div className="uc-ref-col">
            <div className="uc-ref-title">Threat</div>
            <div className="uc-ref-item"><b>Normal</b> — advisors stable</div>
            <div className="uc-ref-item"><b>High</b> — bias begins</div>
            <div className="uc-ref-item"><b>Critical</b> — distortion + conflict</div>
          </div>
        </div>
      )}
    </section>
  );
}
