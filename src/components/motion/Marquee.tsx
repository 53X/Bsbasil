const ITEMS = ['Rompers', 'Sets', 'Sleepwear', 'Winter wear', 'Accessories'];

export default function Marquee({ items = ITEMS }: { items?: string[] }) {
  const row = (copy: string, hidden = false) => (
    <div className="flex shrink-0 gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="flex items-center gap-10 text-xs font-semibold uppercase tracking-[0.22em]">
          {item}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#62A848]" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-[#62A848]/30 bg-[#122117] text-[#F6F3EA]" role="region" aria-label="Bsbasil promises">
      <div className="marquee-track flex w-max py-3.5">
        {row('a')}
        {row('b', true)}
      </div>
    </div>
  );
}
