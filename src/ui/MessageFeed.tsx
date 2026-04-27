export function MessageFeed({ messages }: any) {
  return (
    <section className="mb-3 space-y-2">
      {messages.slice(-4).map((message: any) => (
        <div
          key={message.id}
          className="rounded-md border border-[#1F2630] bg-[#10141A] p-3"
        >
          <div className="mb-1 text-[11px] uppercase tracking-widest text-[#8A93A3]">
            {message.name} — {message.role}
          </div>
          <div className="text-sm">{message.text}</div>
        </div>
      ))}
    </section>
  );
}
