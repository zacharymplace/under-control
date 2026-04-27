import { ActionBar } from "./ActionBar";
import { FeedbackPanel } from "./FeedbackPanel";
import { MessageFeed } from "./MessageFeed";
import { SystemPanel } from "./SystemPanel";

export function GameScreen({ game, onAction, onReset, bestTurn }: any) {
  const terminal = game.state === "FAILED" || game.state === "STABILIZED";

  return (
    <main className="min-h-screen px-5 py-6 text-[#E6EAF0] bg-[#0B0D10]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
          <div>State: {game.state}</div>
          <div>Pressure: {game.pressure}</div>
          <div>Turn: {game.turn}</div>
        </div>

        <div className="mb-3 text-xs uppercase tracking-widest text-[#8A93A3]">
          Best Run: {bestTurn}
        </div>

        <SystemPanel game={game} />
        <MessageFeed messages={game.messages} />
        <ActionBar onAction={onAction} disabled={terminal} />
        <FeedbackPanel feedback={game.feedback} summary={game.summary} />

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
