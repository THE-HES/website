// ── Hero slideshow + scroll cue ───────────────────────────────────

const Hero = () => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = HERO_SLIDES;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const heroHeight = 'min(78vh, 720px)';

  return (
    <div
      className="relative"
      style={{ height: heroHeight }}
      data-screen-label="Hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Section (clipped) ───────────────────────────── */}
      <section className="relative w-full h-full overflow-hidden bg-[color:var(--hes-blue-dark)]">

        {/* Slide backgrounds (crossfade) */}
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
            style={{ opacity: i === idx ? 1 : 0 }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${s.photo})`,
                transform: i === idx ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 8s ease-out',
              }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(95deg, rgba(13,16,112,0.92) 0%, rgba(26,31,143,0.72) 45%, rgba(13,16,112,0.2) 100%)'
            }} />
            <div
              className="absolute top-0 right-0 w-[280px] h-[280px] opacity-30 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
            />
          </div>
        ))}

        {/* ── Text content — centred vertically, full width safe ── */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full max-w-[1480px] mx-auto px-8">
            {/*
              CSS-grid stacking trick: every slide occupies [1/1] so they
              overlap; the grid grows to the tallest slide's natural height.
              No hard-coded heights, no overflow, works at any viewport width.
            */}
            <div className="grid" style={{ maxWidth: '640px' }}>
              {slides.map((s, i) => (
                <div
                  key={i}
                  className="[grid-area:1/1] text-white transition-all duration-700 ease-out pointer-events-auto"
                  style={{
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx ? 'translateY(0)' : 'translateY(20px)',
                    pointerEvents: i === idx ? 'auto' : 'none',
                  }}
                >
                  <div className="font-display font-bold uppercase tracking-[0.16em] text-[13px] text-[color:var(--hes-yellow)] mb-5">
                    {s.eyebrow}
                  </div>
                  <h1 className="font-display font-extrabold uppercase text-white leading-[0.95] text-[clamp(44px,5.8vw,84px)] mb-6">
                    {s.headline.map((line, li) => (
                      <span key={li} className="block">
                        {li === 1 ? <span className="text-[color:var(--hes-yellow)]">{line}</span> : line}
                      </span>
                    ))}
                  </h1>
                  <p className="text-[17px] leading-relaxed text-white/85 max-w-[480px] mb-8">
                    {s.body}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href={s.primaryCta.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue-mid)] text-white font-display font-bold uppercase tracking-wide text-[14px] transition-all hover:translate-x-0.5 ring-1 ring-white/20">
                      {s.primaryCta.label}
                      <IconArrowR width="14" height="14" />
                    </a>
                    <a href={s.secondaryCta.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-display font-bold uppercase tracking-wide text-[14px] transition-all ring-1 ring-white/30">
                      {s.secondaryCta.label}
                      <IconArrowR width="14" height="14" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className="h-[3px] transition-all duration-500"
                style={{
                  width: i === idx ? 56 : 24,
                  background: i === idx ? 'var(--hes-yellow)' : 'rgba(255,255,255,0.4)',
                }}
              />
            </button>
          ))}
        </div>

      </section>

      {/* ── Scroll cue — outside clipped section so it straddles the boundary ── */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight * 0.78, behavior: 'smooth' })}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-[color:var(--hes-yellow)] grid place-items-center text-[color:var(--hes-blue)] shadow-lg hover:bg-white transition-colors z-20"
        aria-label="Scroll down"
      >
        <IconChevron width="22" height="22" />
      </button>
    </div>
  );
};

Object.assign(window, { Hero });
