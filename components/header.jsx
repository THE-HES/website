// ── Header: top utility bar + main nav with mega-menu dropdowns ───
const { useState, useEffect, useRef } = React;

// ── Icons (inline SVG, stroke-based, Lucide-style) ────────────────
const Icon = ({ d, size = 18, stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IconCalendar = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
const IconHeart    = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.5-1.4 3-3.5 3-5.5C22 5 19 3 16.5 3 14.5 3 13 4 12 5.5 11 4 9.5 3 7.5 3 5 3 2 5 2 8.5c0 2 1.5 4.1 3 5.5l7 7Z" /></svg>;
const IconUser     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconKey      = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></svg>;
const IconSearch   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
const IconMenu     = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IconChevron  = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
const IconArrowR   = (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

// ── Top utility bar ───────────────────────────────────────────────
const TopBar = () => (
  <div className="bg-[color:var(--hes-blue-dark)] text-white/85 text-[13px]">
    <div className="max-w-[1480px] mx-auto px-8 flex justify-end items-center gap-7 h-[40px]">
      {[
        { label: "Calendars",    Icon: IconCalendar },
        { label: "News & Events", Icon: IconCalendar },
        { label: "Donate",       Icon: IconHeart },
        { label: "Member Login", Icon: IconKey },
      ].map(({ label, Icon: I }) => (
        <a key={label} href="#" className="flex items-center gap-1.5 hover:text-[color:var(--hes-yellow)] transition-colors">
          <I width="14" height="14" />
          <span className="font-semibold tracking-wide">{label}</span>
        </a>
      ))}
    </div>
  </div>
);

// ── Mega menu drawer (shared between hover and click) ─────────────
const MegaMenu = ({ items }) => (
  <div className="absolute left-0 right-0 top-full bg-white shadow-[0_24px_40px_-12px_rgba(13,16,112,0.25)] border-t border-[color:var(--hes-yellow)]/50">
    <div className="max-w-[1480px] mx-auto px-8 py-10 grid grid-cols-3 gap-10">
      {items.map(col => (
        <div key={col.col}>
          <div className="font-display uppercase tracking-wider text-[12px] text-[color:var(--hes-yellow-dark)] font-bold mb-4 pb-2 border-b-2 border-[color:var(--hes-yellow)]/40">
            {col.col}
          </div>
          <ul className="space-y-2.5">
            {col.links.map(l => (
              <li key={l}>
                <a href="#" className="group inline-flex items-center gap-1.5 text-[14px] text-[color:var(--hes-blue-dark)] font-semibold hover:text-[color:var(--hes-blue)] hover:translate-x-0.5 transition-transform">
                  <span className="border-b border-transparent group-hover:border-[color:var(--hes-yellow)]">{l}</span>
                  <IconArrowR width="12" height="12" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// ── Main nav ──────────────────────────────────────────────────────
const Nav = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openMenu = (idx) => {
    clearTimeout(closeTimer.current);
    setOpenIdx(idx);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpenIdx(null), 120);
  };

  return (
    <nav
      className={`relative bg-[color:var(--hes-blue)] transition-shadow ${scrolled ? 'shadow-lg' : ''}`}
      onMouseLeave={scheduleClose}
    >
      <div className="max-w-[1480px] mx-auto px-8 flex items-center gap-8 h-[96px]">
        {/* Logo */}
        <a href="#" className="flex items-center shrink-0" aria-label="H.E.S. — Hebrew Educational Society — Home">
          <img
            src="assets/hes-logo-white.png"
            alt="Hebrew Educational Society"
            className="h-[70px] w-auto block"
          />
        </a>

        {/* Center nav links — hidden on tablet, shown on desktop */}
        <ul className="hidden xl:flex flex-1 justify-center items-center gap-0.5">
          <li>
            <a href="#" className="inline-flex items-center gap-1 px-3 py-2.5 rounded text-white font-display font-bold text-[14px] uppercase tracking-wide hover:bg-white/10 transition-colors">
              Register
            </a>
          </li>
          <li>
            <a href="#" className="inline-flex items-center gap-1 px-3 py-2.5 rounded text-white font-display font-bold text-[14px] uppercase tracking-wide hover:bg-white/10 transition-colors">
              Visit
            </a>
          </li>
          {NAV.map((item, idx) => (
            <li key={item.label} onMouseEnter={() => openMenu(idx)}>
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className={`flex items-center gap-1 px-3 py-2.5 rounded font-display font-bold text-[14px] uppercase tracking-wide transition-colors ${openIdx === idx ? 'bg-white/15 text-[color:var(--hes-yellow)]' : 'text-white hover:bg-white/10'}`}
              >
                {item.label}
                <IconChevron width="14" height="14" className={`transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
            </li>
          ))}
        </ul>

        {/* Right side: expanded Search (Menu removed) */}
        <div className="flex items-center shrink-0 ml-auto xl:ml-0">
          <button className="flex items-center justify-between gap-3 w-[200px] xl:w-[240px] px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/25 hover:ring-[color:var(--hes-yellow)]/60 text-white/85 hover:text-white font-semibold text-[13px] tracking-wide transition-all group">
            <span className="font-display font-bold uppercase tracking-wider text-[12px]">Search H.E.S.</span>
            <span className="w-7 h-7 rounded-full bg-[color:var(--hes-yellow)] grid place-items-center text-[color:var(--hes-blue)] group-hover:scale-110 transition-transform">
              <IconSearch width="14" height="14" />
            </span>
          </button>
        </div>
      </div>

      {/* Mega menu */}
      {openIdx !== null && (
        <div onMouseEnter={() => openMenu(openIdx)}>
          <MegaMenu items={NAV[openIdx].items} />
        </div>
      )}
    </nav>
  );
};

const Header = () => (
  <header className="sticky top-0 z-50">
    <TopBar />
    <Nav />
  </header>
);

Object.assign(window, { Header, IconCalendar, IconHeart, IconSearch, IconMenu, IconChevron, IconArrowR });
