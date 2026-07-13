// =============================================================================
// H.E.S. — Google Sheets Sync Engine  (v3 — Pure Facts Brain)
// -----------------------------------------------------------------------------
// Reads the H.E.S. Brain Google Sheet and normalizes it into the content
// object used by the kiosk, website, and AI Synthesis Engine.
//
// The sheet is now a pure facts store — no prose in any cell. This engine
// assembles minimal display objects from those facts so the kiosk renders
// immediately, then the Synthesis Engine rewrites all copy from the same facts.
//
// Tab layout (v3):
//   Org      — key / fact_value pairs for org-level facts
//   Programs — entity / fact_key / fact_value for programs + services
//   Events   — event / fact_key / fact_value for upcoming events
//   Calendar — activity / start_time / end_time / room / days
//   Banners  — image_url / alt_text / active / order
//   Website  — section / entity / fact_key / fact_value (website-only)
//
// The normalized output shape is the same as v2 so all downstream components
// (pages.jsx, app.jsx, facts-engine.js) need zero changes.
// =============================================================================

(function () {
  "use strict";

  var cfg = window.HES_SHEETS_CONFIG || {};
  var configured = !!(cfg.apiKey && cfg.spreadsheetId);

  var TABS = ["Org", "Programs", "Events", "Calendar", "Banners", "Website", "PageContent"];

  // ── Not configured — stub the API ─────────────────────────────────────────
  if (!configured) {
    window.HES_SHEETS = {
      configured: false,
      status: { lastSync: null, lastError: null, polling: false },
      subscribeContent: function () { return function () {}; },
      refreshNow: function () { return Promise.resolve(null); },
    };
    return;
  }

  var POLL_MS = Math.max(5, (cfg.pollSeconds || 20)) * 1000;
  var status  = { lastSync: null, lastError: null, polling: false };

  // ── Fetch all tabs — individually so a missing tab never breaks the rest ──
  function fetchTab(tabName) {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" +
      encodeURIComponent(cfg.spreadsheetId) + "/values/" +
      encodeURIComponent(tabName) + "?majorDimension=ROWS&key=" + encodeURIComponent(cfg.apiKey);
    return fetch(url, { cache: "no-store" })
      .then(function(r) {
        if (r.status === 400 || r.status === 404) {
          console.info("[H.E.S.] Tab not found (skipping):", tabName);
          return [];
        }
        if (!r.ok) return r.text().then(function(body) {
          var msg = "Sheets API " + r.status;
          try { var j = JSON.parse(body); msg += ": " + (j.error && j.error.message); } catch(e) {}
          throw new Error(msg);
        });
        return r.json().then(function(j) { return j.values || []; });
      })
      .catch(function() { return []; }); // any individual tab failure → empty, don't break
  }

  function fetchAll() {
    return Promise.all(TABS.map(function(t) {
      return fetchTab(t).then(function(rows) { return { name: t, rows: rows }; });
    })).then(function(results) {
      var out = {};
      results.forEach(function(r) { out[r.name] = r.rows; });
      return out;
    });
  }

  // ── Utility ───────────────────────────────────────────────────────────────
  function toKey(h) {
    return String(h || "").trim()
      .replace(/_/g, ' ')             // underscores → spaces so years_serving → yearsServing
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .map(function (w, i) {
        w = w.toLowerCase();
        return i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join("");
  }

  function truthy(v) {
    var s = String(v == null ? "" : v).trim().toLowerCase();
    return !(s === "false" || s === "no" || s === "0" || s === "off" || s === "hidden");
  }

  // Normalize a sub-program label to a lookup key (same logic as normLabel in pages.jsx)
  function normSubKey(s) {
    return String(s || '').toLowerCase()
      .replace(/\([^)]*\)/g, '')   // drop parentheticals
      .replace(/[^a-z0-9]+/g, ' ')  // punctuation → space
      .trim();
  }

  // Convert a fact_key like "who_can_join" to a display label "Who Can Join"
  function factKeyToLabel(k) {
    var known = {
      'who_can_join':'Who Can Join','who_it_s_for':"Who It's For",
      'what_to_bring':'What to Bring','what_to_expect':'What to Expect',
      'what_you_learn':'What You Learn','what_s_included':"What's Included",
      'what_s_there':"What's There",'day_pass':'Day Pass',
      'parent_role':'Parent Role','best_for':'Best For',
      'skills_built':'Skills Built','age_range':'Ages',
      'ages':'Ages','who_it_is_for':"Who It's For",
    };
    var lk = String(k).toLowerCase().replace(/\s+/g,'_');
    if (known[lk]) return known[lk];
    return String(k).replace(/_+/g,' ')
      .replace(/\b\w/g, function(c){ return c.toUpperCase(); });
  }

  // Convert a header row + data rows into an array of header-indexed objects
  function rowsToObjects(grid) {
    if (!grid || grid.length < 2) return [];
    var headers = grid[0].map(toKey);
    var rows = [];
    for (var i = 1; i < grid.length; i++) {
      var r = grid[i];
      if (!r || r.every(function (c) { return String(c).trim() === ""; })) continue;
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        obj[headers[c]] = r[c] != null ? String(r[c]).trim() : "";
      }
      rows.push(obj);
    }
    return rows;
  }

  // Find the first row value for a given fact key in a facts array
  function getFact(facts, key) {
    var f = facts.find(function (f) { return f.key === key || f.factKey === key; });
    return f ? (f.value || f.factValue || "") : "";
  }

  // Find all row values for a given fact key
  function getAllFacts(facts, key) {
    return facts
      .filter(function (f) { return f.key === key || f.factKey === key; })
      .map(function (f) { return f.value || f.factValue || ""; })
      .filter(Boolean);
  }

  // ── Parsers ───────────────────────────────────────────────────────────────

  // Org tab → settings object
  function parseOrg(grid) {
    var rows = rowsToObjects(grid);
    var out = {};
    rows.forEach(function (r) {
      var k = r.factKey || r.key || r.name;
      var v = r.factValue || r.value;
      if (k && v != null) out[toKey(k)] = String(v).trim();
    });
    if (!Object.keys(out).length) return null;

    // ── Stats (SINGLE SOURCE OF TRUTH: Org tab only) ──────────────────────
    // Your existing Org tab rows drive the three stats automatically:
    //   years_serving    → stat 1 number
    //   families_served  → stat 2 number
    //   program_count    → stat 3 number
    // To customise the label beneath each number, add optional rows:
    //   years_serving_label   | years serving southeast Brooklyn
    //   families_served_label | community members and families
    //   program_count_label   | programs across every age group
    // Edit ONLY the Org tab for stats — do NOT duplicate in the Website tab.
    var orgStats = [];

    // Pattern A — explicit numbered rows: stat_1_num / stat_1_label (takes priority)
    for (var si = 1; si <= 10; si++) {
      var sNum = out['stat' + si + 'Num']
             || out['stat' + si + 'Value']
             || out['stat' + si + 'Number']
             || '';
      if (!sNum) break;
      var sLbl = out['stat' + si + 'Label'] || out['stat' + si + 'Text'] || '';
      orgStats.push({ num: sNum, label: sLbl, _order: si });
    }

    // Pattern B — named keys already present in this sheet (no sheet changes needed)
    if (!orgStats.length) {
      [
        { numKey: 'yearsServing',   defLabel: 'years serving southeast Brooklyn' },
        { numKey: 'familiesServed', defLabel: 'community members and families'   },
        { numKey: 'programCount',   defLabel: 'programs across every age group'  },
      ].forEach(function (m, idx) {
        var n = out[m.numKey];
        if (n) orgStats.push({
          num:    n,
          label:  out[m.numKey + 'Label'] || m.defLabel,
          _order: idx + 1,
        });
      });
    }

    return {
      // Identity
      name:             out.name             || "Hebrew Educational Society",
      nickname:         out.nickname         || "H.E.S.",
      website:          out.website          || "thehes.org",
      // Location
      community:        out.community        || "",
      region:           out.region           || "",
      type:             out.type             || "",
      // Programs / mission
      populationServed: out.populationServed || "",
      specialFocus:     out.specialFocus     || "",
      // Contact
      helpPhone:    out.phone        || out.helpPhone   || "",
      helpAddress:  out.addressFull  || out.address     || "",
      helpCity:     out.city         || "",
      helpBorough:  out.borough      || "",
      helpState:    out.state        || "NY",
      helpZip:      out.zip          || "",
      // Hours
      hoursWeekdays: out.hoursWeekdays || "",
      hoursOpen:     out.hoursOpen     || "",
      hoursClose:    out.hoursClose    || "",
      // Messaging
      welcomeHeading:    out.welcomeHeading    || "A century of neighbors helping neighbors.",
      welcomeSubheading: out.welcomeSubheading || "YOUR Community Center \u00b7 Canarsie, Brooklyn",
      tagline:           out.tagline           || "",
      missionPhrase:     out.missionPhrase     || "",
      foundedYear:       out.foundedYear       || "1906",
      stats: orgStats,
      _raw: out,
    };
  }

  // Programs tab → categories[] (used by kiosk home tiles + detail pages)
  // Also derives programs[] accordion data from the same facts
  function parseProgramFacts(grid, subProgMap) {
    var rows = rowsToObjects(grid);
    var order = [];
    var byEntity = {};

    rows.forEach(function (r) {
      var entity = r.entity || r.program || r.name || "";
      var key    = r.factKey || r.key     || "";
      var val    = r.factValue || r.value || "";
      if (!entity || !key || !val) return;
      if (!byEntity[entity]) {
        byEntity[entity] = [];
        order.push(entity);
      }
      byEntity[entity].push({ key: key, value: val });
    });

    if (!order.length) return { categories: [], programs: [], services: [] };

    var categories = order.map(function (entity) {
      var facts = byEntity[entity];

      var slug      = entity.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      var slot      = getFact(facts, "ui_slot")   || ("cat-" + slug.split("-")[0]);
      var accent    = getFact(facts, "ui_accent") || "#1A1F8F";
      var uiOrder   = parseFloat(getFact(facts, "ui_order") || "99") || 99;
      var photoUrl  = getFact(facts, "photo_url") || "";

      // items[] — one per sub_program fact
      var subPrograms = getAllFacts(facts, "sub_program");
      var items = subPrograms.map(function (sp) {
        var spNorm = normSubKey(sp);
        var spData = subProgMap && subProgMap[spNorm];
        return {
          label:   sp,
          text:    '',
          prose:   spData ? (spData.prose   || '') : '',
          summary: spData ? (spData.summary || '') : '',
          details: spData ? (spData.details || []) : [],
        };
      });

      // Minimal blurb from key facts (immediate display before synthesis)
      var ageRange = getFact(facts, "age_range_label") || getFact(facts, "age_range") || "";
      var audience = getFact(facts, "audience")        || "";
      var schedule = getFact(facts, "schedule")        || "";
      var blurbParts = [];
      if (ageRange) blurbParts.push("For " + ageRange);
      else if (audience) blurbParts.push("For " + audience);
      if (schedule) blurbParts.push(schedule);
      var blurb = blurbParts.join(" \u00b7 ");

      return {
        key:             slug,
        title:           entity,
        slot:            slot,
        accent:          accent,
        photo:           photoUrl,
        blurb:           blurb,
        longDescription: "",
        items:           items,
        _order:          uiOrder,
        _facts:          facts,
      };
    }).sort(function (a, b) { return a._order - b._order; });

    // Also assemble programs[] and services[] for the accordion pages
    // (groups entities by first word: Social Services → services group, etc.)
    var programs = [];
    var services = [];
    categories.forEach(function (cat) {
      var isService = cat.title.toLowerCase().indexOf("service") >= 0 ||
                      cat.title.toLowerCase().indexOf("social")  >= 0;
      var group = {
        group:  cat.title,
        icon:   getFact(cat._facts, "ui_icon") || "heart",
        iconBg: cat.accent,
        items:  cat.items,
      };
      if (isService) services.push(group);
      else programs.push(group);
    });

    return { categories: categories, programs: programs, services: services };
  }

  // Events tab → events[]
  function parseEventFacts(grid) {
    var rows = rowsToObjects(grid);
    var order = [];
    var byEvent = {};

    var validUntil = {};
    rows.forEach(function (r) {
      var entity = r.event   || r.entity || r.name || "";
      var key    = r.factKey || r.key    || "";
      var val    = r.factValue || r.value || "";
      if (!entity || !key || !val) return;
      if (!byEvent[entity]) {
        byEvent[entity] = [];
        order.push(entity);
      }
      byEvent[entity].push({ key: key, value: val });
      // Capture the "Valid Until" column (explicit expiry date) once per event
      var vu = r.validUntil || r.valid_until || r.expires || "";
      if (vu && !validUntil[entity]) validUntil[entity] = vu;
    });

    // Auto-expire: parse each event's date and drop anything strictly before today.
    function parseEvtDate(facts) {
      var str = getFact(facts, "date_short") || getFact(facts, "date") || "";
      if (!str) return null;
      var d = new Date(str); if (!isNaN(d.getTime())) return d;
      var m = str.match(/([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})/);
      if (m) { d = new Date(m[1]); if (!isNaN(d.getTime())) return d; }
      return null;
    }
    var todayMs = (new Date()).setHours(0, 0, 0, 0);
    return order.filter(function(evtName) {
      // 1. Explicit "Valid Until" column wins — drop once that date has passed
      var vu = validUntil[evtName];
      if (vu) {
        var vd = new Date(vu);
        if (!isNaN(vd.getTime())) return vd.getTime() >= todayMs;
      }
      // 2. Fall back to parsing the event's own date fact
      var d = parseEvtDate(byEvent[evtName]);
      return !d || d >= todayMs;
    }).map(function (evtName) {
      var facts = byEvent[evtName];

      // Assemble a minimal display text from key facts
      var fee           = getFact(facts, "admission_fee");
      var entertainment = getAllFacts(facts, "entertainment").join(", ");
      var location      = getFact(facts, "location");
      var parts = [];
      if (fee)           parts.push(fee + " admission");
      if (entertainment) parts.push(entertainment);
      if (location)      parts.push("on " + location);
      var text = parts.join(". ") + (parts.length ? "." : "");

      return {
        title:  evtName,
        date:   getFact(facts, "date_short") || getFact(facts, "date") || "",
        month:  getFact(facts, "month")      || "",
        day:    getFact(facts, "day_number") || "",
        time:   getFact(facts, "start_time") || "",
        text:   text,
        _facts: facts,
      };
    });
  }

  // Calendar tab → calendar[] (today-filtered, same as before)
  function parseCalendar(grid) {
    var TODAY = ["sun","mon","tue","wed","thu","fri","sat"][new Date().getDay()];
    var rows  = rowsToObjects(grid);
    return rows
      .filter(function (r) {
        var days = String(r.days || r.daysOfWeek || "")
          .split(/[,|]/).map(function (d) { return d.trim().slice(0,3).toLowerCase(); })
          .filter(Boolean);
        return days.length === 0 || days.indexOf(TODAY) !== -1;
      })
      .map(function (r) {
        var start = r.startTime || r.time || "";
        var end   = r.endTime   || "";
        return {
          time:  end ? (start + " \u2013 " + end) : start,
          event: r.activity || r.event || "",
          room:  r.room || "",
        };
      });
  }

  // Banners tab → banners[]
  function parseBanners(grid) {
    var rows = rowsToObjects(grid);
    return rows
      .filter(function (r) {
        var url = r.imageUrl || r.imageURL || r.url || "";
        return url && truthy(r.active == null ? "yes" : r.active);
      })
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) {
        return {
          imageUrl: r.imageUrl || r.imageURL || r.url || "",
          alt:      r.altText  || r.alt      || "",
        };
      });
  }

  // Website tab → heroSlides[], stats[], news[]
  function parseWebsiteFacts(grid) {
    var rows = rowsToObjects(grid);

    // Group by Section → Entity
    var sections = {};
    rows.forEach(function (r) {
      var section = (r.section || "").toLowerCase();
      var entity  = r.entity  || r.name || "";
      var key     = r.factKey || r.key  || "";
      var val     = r.factValue || r.value || "";
      var ord     = parseFloat(r.order  || "99") || 99;
      if (!section || !entity || !key || !val) return;
      if (!sections[section]) sections[section] = {};
      if (!sections[section][entity]) sections[section][entity] = { facts: [], order: ord };
      sections[section][entity].facts.push({ key: key, value: val });
    });

    // Hero slides
    var heroSlides = [];
    if (sections.hero) {
      Object.keys(sections.hero).forEach(function (name) {
        var e = sections.hero[name];
        heroSlides.push({
          eyebrow:      getFact(e.facts, "eyebrow")            || "",
          headline:     [getFact(e.facts, "theme")             || ""],
          body:         "",           // AI synthesizes this
          primaryCta:   { label: getFact(e.facts, "cta_primary_label") || "Learn More",
                          href:  getFact(e.facts, "cta_primary_href")  || "#" },
          secondaryCta: { label: getFact(e.facts, "cta_secondary_label") || "",
                          href:  getFact(e.facts, "cta_secondary_href")  || "#" },
          photo:        getFact(e.facts, "image_url") || "",
          _order:       e.order,
          _facts:       e.facts,
        });
      });
      heroSlides.sort(function (a, b) { return a._order - b._order; });
    }

    // Stats
    var stats = [];
    if (sections.stats) {
      Object.keys(sections.stats).forEach(function (name) {
        var e = sections.stats[name];
        stats.push({
          num:    getFact(e.facts, "value") || getFact(e.facts, "num") || getFact(e.facts, "number") || "",
          // Accept either a single 'label' fact OR the classic unit+context pair
          label:  getFact(e.facts, "label")
               || (getFact(e.facts, "unit") + " " + getFact(e.facts, "context")).trim(),
          _order: e.order,
        });
      });
      stats.sort(function (a, b) { return a._order - b._order; });
    }

    // News
    var news = [];
    if (sections.news) {
      Object.keys(sections.news).forEach(function (name) {
        var e = sections.news[name];
        news.push({
          tag:        "",
          date:       getFact(e.facts, "date")      || "",
          title:      name,
          categories: getAllFacts(e.facts, "category"),
          photo:      getFact(e.facts, "image_url") || "",
          featured:   truthy(getFact(e.facts, "featured") || "no"),
          body:       "",     // AI synthesizes this
          _order:     e.order,
          _facts:     e.facts,
        });
      });
      news.sort(function (a, b) { return a._order - b._order; });
    }

    return { heroSlides: heroSlides, stats: stats, news: news };
  }

  // ── PageContent tab ────────────────────────────────────────────────────
  // Schema: page | section | field | content | status | notes
  // Provides page-specific content for any page on the website.
  // Editor workflow: find the page name in column A, edit column D (content).
  function parsePageContent(grid) {
    var rows = rowsToObjects(grid);
    var map = {};
    rows.forEach(function(r) {
      var page    = String(r.page    || r.pageName || '').trim();
      var section = String(r.section || '').trim();
      var field   = String(r.field   || r.fieldKey || '').trim();
      var content = String(r.content || r.value    || '').trim();
      var status  = String(r.status  || 'active').trim().toLowerCase();
      if (!page || !field) return;
      if (status === 'inactive' || status === 'disabled') return;
      // Normalize page key: lowercase + underscores
      var pageKey = page.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      var secKey  = section ? section.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '_default';
      if (!map[pageKey]) map[pageKey] = { _name: page };
      if (!map[pageKey][secKey]) map[pageKey][secKey] = {};
      map[pageKey][secKey][field] = content;
    });
    return map;
  }

  // ── SubPrograms (optional tab) ────────────────────────────────────────────
  // Fetches the "SubPrograms" tab independently so a missing tab never breaks
  // the main data load. Returns an empty array on 404 or any error.
  function fetchSubPrograms() {
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" +
      encodeURIComponent(cfg.spreadsheetId) +
      "/values/SubPrograms?majorDimension=ROWS&key=" +
      encodeURIComponent(cfg.apiKey);
    return fetch(url, { cache: "no-store" })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(j) { return (j && j.values) ? j.values : []; })
      .catch(function() { return []; });
  }

  // SubPrograms tab → { normSubProgramLabel: { prose, summary, details:[{label,text}] } }
  // Schema: Category | Sub Program | Fact Key | Fact Value
  // Special fact keys: "summary"/"intro" → item.summary  "description"/"prose" → item.prose
  // All other keys become detail rows (fact_key → display label, fact_value → text)
  function parseSubPrograms(grid) {
    var rows = rowsToObjects(grid);
    var map  = {};
    rows.forEach(function(r) {
      var sp  = r.subProgram || r.subProgram || r.sub_program || r.subprogram || '';
      var key = (r.factKey   || r.key        || '').toLowerCase().trim();
      var val = r.factValue  || r.value      || '';
      if (!sp || !key || !val) return;
      var spNorm = normSubKey(sp);
      if (!map[spNorm]) map[spNorm] = { prose:'', summary:'', details:[] };
      if (key === 'summary' || key === 'intro') {
        map[spNorm].summary = val;
      } else if (key === 'description' || key === 'prose') {
        map[spNorm].prose = val;
      } else {
        map[spNorm].details.push({ label: factKeyToLabel(key), text: val });
      }
    });
    return map;
  }

  // ── Normalize ─────────────────────────────────────────────────────────────
  // Assembles the full content object from all tabs.
  // The shape is identical to v2 so all downstream code is unchanged.
  // Build Calendar & Events category items LIVE from the Events tab (auto-expiring)
  // plus a "Today's Schedule" item from the Calendar tab. This replaces any
  // hardcoded sub_program rows so past events never linger and every item gets
  // a proper detail table.
  function buildCalendarItems(events, calendar) {
    var items = [];

    // 1. Today's Schedule — from the Calendar tab (already today-filtered)
    if (calendar && calendar.length) {
      var schedDetails = calendar.map(function (c) {
        // Calendar tab headers: Activity | Start Time | End Time | Room | Days | Notes
        // rowsToObjects camelCases them: activity, startTime, endTime, room, days, notes
        // parseCalendar normalises each row to { event, time, room }
        // "event" is the activity name (e.g. "Food Pantry", "Senior Yoga")
        var actName = c.event || c.activity || c.title || c.name || "";
        var timeStr = c.time || "";
        var room    = c.room || c.location || "";
        var val     = timeStr + (room ? " · " + room : "");
        return { label: actName || "Unnamed", text: val || "" };
      });
      items.push({
        label: "Today's Schedule",
        summary: "Today’s recurring activities and classes at H.E.S.",
        details: schedDetails,
      });
    }

    // 2. One accordion item per upcoming event — details from its facts
    (events || []).forEach(function (ev) {
      var facts = ev._facts || [];
      var details = [];
      function add(label, key) {
        var v = getFact(facts, key);
        if (v) details.push({ label: label, text: v });
      }
      // Prefer a friendly date line
      var dateLine = ev.date || getFact(facts, "date") || "";
      if (dateLine) details.push({ label: "Date", text: dateLine });
      add("Time", "start_time");
      add("Location", "location");
      add("Admission", "admission_fee");
      add("Cost", "cost");
      add("Ages", "ages");
      add("Format", "format");
      var ent = getAllFacts(facts, "entertainment").join(", ");
      if (ent) details.push({ label: "Highlights", text: ent });

      items.push({
        label: ev.title,
        summary: ev.text || "",
        prose: getFact(facts, "description") || getFact(facts, "summary") || ev.text || "",
        details: details,
      });
    });

    return items;
  }

  function normalize(tabs) {
    tabs = tabs || {};

    var subProgMap = parseSubPrograms(tabs.SubPrograms || []);
    var orgData    = parseOrg(tabs.Org);
    var progData   = parseProgramFacts(tabs.Programs, subProgMap);
    var webData   = parseWebsiteFacts(tabs.Website);

    // Derive website-style tiles from categories
    var tiles = (progData.categories || []).map(function (c) {
      return { label: c.title, accent: c.accent || "#1A1F8F",
               href: "/programs/" + c.key, photo: c.photo || "" };
    });

    var liveEvents   = parseEventFacts(tabs.Events);
    var liveCalendar = parseCalendar(tabs.Calendar);

    // Rewrite the Calendar & Events category to source items LIVE from the
    // Events + Calendar tabs (auto-expiring) instead of stale sub_program rows.
    var cats = progData.categories || [];
    var calCat = cats.find(function (c) {
      return c.key === "calendar-events" || /calendar/i.test(c.title || "");
    });
    if (calCat) {
      calCat.items = buildCalendarItems(liveEvents, liveCalendar);
      calCat.blurb = "What's on today and what's coming up \u2014 daily activities, classes, and community events all in one place.";
    }

    return {
      settings:   orgData,
      programs:   progData.programs   || [],
      services:   progData.services   || [],
      categories: cats,
      tiles:      tiles,
      events:     liveEvents,
      calendar:   liveCalendar,
      banners:    parseBanners(tabs.Banners),
      heroSlides:   webData.heroSlides  || [],
      // Stats: Org tab is the SINGLE source of truth.
      // Website-tab stats section is only used as a last-resort fallback
      // if the Org tab has no stat_N_num rows at all.
      stats: (orgData && orgData.stats && orgData.stats.length > 0)
               ? orgData.stats
               : (webData.stats || []),
      news:         webData.news        || [],
      subPrograms:  subProgMap,
      pageContent:  parsePageContent(tabs.PageContent || []),
    };
  }

  // ── Subscribe / Poll ───────────────────────────────────────────────────────
  var subs      = [];
  var lastJSON  = null;
  var lastContent = null;
  var timer     = null;

  function pull() {
    return Promise.all([fetchAll(), fetchSubPrograms()])
      .then(function (results) {
      var tabs    = results[0] || {};
      tabs.SubPrograms = results[1] || [];
      var content = normalize(tabs);
      var json    = JSON.stringify(content);
      status.lastSync  = new Date();
      status.lastError = null;
      if (json !== lastJSON) {
        lastJSON    = json;
        lastContent = content;
        // Expose latest content globally so any component can read it
        // synchronously on mount (before their own subscription fires).
        window.__HES_LAST_CONTENT    = content;
        window.HES_SHEET_SUBPROGRAMS = content.subPrograms || {};
        subs.forEach(function (cb) { try { cb(content); } catch (e) {} });
      }
      return content;
      }).catch(function (err) {
        status.lastError = (err && err.message) || String(err);
        return lastContent;
      });
  }

  function ensurePolling() {
    if (timer || subs.length === 0) return;
    status.polling = true;
    timer = setInterval(pull, POLL_MS);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      pull();
    });
  }

  // Retry schedule for first-load failures: 3s → 7s → 15s → then normal POLL_MS cadence.
  var RETRY_DELAYS = [3000, 7000, 15000];
  var retryTimer  = null;
  var retryIndex  = 0;

  function scheduleRetry() {
    if (retryTimer || lastContent) return; // already retrying or already have data
    var delay = RETRY_DELAYS[retryIndex] || POLL_MS;
    retryIndex = Math.min(retryIndex + 1, RETRY_DELAYS.length);
    console.warn("[H.E.S.] Sheets fetch failed — retrying in " + (delay / 1000) + "s");
    retryTimer = setTimeout(function () {
      retryTimer = null;
      pull().then(function (c) {
        if (!c) scheduleRetry(); // still failing — keep backing off
      });
    }, delay);
  }

  function subscribeContent(cb) {
    if (typeof cb !== "function") return function () {};
    subs.push(cb);
    if (lastContent) { try { cb(lastContent); } catch (e) {} }
    if (subs.length === 1) {
      pull().then(function (c) {
        if (!c) scheduleRetry(); // first fetch failed — start fast-retry sequence
      });
    }
    ensurePolling();
    return function unsubscribe() {
      var i = subs.indexOf(cb);
      if (i !== -1) subs.splice(i, 1);
      if (subs.length === 0 && timer) { clearInterval(timer); timer = null; status.polling = false; }
    };
  }

  window.HES_SHEETS = {
    configured:      true,
    status:          status,
    subscribeContent: subscribeContent,
    refreshNow:      pull,
    _fetchAll:       fetchAll,
    _normalize:      normalize,
  };
})();
