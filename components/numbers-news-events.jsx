// ── "H.E.S. by the Numbers" + Impact cards (blue band) ────────────

const ByTheNumbers = () => (
  <section className="bg-[color:var(--hes-off-white)] pb-24" data-screen-label="By the Numbers">
    <div className="max-w-[1180px] mx-auto px-8">
      <div
        className="relative bg-[color:var(--hes-blue)] py-16 px-8 lg:px-16 overflow-hidden rounded-2xl"
        data-screen-label="Stats Block"
      >
        {/* Halftone decoration */}
        <div
          className="absolute top-0 right-0 w-[240px] h-[240px] opacity-25 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[200px] h-[200px] opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
        />

        {/* Headline */}
        <div className="relative text-center mb-10">
          <h2 className="font-display font-extrabold text-white text-[44px] leading-[1.05] mb-3">
            H.E.S. by the numbers
          </h2>
          <a href="#" className="inline-flex items-center gap-1.5 text-[color:var(--hes-yellow)] font-display font-bold text-[15px] hover:underline">
            About H.E.S.
            <IconArrowR width="14" height="14" />
          </a>
        </div>

        {/* Stats */}
        <div className="relative grid md:grid-cols-3 gap-5 mb-16">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="reveal bg-[color:var(--hes-blue-dark)] py-10 px-6 text-center relative rounded-xl"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[color:var(--hes-yellow)]" />
              <div className="font-display font-extrabold text-white text-[64px] leading-none mb-3">
                {s.num}
              </div>
              <div className="text-white/80 text-[14px] leading-snug max-w-[220px] mx-auto">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Impact */}
        <div className="relative text-center mb-10">
          <h3 className="font-display font-extrabold text-white text-[36px] leading-[1.05] mb-3">
            H.E.S. is YOUR community center.
          </h3>
          <p className="text-white/85 text-[16px] max-w-[600px] mx-auto leading-relaxed mb-5">
            Strengthening southeast Brooklyn for over a century through programs, services, and the people who show up every day.
          </p>
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--hes-yellow)] hover:bg-white text-[color:var(--hes-blue)] font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
            Become a Member
            <IconArrowR width="14" height="14" />
          </a>
        </div>

        {/* Impact cards */}
        <div className="relative grid md:grid-cols-3 gap-5">
          {IMPACT_CARDS.map((c, i) => (
            <div
              key={c.title}
              className="reveal bg-white shadow-lg overflow-hidden group cursor-pointer rounded-xl"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[4/3] bg-cover bg-center overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${c.photo})` }}
                />
              </div>
              <div className="p-5">
                <a href="#" className="block">
                  <h4 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[19px] mb-2 border-b-2 border-[color:var(--hes-yellow)] pb-1 inline-block">
                    {c.title}
                  </h4>
                  <p className="text-[13.5px] text-[color:var(--fg-secondary)] leading-relaxed mt-2">{c.body}</p>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ── News: 1 large + 2 stacked ─────────────────────────────────────
const News = () => (
  <section className="bg-white py-24" data-screen-label="News">
    <div className="max-w-[1180px] mx-auto px-8">
      <div className="text-center mb-12">
        <h2 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[44px] leading-[1.05] mb-4">
          What's happening at H.E.S.
        </h2>
        <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue-dark)] text-white font-display font-bold uppercase tracking-wide text-[13px] transition-colors">
          See All News
          <IconArrowR width="14" height="14" />
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Large featured */}
        {(() => {
          const n = NEWS[0];
          return (
            <a href="#" className="group block">
              <div className="relative aspect-[16/10] bg-cover bg-center overflow-hidden mb-4 shadow-md"
                style={{ backgroundImage: `url(${n.photo})` }}
              >
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${n.photo})` }}
                />
                <div className="absolute top-4 left-4 bg-[color:var(--hes-yellow)] text-[color:var(--hes-blue)] font-display font-extrabold uppercase tracking-wider text-[11px] px-3 py-1.5">
                  {n.tag}
                </div>
              </div>
              <h3 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[26px] leading-[1.15] mb-3 group-hover:underline">
                {n.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--fg-secondary)] font-semibold">
                <span>{n.date}</span>
                {n.categories.map(c => (
                  <span key={c} className="flex items-center gap-3 before:content-['|'] before:text-[color:var(--hes-yellow-dark)]">
                    {c}
                  </span>
                ))}
              </div>
            </a>
          );
        })()}

        {/* 2 stacked */}
        <div className="space-y-8">
          {NEWS.slice(1).map(n => (
            <a key={n.title} href="#" className="group flex gap-4 items-start">
              {n.photo && (
                <div
                  className="shrink-0 w-[120px] h-[84px] bg-cover bg-center overflow-hidden shadow-sm"
                  style={{ backgroundImage: `url(${n.photo})` }}
                />
              )}
              <div>
                <div className="inline-block bg-[color:var(--hes-yellow)] text-[color:var(--hes-blue)] font-display font-extrabold uppercase tracking-wider text-[11px] px-3 py-1.5 mb-3">
                  {n.tag}
                </div>
                <h3 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[20px] leading-[1.15] mb-2 group-hover:underline">
                  {n.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[color:var(--fg-secondary)] font-semibold">
                  <span>{n.date}</span>
                  {n.categories.map(c => (
                    <span key={c} className="flex items-center gap-3 before:content-['|'] before:text-[color:var(--hes-yellow-dark)]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// ── Upcoming Events row ───────────────────────────────────────────
const Events = () => (
  <section className="bg-[color:var(--hes-off-white)] py-20" data-screen-label="Events">
    <div className="max-w-[1180px] mx-auto px-8">
      <div className="text-center mb-10">
        <h2 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[44px] leading-[1.05] mb-2">
          Upcoming Events
        </h2>
        <p className="text-[15px] text-[color:var(--fg-secondary)] mb-5">
          See what's coming up at H.E.S. — open to the whole community.
        </p>
        <a href="#" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue-dark)] text-white font-display font-bold uppercase tracking-wide text-[13px] transition-colors">
          View All Events
          <IconArrowR width="14" height="14" />
        </a>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {EVENTS.map(e => (
          <a key={e.title} href="#" className="group flex items-start gap-4 p-2 hover:bg-white transition-colors rounded-sm">
            {/* Date block — yellow tab */}
            <div className="shrink-0 w-[70px] border-2 border-[color:var(--hes-blue)] bg-white overflow-hidden text-center rounded-lg">
              <div className="bg-[color:var(--hes-yellow)] text-[color:var(--hes-blue)] font-display font-extrabold text-[12px] uppercase tracking-wider py-1">
                {e.month}
              </div>
              <div className="font-display font-extrabold text-[color:var(--hes-blue)] text-[28px] leading-none py-2">
                {e.day}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[17px] leading-tight mb-1 group-hover:underline">
                {e.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[12px] text-[color:var(--hes-yellow-dark)] font-bold mb-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {e.time}
              </div>
              <div className="text-[12px] text-[color:var(--fg-secondary)]">{e.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

Object.assign(window, { ByTheNumbers, News, Events });
