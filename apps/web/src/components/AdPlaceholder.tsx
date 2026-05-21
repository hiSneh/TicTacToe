export const AdPlaceholder = ({ label = 'Ad slot reserved' }: { label?: string }) => (
  <aside className="rounded-2xl border border-dashed border-white/18 bg-white/[0.04] px-4 py-5 text-center text-sm text-white/45">
    {label}
  </aside>
);
