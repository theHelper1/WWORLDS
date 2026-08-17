export function BudgetRing({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const dash = circ - (pct / 100) * circ;

  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e8dfd0" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#6f7f68"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Spent</p>
        <p className="font-serif text-3xl">{Math.round(pct)}%</p>
      </div>
    </div>
  );
}
