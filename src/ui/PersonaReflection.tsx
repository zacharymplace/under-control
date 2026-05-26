type PersonaReflectionValue = {
  elena?: string;
  mara?: string;
  ishaan?: string;
};

export default function PersonaReflection({
  reflection,
}: {
  reflection: PersonaReflectionValue | null | undefined;
}) {
  if (!reflection) return null;

  return (
    <section className="mt-6 rounded-lg border border-[#2A313A] bg-[#12161C] p-5">
      <h3 className="text-sm text-gray-400 mb-3">FOOD FOR THOUGHT</h3>

      <div className="space-y-2 text-sm text-gray-200">
        <p><strong>Elena:</strong> {reflection.elena}</p>
        <p><strong>Mara:</strong> {reflection.mara}</p>
        <p><strong>Ishaan:</strong> {reflection.ishaan}</p>
      </div>
    </section>
  );
}
