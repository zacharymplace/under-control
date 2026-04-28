import { ActionBar } from "./ActionBar";
import { FeedbackPanel } from "./FeedbackPanel";
import { MessageFeed } from "./MessageFeed";
import { SystemPanel } from "./SystemPanel";
import { TrustBar } from "./TrustBar";
import { RunReport } from "./RunReport";
import { getActionHints } from "@/game/decisionHints";
import { getPersonaRecommendations } from "@/game/personaEngine";

export function GameScreen({ game, onAction, onReset, bestTurn }: any) {
  const terminal = game.state === "FAILED" || game.state === "STABILIZED";
  const displayBest = Math.max(bestTurn, game.turn);

  const hints = terminal ? {} : getActionHints(game);
  const personas = getPersonaRecommendations(game);

  return (
    <main className="min-h-screen px-5 py-6 text-[#E6EAF0] bg-[#0B0D10]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
          <div>State: {game.state}</div>
          <div>Pressure: {game.pressure}</div>
          <div>Turn: {game.turn}</div>
        </div>

        <div className="mb-3 text-xs uppercase tracking-widest text-[#8A93A3]">
          Best Run: {displayBest}
        </div>

        <TrustBar trust={game.trust || {}} />

        <SystemPanel game={game} />
        <MessageFeed personas={personas} />
        <ActionBar onAction={onAction} disabled={terminal} hints={hints} personas={personas} />
        <FeedbackPanel feedback={game.feedback} summary={game.summary} />
        <RunReport game={game} />

        {game.runInsight && (
          <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
            <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
              Run Insight
            </div>
            <h2 className="mb-1 font-bold">{game.runInsight.title}</h2>
            <p className="text-sm text-[#8A93A3]">{game.runInsight.text}</p>
          </section>
        )}

        {terminal && (
          <button
            onClick={onReset}
            className="mt-4 w-full border border-[#2A313A] bg-[#1A1F26] py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#222A34]"
          >
            {game.state === "STABILIZED" ? "Run Again" : "Try Again"}
          </button>
        )}
      </div>
    </main>
  );
}
