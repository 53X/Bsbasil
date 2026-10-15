const ITEMS = ['Rompers', 'Sets', 'Sleepwear', 'Winter wear', 'Accessories'];

export default function Marquee({
  items = ITEMS,
  label = 'Bsbasil promises',
}: {
  items?: string[];
  label?: string;
}) {
  const row = (copy: string, hidden = false) => (
    <div className="flex shrink-0 gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <span key={`${copy}-${index}`} className="flex items-center gap-10 text-xs font-semibold uppercase tracking-[0.22em]">
          {item}
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#122117]" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden border-y border-[#122117]/20 bg-[#62A848] text-[#122117]" role="region" aria-label={label}>
      <div className="marquee-track flex w-max py-3.5">
        {row('a')}
        {row('b', true)}
      </div>
    </div>
  );
}
