// =============================================================================
// H.E.S. — Google Sheets sync engine  (single source of truth → many channels)
// -----------------------------------------------------------------------------
// Drop this ONE file into any channel (kiosk, website, signage…). Each channel
// reads the SAME Google Sheet, so editing a cell updates everywhere.
//
// It exposes a tiny API that mirrors the old Sanity layer, so app code that
// already calls subscribeContent() keeps working unchanged:
//
//   window.HES_SHEETS.configured                 — true once a spreadsheetId is set
//   window.HES_SHEETS.subscribeContent(cb)       — cb(content) now + on every change
//   window.HES_SHEETS.refreshNow()               — force an immediate re-pull
//   window.HES_SHEETS.status                      — { lastSync, lastError, polling }
//
// Config (set in the host HTML BEFORE this script):
//   window.HES_SHEETS_CONFIG = {
//     apiKey:        "AIza…",        // Google API key, Sheets API enabled
//     spreadsheetId: "1AbC…",        // the long id from the sheet URL
//     pollSeconds:   20,             // how often to check for edits (real-time-ish)
//   };
//
// The sheet must be shared "Anyone with the link → Viewer" (API keys can only
// read public sheets). All content here is public-facing, so that's fine.
//
// Every failure is silent: a channel never lags or shows an error to a visitor;
// it simply keeps using whatever it last had (or the local fallback data).
// =============================================================================

