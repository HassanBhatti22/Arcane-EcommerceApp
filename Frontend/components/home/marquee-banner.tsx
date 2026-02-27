export function MarqueeBanner() {
  const text = "NEW ARRIVALS \u00B7 FREE SHIPPING OVER $100 \u00B7 30-DAY RETURNS \u00B7 EXCLUSIVE ONLINE DEALS \u00B7 ";
  const repeated = text.repeat(4);

  return (
    <div className="bg-foreground text-background py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-xs uppercase tracking-[0.3em] font-bold">
          {repeated}
        </span>
        <span className="text-xs uppercase tracking-[0.3em] font-bold" aria-hidden="true">
          {repeated}
        </span>
      </div>
    </div>
  );
}
