// ── Main app ──────────────────────────────────────────────────────

const HOMEPAGE_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tilesPerRow": 4,
  "heroAccentLine": "yellow",
  "ctaStyle": "filled",
  "showImpactCards": true,
  "halftoneDots": true
}/*EDITMODE-END*/;

// Reveal-on-scroll observer (IntersectionObserver)
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal--in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const HomepageTweaks = ({ t, setTweak }) => (
  <TweaksPanel title="Tweaks">
    <TweakSection title="Layout">
      <TweakRadio
        label="Tiles per row"
        value={t.tilesPerRow}
        onChange={(v) => setTweak('tilesPerRow', v)}
        options={[3, 4]}
      />
      <TweakToggle
        label="Halftone dots"
        value={t.halftoneDots}
        onChange={(v) => setTweak('halftoneDots', v)}
      />
      <TweakToggle
        label="Show impact cards"
        value={t.showImpactCards}
        onChange={(v) => setTweak('showImpactCards', v)}
      />
    </TweakSection>
    <TweakSection title="Style">
      <TweakRadio
        label="Hero accent"
        value={t.heroAccentLine}
        onChange={(v) => setTweak('heroAccentLine', v)}
        options={['yellow', 'white']}
      />
      <TweakRadio
        label="Primary CTA"
        value={t.ctaStyle}
        onChange={(v) => setTweak('ctaStyle', v)}
        options={['filled', 'yellow']}
      />
    </TweakSection>
  </TweaksPanel>
);

const App = () => {
  const [t, setTweak] = useTweaks(HOMEPAGE_TWEAK_DEFAULTS);
  useReveal();
  useLiveContent();   // ← live Google Sheets sync (every 20s)

  // Surface tweak state on <html> so CSS can react via attribute selectors
  useEffect(() => {
    document.documentElement.dataset.tilesPerRow = t.tilesPerRow;
    document.documentElement.dataset.heroAccent  = t.heroAccentLine;
    document.documentElement.dataset.ctaStyle    = t.ctaStyle;
    document.documentElement.dataset.dots        = t.halftoneDots ? '1' : '0';
    document.documentElement.dataset.impact      = t.showImpactCards ? '1' : '0';
  }, [t]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProgramTiles />
        <InfoBlocks />
        <ByTheNumbers />
        <News />
        <Events />
        <ShowAround />
      </main>
      <Footer />
      <HomepageTweaks t={t} setTweak={setTweak} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
