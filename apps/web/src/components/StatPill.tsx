interface StatPillProps {
  label: string;
  value: string | number;
}

export const StatPill = ({ label, value }: StatPillProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
    <p className="mt-1 text-2xl font-black">{value}</p>
  </div>
);
