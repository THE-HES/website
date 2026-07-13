// =============================================================================
// H.E.S. WEBSITE — live content bridge (Google Sheet → homepage)
// =============================================================================

(function () {
  // ── 1. Snapshot curated content as fallbacks ──────────────────────────────
  var BASE_HERO = (window.HERO_SLIDES || []).map(function (s) { return JSON.parse(JSON.stringify(s)); });
  var BASE_NEWS  = (window.NEWS       || []).map(function (n) { return JSON.parse(JSON.stringify(n)); });

  // ── Slide library: keyword → { photo, body } ─────────────────────────────
  var SLIDE_LIBRARY = [
    { keywords: ['summer camp', 'camp'],
      photo: 'assets/hero-camp-boat.jpg',
      body:  'June 29 \u2013 August 19. Swim, arts, karate, STEM, day & overnight trips. Camp Xtra supports children with disabilities.' },
    { keywords: ['street fair', 'fair'],
      photo: 'assets/hero-street-fair.jpg',
      body:  'DJ, games, food carts, bounce houses, demonstrations & giveaways. Bring the whole family.' },
    { keywords: ['century', 'neighbors', 'community center'],
      photo: '',
      body:  'From early childhood through senior services \u2014 H.E.S. has been Brooklyn\u2019s community anchor for over 100 years.' },
  ];

  function slideLib(theme) {
    var t = (theme || '').toLowerCase();
    for (var i = 0; i < SLIDE_LIBRARY.length; i++) {
      if (SLIDE_LIBRARY[i].keywords.some(function(k){ return t.indexOf(k) !== -1; }))
        return SLIDE_LIBRARY[i];
    }
    return null;
  }

  var CACHE_KEY = 'hes_live_v1';
  function nonEmpty(v) { return v != null && String(v).trim() !== ''; }
  function headlineHasText(h) { return Array.isArray(h) && h.join('').trim() !== ''; }

  function replaceInPlace(arr, next) {
    if (!Array.isArray(arr) || !Array.isArray(next) || next.length === 0) return false;
    arr.length = 0;
    next.forEach(function(x){ arr.push(x); });
    return true;
  }

  // ── Auto-split helper ─────────────────────────────────────────────────────
  // Splits a single-line headline into 3 parts so line 2 gets yellow.
  function autoSplit(str) {
    var words = str.trim().split(/\s+/);
    if (words.length <= 2) return [str];
    if (words.length === 3) return words;
    if (words.length === 4) return [words.slice(0,2).join(' '), words[2], words[3]];
    var a = Math.floor(words.length / 3), b = Math.floor(words.length * 2 / 3);
    return [words.slice(0,a).join(' '), words.slice(a,b).join(' '), words.slice(b).join(' ')];
  }

  // ── Headline splitter ─────────────────────────────────────────────────────
  function resolveHeadline(s, base) {
    if (!headlineHasText(s.headline)) return base.headline || [''];
    if (s.headline.length === 1 && s.headline[0].indexOf('|') !== -1)
      return s.headline[0].split('|').map(function(l){ return l.trim(); }).filter(Boolean);
    if (s.headline.length === 1 && s.headline[0].indexOf('\n') !== -1)
      return s.headline[0].split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
    if (s.headline.length >= 2) return s.headline;
    if (base.headline && base.headline.length >= 2) return base.headline;
    return autoSplit(s.headline[0]);
  }

  // ── Expiry checker for Website-tab slides (auto-detect date in text) ──────
  function slideExpiredAuto(s) {
    var text = (Array.isArray(s.headline) ? s.headline.join(' ') : (s.headline || ''))
              + ' ' + (s.eyebrow || '');
    var re = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(\d{4}))?\b/gi;
    var today = new Date(); today.setHours(0,0,0,0);
    var m;
    while ((m = re.exec(text)) !== null) {
      var yr = m[3] ? parseInt(m[3], 10) : today.getFullYear();
      var d = new Date(m[1] + ' ' + m[2] + ', ' + yr);
      d.setHours(0,0,0,0); d.setDate(d.getDate() + 1);
      if (!isNaN(d) && d <= today) return true;
    }
    return false;
  }

  // ── apply(): write fetched content into the live data arrays ─────────────
  function apply(c) {
    if (!c) return false;
    var changed = false;

    if (c.heroSlides && c.heroSlides.length) {
      var active = c.heroSlides.filter(function(s){ return !slideExpiredAuto(s); });
      changed = replaceInPlace(window.HERO_SLIDES, active.map(function(s, i) {
        var themeStr = Array.isArray(s.headline) ? s.headline.join(' ') : (s.headline || '');
        var lib  = slideLib(themeStr);
        var base = BASE_HERO.find(function(b){
          var bt = (Array.isArray(b.headline) ? b.headline.join(' ') : '').toLowerCase();
          return lib && lib.keywords.some(function(k){ return bt.indexOf(k) !== -1; });
        }) || BASE_HERO[i] || {};
        return {
          eyebrow:      nonEmpty(s.eyebrow)      ? s.eyebrow      : (base.eyebrow  || ''),
          headline:     resolveHeadline(s, base),
          body:         (lib && lib.body)         ? lib.body       : (nonEmpty(base.body) ? base.body : ''),
          primaryCta:   (s.primaryCta   && nonEmpty(s.primaryCta.label))   ? s.primaryCta   : (base.primaryCta   || { label: '', href: '#' }),
          secondaryCta: (s.secondaryCta && nonEmpty(s.secondaryCta.label)) ? s.secondaryCta : (base.secondaryCta || { label: '', href: '#' }),
          photo:        nonEmpty(s.photo) ? s.photo               // sheet URL always wins
                          : (lib && lib.photo) ? lib.photo       // then slide library for known themes
                          : (base.photo || ''),
          photoCredit:  base.photoCredit || '',
          validUntil:   s.validUntil || null,
        };
      })) || changed;
    }

    changed = replaceInPlace(window.PROGRAM_TILES, (function() {
      // Map sheet hrefs (/programs/xxx) to local .html files,
      // and filter to ONLY the 8 main program tiles that have a local page.
      var HREF_MAP = {
        '/programs/summer-camp':         'Summer Camp.html',
        '/programs/aquatics':            'Aquatics.html',
        '/programs/early-childhood':     'Early Childhood.html',
        '/programs/sports-fitness':      'Sports - Fitness.html',
        '/programs/disability-services': 'Disability Services.html',
        '/programs/music-school':        'Music School.html',
        '/programs/after-school':        'After School.html',
        '/programs/social-services':     'Social Services.html',
      };
      var fixed = (c.tiles || []).filter(function(t) {
        return !!HREF_MAP[t.href];
      }).map(function(t) {
        return Object.assign({}, t, { href: HREF_MAP[t.href] });
      });
      return fixed.length > 0 ? fixed : c.tiles;
    }())) || changed;
    changed = replaceInPlace(window.STATS,         c.stats)  || changed;

    if (c.news && c.news.length) {
      changed = replaceInPlace(window.NEWS, c.news.map(function(n, i) {
        var base = BASE_NEWS.find(function(b){ return b.title === n.title; }) || BASE_NEWS[i] || {};
        return {
          tag:        nonEmpty(n.tag)   ? n.tag   : (base.tag   || ''),
          date:       nonEmpty(n.date)  ? n.date  : (base.date  || ''),
          title:      n.title || base.title || '',
          categories: (n.categories && n.categories.length) ? n.categories : (base.categories || []),
          photo:      nonEmpty(n.photo) ? n.photo : (base.photo || ''),
          featured:   n.featured != null ? n.featured : (base.featured || false),
          body:       nonEmpty(n.body)  ? n.body  : (base.body  || ''),
        };
      })) || changed;
    }

    if (c.events && c.events.length) {
      changed = replaceInPlace(window.EVENTS, c.events.map(function(e) {
        return { month: e.month, day: e.day, title: e.title, time: e.time, desc: e.text, validUntil: e.validUntil || null };
      })) || changed;
    }

    // ── Org settings: phone, address, hours ───────────────────────────────
    // Always mark changed so the homepage re-renders and TopBar/Footer pick up
    // any Org tab edits (phone number, address, hours) within the poll cycle.
    if (c.settings) {
      var prev = window.__HES_ORG_SETTINGS_HASH || '';
      var next = (c.settings.helpPhone || '') + '|' + (c.settings.helpAddress || '') + '|' + (c.settings.hoursOpen || '');
      if (next !== prev) {
        window.__HES_ORG_SETTINGS_HASH = next;
        changed = true;
      }
    }

    return changed;
  }

  // ── HeroSlides tab: flat format, one row per slide ────────────────────────
  // Create a tab named "HeroSlides" in your Google Sheet with these columns:
  //
  //   Active | Theme | Eyebrow | Body | Image URL |
  //   Primary Button | Primary URL | Secondary Button | Secondary URL | Expiry Date
  //
  // Active      = "yes" to show, "no" to hide (leave blank = yes)
  // Theme       = use | to control line breaks: "Summer Camp | 2026 is | now open."
  //               Line 2 gets the yellow accent automatically.
  // Expiry Date = set with Google Sheets' date picker. Slide auto-hides the
  //               day after. Leave blank = never expires.
  //
  // If this tab does NOT exist, slides fall back to the Website tab (EAV format).

  function parseHeroRows(rows) {
    if (!rows || rows.length < 2) return null;
    var header = rows[0].map(function(h){ return h.trim().toLowerCase().replace(/\s+/g,'_'); });
    function col(row, names) {
      for (var i = 0; i < names.length; i++) {
        var idx = header.indexOf(names[i]);
        if (idx >= 0 && row[idx] != null && String(row[idx]).trim()) return String(row[idx]).trim();
      }
      return '';
    }
    var today = new Date(); today.setHours(0,0,0,0);
    var slides = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row || row.every(function(c){ return !String(c||'').trim(); })) continue;
      // Active toggle
      var active = col(row,['active','show','enabled']);
      if (active && active.toLowerCase() === 'no') continue;
      // Expiry date — reads the date-picker value from the sheet
      var expStr = col(row,['expiry_date','expiry','expires','valid_until','end_date']);
      if (expStr) {
        var expD = new Date(expStr); expD.setHours(0,0,0,0); expD.setDate(expD.getDate()+1);
        if (!isNaN(expD) && expD <= today) continue;
      }
      var themeRaw = col(row,['theme','headline','title']);
      // Split theme on | or newline; auto-split if still single line
      var headline;
      if (themeRaw.indexOf('|') !== -1)
        headline = themeRaw.split('|').map(function(l){ return l.trim(); }).filter(Boolean);
      else if (themeRaw.indexOf('\n') !== -1)
        headline = themeRaw.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);
      else
        headline = autoSplit(themeRaw);
      var lib      = slideLib(themeRaw);
      var rawPhoto = col(row,['image_url','photo','image','background']);
      var rawBody  = col(row,['body','description','subtitle','text']);
      slides.push({
        eyebrow:      col(row,['eyebrow','subheading','sub_text','tag']),
        headline:     headline,
        body:         rawBody || (lib ? lib.body : ''),
        primaryCta:   { label: col(row,['primary_button','primary_label','cta_1_label']),
                        href:  col(row,['primary_url','primary_href','cta_1_url']) || '#' },
        secondaryCta: { label: col(row,['secondary_button','secondary_label','cta_2_label']),
                        href:  col(row,['secondary_url','secondary_href','cta_2_url']) || '#' },
        photo:        rawPhoto || (lib && lib.photo ? lib.photo : ''),
        photoCredit:  '',
        validUntil:   expStr || null,
      });
    }
    return slides.length ? slides : null;
  }

  function fetchHeroTab() {
    var cfg = window.HES_SHEETS_CONFIG || {};
    if (!cfg.spreadsheetId || !cfg.apiKey) return Promise.resolve(null);
    return fetch('https://sheets.googleapis.com/v4/spreadsheets/' + cfg.spreadsheetId +
      '/values/HeroSlides?majorDimension=ROWS&key=' + cfg.apiKey, { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ return j && j.values ? j.values : null; })
      .catch(function(){ return null; });
  }

  // ── 2. Restore from localStorage instantly on load ────────────────────────
  try {
    var _cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (_cached) apply(_cached);
  } catch (e) {}

  // ── 3. React hook ─────────────────────────────────────────────────────────
  // On every poll: also fetches HeroSlides tab and uses it when it exists.
  function useLiveContent() {
    var ref = React.useState(0);
    var setV = ref[1];
    React.useEffect(function () {
      if (!window.HES_SHEETS || !window.HES_SHEETS.configured) return;
      return window.HES_SHEETS.subscribeContent(function (c) {
        fetchHeroTab().then(function(heroRows) {
          var heroSlides = parseHeroRows(heroRows);
          // HeroSlides tab exists → use it; otherwise fall back to Website tab
          var merged = heroSlides ? Object.assign({}, c, { heroSlides: heroSlides }) : c;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(merged)); } catch (e) {}
          if (apply(merged)) setV(function(v){ return v + 1; });
        });
      });
    }, []);
  }

  Object.assign(window, { useLiveContent: useLiveContent });
})();
