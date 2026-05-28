// ── "Let us show you around" CTA + Footer ─────────────────────────

const ShowAround = () => (
  <section className="relative bg-[color:var(--hes-blue)]" data-screen-label="Show Around">
    <div className="max-w-none grid lg:grid-cols-2">
      {/* Left: copy + buttons */}
      <div className="px-8 lg:pl-[max(2rem,calc((100vw-1480px)/2+2rem))] py-20 lg:py-24 max-w-[680px] relative">
        <div
          className="absolute top-0 right-0 w-[160px] h-[160px] opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
        />
        <h2 className="relative font-display font-extrabold text-white text-[44px] leading-[1.05] mb-4">
          Let us show you around.
        </h2>
        <p className="relative text-white/85 text-[16px] mb-8 max-w-[440px] leading-relaxed">
          The best way to know H.E.S. is to walk in. Come tour H.E.S., swim a lap, sit in on a class — whatever fits your family.
        </p>
        <div className="relative flex flex-col sm:flex-row flex-wrap gap-3 max-w-[460px]">
          <a href="#" className="flex-1 min-w-[180px] text-center px-6 py-4 bg-[color:var(--hes-yellow)] hover:bg-white text-[color:var(--hes-blue)] font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
            Visit H.E.S.
          </a>
          <a href="#" className="flex-1 min-w-[180px] text-center px-6 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-[color:var(--hes-blue)] text-white font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
            Take a Virtual Tour
          </a>
        </div>
      </div>

      {/* Right: photo */}
      <div
        className="min-h-[400px] lg:min-h-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(assets/hes-building.jpg)' }}
      />
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────
const SocialIcon = ({ kind }) => {
  const paths = {
    fb:  "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    ig:  "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01",
    x:   "M4 4l16 16M20 4L4 20",
    yt:  "M22 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 5 12 5 12 5s-4 0-7.1.1c-.4 0-1.3 0-2.1.9C2.2 6.6 2 8 2 8S1.8 9.6 1.8 11.2v1.6c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.2 7 .1 7 .1s4 0 7.1-.1c.4 0 1.3 0 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6c0-1.6-.2-3.2-.2-3.2zM10 14V8l5 3z",
    li:  "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  };
  return (
    <a href="#" className="w-9 h-9 rounded-full border border-white/30 hover:bg-[color:var(--hes-yellow)] hover:border-[color:var(--hes-yellow)] hover:text-[color:var(--hes-blue)] text-white grid place-items-center transition-colors" aria-label={kind}>
      {kind === 'ig' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={paths[kind]}/>
        </svg>
      )}
    </a>
  );
};

const Footer = () => (
  <footer className="bg-[color:var(--hes-blue)] text-white">
    {/* Main footer */}
    <div className="max-w-[1480px] mx-auto px-8 py-14">
      <div className="grid lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        {/* Brand + address */}
        <div>
          <div className="mb-4">
            <img
              src="assets/hes-logo-white.png"
              alt="Hebrew Educational Society"
              className="h-[70px] w-auto block"
            />
          </div>
          <div className="text-white/75 text-[13px] leading-relaxed space-y-1">
            <div className="font-semibold">Phone: <a href="tel:7182413000" className="text-[color:var(--hes-yellow)] hover:underline">718.241.3000</a></div>
            <div>9502 Seaview Avenue</div>
            <div>Brooklyn, NY 11236</div>
          </div>
          <div className="mt-4 text-[11px] font-display font-bold uppercase tracking-wider text-[color:var(--hes-yellow)]">
            Proud Partner: UJA Federation New York
          </div>
        </div>

        {/* Cols */}
        {[
          { title: "Visit",     items: ["Contact Us", "Hours & Location", "Plan a Visit", "Membership"] },
          { title: "Programs",  items: ["Summer Camp", "Aquatics", "Early Childhood", "After School", "Music School", "Fitness Center"] },
          { title: "Services",  items: ["Food Pantry", "Disability Services", "Camp Xtra", "Teen Leadership", "It Takes A Village", "Public Health Volunteer"] },
        ].map(col => (
          <div key={col.title}>
            <div className="font-display font-extrabold uppercase tracking-wider text-[color:var(--hes-yellow)] text-[14px] mb-4 pb-2 border-b border-white/20">
              {col.title}
            </div>
            <ul className="space-y-2.5">
              {col.items.map(i => (
                <li key={i}>
                  <a href="#" className="text-[13px] text-white/80 hover:text-[color:var(--hes-yellow)] hover:underline transition-colors">{i}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Social row */}
      <div className="mt-12 pt-6 border-t border-white/15 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-display font-bold uppercase tracking-wider text-white/70 mr-2">Connect</span>
          <SocialIcon kind="fb" />
          <SocialIcon kind="ig" />
          <SocialIcon kind="x" />
          <SocialIcon kind="yt" />
          <SocialIcon kind="li" />
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px] font-display font-bold uppercase tracking-wider text-white/80">
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">News</a>
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Events</a>
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Press & Media</a>
        </div>
      </div>
    </div>

    {/* Legal strip */}
    <div className="bg-[color:var(--hes-blue-dark)]">
      <div className="max-w-[1480px] mx-auto px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="text-[11px] text-white/55">© 2026 Hebrew Educational Society. All rights reserved.</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/55">
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Accessibility</a>
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Privacy</a>
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Terms</a>
          <a href="#" className="hover:text-[color:var(--hes-yellow)]">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

Object.assign(window, { ShowAround, Footer });
