type TickerProps = { items: string[] };

export default function Ticker({ items }: TickerProps) {
  // Four copies so the loop is seamless at any viewport width
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className="ticker-wrapper overflow-hidden border-y hairline py-3 md:py-4 select-none">
      <div className="ticker-track">
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-5 md:gap-10 px-3 md:px-5">
            <span className="display-italic text-copper text-sm md:text-xl">/</span>
            <span className="eyebrow text-cream/80 text-[9px] md:text-[11px] tracking-widest">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
