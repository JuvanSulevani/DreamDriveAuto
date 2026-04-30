type TickerProps = { items: string[] };

export default function Ticker({ items }: TickerProps) {
  const all = [...items, ...items];
  return (
    <div className="overflow-hidden border-y hairline py-4 select-none">
      <div className="ticker-track gap-12 whitespace-nowrap">
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="display-italic text-copper text-2xl">/</span>
            <span className="eyebrow text-cream/80 text-xs">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