(function () {
  "use strict";

  var cfg = window.HES_SHEETS_CONFIG || {};
  var configured = !!(cfg.apiKey && cfg.spreadsheetId);

  // The tabs we read, in one batched request. Add a tab here + a parser below
  // to surface new content. Missing tabs are skipped silently.
  var TABS = [
    "Settings", "Categories", "Programs", "Services",
    "Events", "Calendar", "Banners", "HeroSlides", "Stats", "News",
  ];

  // ---- Not configured: stub the API so callers don't have to null-check ----
  if (!configured) {
    window.HES_SHEETS = {
      configured: false,
      status: { lastSync: null, lastError: null, polling: false },
      subscribeContent: function () { return function () {}; },
      refreshNow: function () { return Promise.resolve(null); },
    };
    if (!window.__HES_SHEETS_WARNED) {
      window.__HES_SHEETS_WARNED = true;
      console.info("[H.E.S. Sheets] Not configured — set window.HES_SHEETS_CONFIG = { apiKey, spreadsheetId } in the host HTML.");
    }
    return;
  }

  var POLL_MS = Math.max(5, (cfg.pollSeconds || 20)) * 1000;
  var status = { lastSync: null, lastError: null, polling: false };

  // ------------------------------------------------------------------ fetch --
  // One batched read of every tab → { Settings:[[…]], Programs:[[…]], … }
  function fetchAll() {
    var base = "https://sheets.googleapis.com/v4/spreadsheets/" +
      encodeURIComponent(cfg.spreadsheetId) + "/values:batchGet";
    var qs = TABS.map(function (t) { return "ranges=" + encodeURIComponent(t); }).join("&");
    var url = base + "?" + qs + "&majorDimension=ROWS&key=" + encodeURIComponent(cfg.apiKey);

    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("Sheets API " + r.status);
      return r.json();
    }).then(function (json) {
      var out = {};
      (json.valueRanges || []).forEach(function (vr) {
        // range looks like "Programs!A1:Z100" → take the tab name
        var name = (vr.range || "").split("!")[0].replace(/^'|'$/g, "");
        out[name] = vr.values || [];
      });
      return out;
    });
  }

  // ------------------------------------------------------------- row parsing --
  // Turn a 2-D grid (first row = headers) into [{header: cell, …}, …].
  // Header cells are normalised to camelCase keys: "Icon Bg" → "iconBg".
  function toKey(h) {
    return String(h || "").trim()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .map(function (w, i) {
        w = w.toLowerCase();
        return i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join("");
  }
  function rowsToObjects(grid) {
    if (!grid || grid.length < 2) return [];
    var headers = grid[0].map(toKey);
    var rows = [];
    for (var i = 1; i < grid.length; i++) {
      var r = grid[i];
      if (!r || r.every(function (c) { return String(c).trim() === ""; })) continue; // skip blank rows
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        if (!headers[c]) continue;
        obj[headers[c]] = r[c] != null ? String(r[c]).trim() : "";
      }
      rows.push(obj);
    }
    return rows;
  }

  var truthy = function (v) {
    var s = String(v == null ? "" : v).trim().toLowerCase();
    return !(s === "false" || s === "no" || s === "0" || s === "off" || s === "hidden");
  };
  var splitList = function (v) {
    return String(v || "").split(/[,|]/).map(function (s) { return s.trim(); }).filter(Boolean);
  };

  // ------------------------------------------------- domain-specific parsers --

  // key/value Settings tab → flat object  { welcomeHeading: "…", … }
  function parseSettings(grid) {
    var rows = rowsToObjects(grid);
    var out = {};
    rows.forEach(function (r) {
      var k = r.key || r.name || r.setting;
      if (k) out[toKey(k)] = r.value != null ? r.value : "";
    });
    return Object.keys(out).length ? out : null;
  }

  // Group rows that share a "group" (or "key") column into one card with items[].
  // Card-level fields are taken from the FIRST row of each group; every row
  // contributes one { label, text } item (rows with no label just set fields).
  function parseGrouped(grid, groupField, cardFields) {
    var rows = rowsToObjects(grid);
    var order = [];
    var byKey = {};
    rows.forEach(function (r) {
      var g = r[groupField] || r.group || r.key;
      if (!g) return;
      if (!byKey[g]) {
        var card = { items: [] };
        cardFields.forEach(function (f) { card[f.out] = r[f.in] || ""; });
        // sort hint
        card.__order = parseFloat(r.order || r.sort || "0") || order.length;
        byKey[g] = card;
        order.push(g);
      }
      if (r.label || r.text) {
        byKey[g].items.push({ label: r.label || "", text: r.text || r.body || "" });
      }
    });
    return order
      .map(function (g) { return byKey[g]; })
      .sort(function (a, b) { return a.__order - b.__order; })
      .map(function (c) { delete c.__order; return c; });
  }

  function parseEvents(grid) {
    return rowsToObjects(grid)
      .filter(function (r) { return r.title && truthy(r.active == null ? "yes" : r.active); })
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) {
        return {
          title: r.title, date: r.date || r.dateLabel || "", text: r.text || r.body || "",
          month: r.month || "", day: r.day || "", time: r.time || "",
        };
      });
  }

  function parseCalendar(grid) {
    var TODAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][new Date().getDay()];
    return rowsToObjects(grid)
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .filter(function (r) {
        var days = splitList(r.daysOfWeek || r.days).map(function (d) { return d.slice(0, 3).toLowerCase(); });
        return days.length === 0 || days.indexOf(TODAY) !== -1;
      })
      .map(function (r) { return { time: r.time || "", event: r.event || "", room: r.room || "" }; });
  }

  function parseBanners(grid) {
    return rowsToObjects(grid)
      .filter(function (r) { return r.imageUrl && truthy(r.active == null ? "yes" : r.active); })
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) { return { imageUrl: r.imageUrl, alt: r.alt || "" }; });
  }

  function parseHeroSlides(grid) {
    return rowsToObjects(grid)
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) {
        return {
          eyebrow: r.eyebrow || "",
          headline: splitList(r.headline),          // "A | B | C" → ["A","B","C"]
          body: r.body || "",
          primaryCta: { label: r.primaryLabel || "", href: r.primaryHref || "#" },
          secondaryCta: { label: r.secondaryLabel || "", href: r.secondaryHref || "#" },
          photo: r.photo || "",
          photoCredit: r.photoCredit || "",
        };
      });
  }

  function parseStats(grid) {
    return rowsToObjects(grid)
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) { return { num: r.num || r.number || "", label: r.label || "" }; });
  }

  function parseNews(grid) {
    return rowsToObjects(grid)
      .filter(function (r) { return r.title; })
      .sort(function (a, b) {
        return (parseFloat(a.order || "0") || 0) - (parseFloat(b.order || "0") || 0);
      })
      .map(function (r) {
        return {
          tag: r.tag || "", date: r.date || "", title: r.title,
          categories: splitList(r.categories), photo: r.photo || "",
          featured: truthy(r.featured) && String(r.featured).trim() !== "",
          body: r.body || "",
        };
      });
  }

  // ----------------------------------------------------------- normalisation --
  // Produces a SUPERSET both channels can read. The kiosk uses settings/
  // programs/services/categories/events/calendar/banners; the website uses
  // heroSlides/tiles/stats/events. Anything missing is just an empty array.
  function normalize(tabs) {
    tabs = tabs || {};
    var categories = parseGrouped(tabs.Categories, "key", [
      { in: "title", out: "title" },
      { in: "slot", out: "slot" },
      { in: "accent", out: "accent" },
      { in: "photo", out: "photo" },
      { in: "blurb", out: "blurb" },
      { in: "longDescription", out: "longDescription" },
      { in: "key", out: "key" },
    ]);
    // Website program tiles are derived from the same Categories rows.
    var tiles = categories.map(function (c) {
      return { label: c.title, accent: c.accent || "#1A1F8F", href: "/programs/" + c.key, photo: c.photo || "" };
    });

    return {
      settings: parseSettings(tabs.Settings),
      programs: parseGrouped(tabs.Programs, "group", [
        { in: "group", out: "group" },
        { in: "icon", out: "icon" },
        { in: "iconBg", out: "iconBg" },
      ]),
      services: parseGrouped(tabs.Services, "group", [
        { in: "group", out: "group" },
        { in: "icon", out: "icon" },
        { in: "iconBg", out: "iconBg" },
      ]),
      categories: categories,
      tiles: tiles,
      events: parseEvents(tabs.Events),
      calendar: parseCalendar(tabs.Calendar),
      banners: parseBanners(tabs.Banners),
      heroSlides: parseHeroSlides(tabs.HeroSlides),
      stats: parseStats(tabs.Stats),
      news: parseNews(tabs.News),
    };
  }

  // --------------------------------------------------------------- subscribe --
  var subs = [];          // active subscriber callbacks
  var lastJSON = null;    // serialised last payload, for change detection
  var lastContent = null; // parsed last payload (handed to new subscribers)
  var timer = null;

  function pull() {
    return fetchAll().then(function (tabs) {
      var content = normalize(tabs);
      var json = JSON.stringify(content);
      status.lastSync = new Date();
      status.lastError = null;
      if (json !== lastJSON) {           // only notify when something changed
        lastJSON = json;
        lastContent = content;
        subs.forEach(function (cb) { try { cb(content); } catch (e) {} });
      }
      return content;
    }).catch(function (err) {
      status.lastError = (err && err.message) || String(err);
      // keep last good content; never throw to callers
      return lastContent;
    });
  }

  function ensurePolling() {
    if (timer || subs.length === 0) return;
    status.polling = true;
    timer = setInterval(pull, POLL_MS);
    // Pause polling when the tab is hidden; refresh immediately when it returns.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      pull();
    });
  }

  function subscribeContent(cb) {
    if (typeof cb !== "function") return function () {};
    subs.push(cb);
    if (lastContent) { try { cb(lastContent); } catch (e) {} }  // hand over cached
    if (subs.length === 1) pull();                              // first subscriber → initial pull
    ensurePolling();
    return function unsubscribe() {
      var i = subs.indexOf(cb);
      if (i !== -1) subs.splice(i, 1);
      if (subs.length === 0 && timer) { clearInterval(timer); timer = null; status.polling = false; }
    };
  }

  window.HES_SHEETS = {
    configured: true,
    status: status,
    subscribeContent: subscribeContent,
    refreshNow: pull,
    // exposed for the dashboard / debugging
    _fetchAll: fetchAll,
    _normalize: normalize,
  };
})();
