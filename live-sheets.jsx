// =============================================================================
// H.E.S. WEBSITE — live content bridge (Google Sheet → homepage)
// -----------------------------------------------------------------------------
// Drop-in for the thehes.org homepage. It subscribes to the SAME master Google
// Sheet the kiosk reads and refills the homepage's data arrays in place, so the
// hero, program tiles, impact stats, featured news, and events all go live.
//
// Load order in Homepage.html (see website-patch/README.md):
//   1. <script> window.HES_SHEETS_CONFIG = { apiKey, spreadsheetId, pollSeconds } </script>
//   2. <script src="sheets.js"></script>                         (plain JS)
//   3. <script type="text/babel" src="components/data.jsx"></script>
//   4. <script type="text/babel" src="live-sheets.jsx"></script> (THIS file)
//   5. …other components…
//   6. <script type="text/babel" src="components/app.jsx"></script>
//
// Then add ONE line inside the App component in components/app.jsx:
//   useLiveContent();
//
// Until a spreadsheetId is configured (or if the sheet is unreachable), this is
// a no-op and the site keeps using the built-in constants from data.jsx.
// =============================================================================

(function () {
  // Replace an array's CONTENTS without breaking the reference the components
  // already captured (so a re-render shows the new data).
  function replaceInPlace(arr, next) {
    if (!Array.isArray(arr) || !Array.isArray(next) || next.length === 0) return false;
    arr.length = 0;
    next.forEach(function (x) { arr.push(x); });
    return true;
  }

  // Map the shared sync payload onto the website's exact field shapes.
  function apply(c) {
    if (!c) return false;
    var changed = false;

    // Hero rotator — sheets already emits { eyebrow, headline[], body,
    // primaryCta, secondaryCta, photo } which matches HERO_SLIDES.
    changed = replaceInPlace(window.HERO_SLIDES, c.heroSlides) || changed;

    // Program tiles — { label, accent, href, photo } matches PROGRAM_TILES.
    changed = replaceInPlace(window.PROGRAM_TILES, c.tiles) || changed;

    // Impact stats — { num, label } matches STATS.
    changed = replaceInPlace(window.STATS, c.stats) || changed;

    // Featured news — { tag, date, title, categories[], photo, featured }.
    changed = replaceInPlace(window.NEWS, c.news) || changed;

    // Events — website uses `desc`; the sheet calls it `text`. Remap.
    if (c.events && c.events.length) {
      changed = replaceInPlace(window.EVENTS, c.events.map(function (e) {
        return { month: e.month, day: e.day, title: e.title, time: e.time, desc: e.text };
      })) || changed;
    }
    return changed;
  }

  // React hook the App calls once. Subscribes, refills the arrays, re-renders.
  function useLiveContent() {
    var ref = React.useState(0);
    var setV = ref[1];
    React.useEffect(function () {
      if (!window.HES_SHEETS || !window.HES_SHEETS.configured) return;
      return window.HES_SHEETS.subscribeContent(function (c) {
        if (apply(c)) setV(function (v) { return v + 1; });
      });
    }, []);
  }

  Object.assign(window, { useLiveContent: useLiveContent });
})();
