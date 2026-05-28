// ── Program tiles band (full-bleed blue, 4×2 grid) ────────────────

const ProgramTiles = () => (
  <section
    id="programs"
    className="relative bg-[color:var(--hes-blue)] py-24 overflow-hidden"
    data-screen-label="Program Tiles"
  >
    {/* Halftone dots top-left & bottom-right */}
    <div
      className="absolute top-0 left-0 w-[200px] h-[200px] opacity-25 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
    />
    <div
      className="absolute bottom-0 right-0 w-[280px] h-[280px] opacity-20 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle, #F5C400 1.5px, transparent 1.6px)', backgroundSize: '14px 14px' }}
    />

    <div className="relative max-w-[1480px] mx-auto px-8">
      <div className="text-center mb-14">
        <span className="inline-block font-display font-bold uppercase tracking-[0.2em] text-[13px] text-[color:var(--hes-yellow)] mb-4">What We Offer</span>
        <h2 className="font-display font-extrabold text-white text-[48px] leading-[1.05]">
          Explore Our Programs
        </h2>
        <div className="mx-auto mt-5 w-16 h-[3px] bg-[color:var(--hes-yellow)] rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-6">
        {PROGRAM_TILES.map((t, i) => (
          <a
            key={t.label}
            href="#"
            className="group block overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-xl"
            style={{ animation: `tile-in 0.6s ease-out ${i * 60}ms both` }}
          >
            {/* Photo zone */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--hes-blue-dark)] rounded-t-xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${t.photo})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            </div>
            {/* Label band */}
            <div
              className="px-5 py-4 flex items-center justify-between gap-3"
              style={{ background: t.accent }}
            >
              <span className="font-display font-extrabold uppercase tracking-wide text-white text-[15px] leading-tight">
                {t.label}
              </span>
              <div className="w-7 h-7 rounded-full bg-white/20 grid place-items-center text-white transition-transform group-hover:translate-x-0.5 group-hover:bg-white/30 shrink-0">
                <IconArrowR width="14" height="14" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

// ── Two-up info blocks ────────────────────────────────────────────
const InfoBlocks = () => (
  <section className="bg-[color:var(--hes-off-white)] py-24" data-screen-label="Info Blocks">
    <div className="max-w-[1180px] mx-auto px-8 space-y-24">

      {/* Row 1: Text left, Photo card right */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="reveal">
          <div className="flex items-center gap-2 mb-4">
            <IconCalendar width="18" height="18" className="text-[color:var(--hes-blue)]" />
            <span className="font-display font-bold uppercase tracking-[0.18em] text-[12px] text-[color:var(--hes-blue)]">Summer Camp 2026</span>
          </div>
          <h2 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[42px] leading-[1.05] mb-4">
            Get your child on the bus.
          </h2>
          <p className="text-[16px] text-[color:var(--fg-secondary)] leading-relaxed mb-6 max-w-[480px]">
            Eight weeks of swim, arts, karate, STEM, day and overnight trips. Camp Xtra runs in parallel for children with disabilities. Multiple payment options accepted — Private Pay, 1199 ACS/HRA Vouchers, OPWDD.
          </p>
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue-dark)] text-white font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
            How to Register
            <IconArrowR width="14" height="14" />
          </a>
        </div>
        <div className="reveal relative pb-14">
          <div
            className="aspect-[4/3] bg-cover bg-center shadow-xl mr-10"
            style={{ backgroundImage: 'url(https://www.thehes.org/wp-content/uploads/2025/12/IMG_0409-2-scaled.jpg)' }}
          />
          {/* Floating caption card, anchored bottom-right of photo */}
          <div className="absolute -bottom-8 right-0 max-w-[260px] bg-white shadow-2xl p-6">
            <a href="#" className="block">
              <div className="font-display font-extrabold text-[color:var(--hes-blue)] text-[18px] mb-1 border-b-2 border-[color:var(--hes-yellow)] pb-1 inline-block">Tuition & payment options</div>
              <p className="text-[13px] text-[color:var(--fg-secondary)] leading-relaxed mt-2">
                Camp at H.E.S. is open and affordable to every family in our community.
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Row 2: Photo card left, Text right */}
      <div className="grid lg:grid-cols-2 gap-12 items-start pt-8">
        <div className="reveal relative order-2 lg:order-1 pb-14">
          <div
            className="aspect-[4/3] bg-cover bg-center shadow-xl ml-10"
            style={{ backgroundImage: 'url(assets/hes-building.jpg)' }}
          />
          <div className="absolute -bottom-8 left-0 max-w-[260px] bg-white shadow-2xl p-6">
            <a href="#" className="block">
              <div className="font-display font-extrabold uppercase tracking-wider text-[10px] text-[color:var(--hes-yellow-dark)] mb-2">Membership</div>
              <div className="font-display font-extrabold text-[color:var(--hes-blue)] text-[18px] mb-1 border-b-2 border-[color:var(--hes-yellow)] pb-1 inline-block">Join the H.E.S. family</div>
              <p className="text-[13px] text-[color:var(--fg-secondary)] leading-relaxed mt-2">
                Members get priority on programs, pool access, and event invites.
              </p>
            </a>
          </div>
        </div>
        <div className="reveal order-1 lg:order-2">
          <div className="flex items-center gap-2 mb-4">
            <IconHeart width="18" height="18" className="text-[color:var(--hes-blue)]" />
            <span className="font-display font-bold uppercase tracking-[0.18em] text-[12px] text-[color:var(--hes-blue)]">Life At H.E.S.</span>
          </div>
          <h2 className="font-display font-extrabold text-[color:var(--hes-blue)] text-[42px] leading-[1.05] mb-4">
            One building. Every age. Every neighbor.
          </h2>
          <p className="text-[16px] text-[color:var(--fg-secondary)] leading-relaxed mb-6 max-w-[480px]">
            On any given afternoon you'll find pre-K students painting, teens running drills, parents in yoga, and seniors at the social hall. H.E.S. is the corner where all of Canarsie meets — rooted in Jewish values, open to all.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue-dark)] text-white font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
              Explore Programs
              <IconArrowR width="14" height="14" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[color:var(--hes-blue)] text-[color:var(--hes-blue)] hover:bg-[color:var(--hes-blue)] hover:text-white font-display font-bold uppercase tracking-wide text-[14px] transition-colors">
              Plan a Visit
              <IconArrowR width="14" height="14" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

Object.assign(window, { ProgramTiles, InfoBlocks });
