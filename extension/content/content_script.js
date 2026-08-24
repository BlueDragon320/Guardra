(function () {
  // Prevent multiple injections
  if (window.__guardra_injected) return;
  window.__guardra_injected = true;

  if (location.hostname.includes("youtube.com")) {
    try { injectYouTubeMainWorldAdBlocker(); } catch (e) {}
  }

  const TRACKER_SIGNATURES = [
    { name: "Google Analytics / Tag Manager", regex: /(google-analytics\.com|googletagmanager\.com|gtag\/js)/i },
    { name: "Meta / Facebook Pixel", regex: /(connect\.facebook\.net|fbevents\.js|facebook\.com\/tr)/i },
    { name: "TikTok Pixel", regex: /(analytics\.tiktok\.com|ttq)/i },
    { name: "Microsoft Clarity", regex: /(clarity\.ms|clarity\/js)/i },
    { name: "Hotjar Session Recording", regex: /(static\.hotjar\.com|hotjar)/i },
    { name: "Criteo Ad Retargeting", regex: /(criteo\.net|criteo\.com)/i },
    { name: "Mixpanel Analytics", regex: /(mixpanel\.com|cdn\.mxpnl\.com)/i },
    { name: "Amplitude Telemetry", regex: /(amplitude\.com|cdn\.amplitude\.com)/i },
    { name: "Segment / Analytics.js", regex: /(cdn\.segment\.com|analytics\.js)/i },
    { name: "Amazon Ad System", regex: /(amazon-adsystem\.com|media-amazon\.com\/images\/G\/01\/ad-sdk)/i },
    { name: "Taboola / Outbrain Ad Feeds", regex: /(taboola\.com|outbrain\.com)/i }
  ];

  let autoActionsExecuted = [];
  let detectedTrackers = [];
  let currentRating = null;
  let isTrackerBlockingActive = true; // Default: ON
  let isAutoCookieDisableActive = false; // Default: OFF

  chrome.storage.local.get(["guardra_block_trackers", "guardra_auto_disable_cookies"], (res) => {
    isTrackerBlockingActive = res.guardra_block_trackers !== false; // Default ON
    isAutoCookieDisableActive = res.guardra_auto_disable_cookies === true; // Default OFF

    // 1. If Tracker Blocking is active (DEFAULT: ON), stub all tracker APIs & beacons
    if (isTrackerBlockingActive) {
      const code = `
        window['ga-disable-ALL'] = true;
        window.ga = function(){};
        window.gtag = function(){};
        window.fbq = function(){};
        window.ttq = { track: function(){}, page: function(){}, load: function(){} };
        window.hj = function(){};
        window._hjSettings = {};
        window.clarity = function(){};
        window.mixpanel = { track: function(){}, identify: function(){}, init: function(){} };
        window.amplitude = { logEvent: function(){}, init: function(){} };
        const originalSendBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function(url, data) {
          if (typeof url === 'string' && (
            url.includes('google-analytics.com') ||
            url.includes('googletagmanager.com') ||
            url.includes('facebook.com/tr/') ||
            url.includes('tiktok.com') ||
            url.includes('hotjar.com') ||
            url.includes('clarity.ms') ||
            url.includes('criteo.com') ||
            url.includes('outbrain.com') ||
            url.includes('taboola.com')
          )) {
            return true;
          }
          return originalSendBeacon.apply(this, arguments);
        };
      `;
      const script = document.createElement('script');
      script.textContent = code;
      if (document.documentElement) {
        document.documentElement.appendChild(script);
        script.remove();
      }
    }

    // 2. Only if Cookie Auto-Disable is explicitly enabled (DEFAULT: OFF), clear non-essential cookies
    if (isAutoCookieDisableActive) {
      setInterval(() => {
        try {
          const trackerCookieRegex = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc|_tt_|_hj|_clck|_clsk|mp_|ajs_|criteo|taboola|outbrain|__utm)/i;
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (trackerCookieRegex.test(name)) {
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
              const domain = location.hostname.replace(/^www\./i, "");
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + domain;
            }
          }
          Object.keys(localStorage).forEach(k => {
            if (trackerCookieRegex.test(k)) localStorage.removeItem(k);
          });
          Object.keys(sessionStorage).forEach(k => {
            if (trackerCookieRegex.test(k)) sessionStorage.removeItem(k);
          });
        } catch (e) {}
      }, 1000);
    }
  });

  // 1. Scan trackers across DOM, inline scripts, performance resources, window objects, and cookies
  function scanTrackers() {
    const detected = [];

    const addTracker = (name, src = "", isBlocked = isTrackerBlockingActive) => {
      const existing = detected.find(d => d.name === name);
      if (!existing) {
        detected.push({ name, src: src ? src.substring(0, 100) : "", isBlocked: isBlocked || isTrackerBlockingActive });
      } else if (isBlocked || isTrackerBlockingActive) {
        existing.isBlocked = true;
      }
    };

    // 1. Scan external script elements
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    scripts.forEach((script) => {
      const src = script.src;
      TRACKER_SIGNATURES.forEach((sig) => {
        if (sig.regex.test(src)) {
          addTracker(sig.name, src);
        }
      });
    });

    // 2. Scan inline scripts for tracker signatures
    const inlineScripts = Array.from(document.querySelectorAll("script:not([src])"));
    inlineScripts.forEach((script) => {
      const content = script.textContent || "";
      if (content.length > 0 && content.length < 60000) {
        if (/(gtag\(|google-analytics\.com|googletagmanager|GTM-[A-Z0-9]+|UA-[0-9]+)/i.test(content)) {
          addTracker("Google Analytics / Tag Manager");
        }
        if (/(fbq\(|connect\.facebook\.net|fbevents)/i.test(content)) {
          addTracker("Meta / Facebook Pixel");
        }
        if (/(ttq\.load|ttq\.track|analytics\.tiktok\.com)/i.test(content)) {
          addTracker("TikTok Pixel");
        }
        if (/(clarity\("set"|clarity\.ms)/i.test(content)) {
          addTracker("Microsoft Clarity");
        }
        if (/(hj\('identify'|static\.hotjar\.com)/i.test(content)) {
          addTracker("Hotjar Session Recording");
        }
        if (/(criteo_q|criteo\.com)/i.test(content)) {
          addTracker("Criteo Ad Retargeting");
        }
        if (/(mixpanel\.init|mixpanel\.track)/i.test(content)) {
          addTracker("Mixpanel Analytics");
        }
        if (/(amplitude\.init|amplitude\.getInstance)/i.test(content)) {
          addTracker("Amplitude Telemetry");
        }
      }
    });

    // 3. Scan Performance Resource Timing (catches network requests completed or blocked by DNR)
    try {
      if (window.performance && performance.getEntriesByType) {
        const resources = performance.getEntriesByType("resource");
        resources.forEach((r) => {
          const name = r.name || "";
          TRACKER_SIGNATURES.forEach((sig) => {
            if (sig.regex.test(name)) {
              addTracker(sig.name, name);
            }
          });
        });
      }
    } catch (e) {}

    // 4. Scan Global In-Page Tracker Objects
    if (window.ga || window.gtag || window.dataLayer || window['ga-disable-ALL']) {
      addTracker("Google Analytics / Tag Manager");
    }
    if (window.fbq) {
      addTracker("Meta / Facebook Pixel");
    }
    if (window.ttq) {
      addTracker("TikTok Pixel");
    }
    if (window.clarity) {
      addTracker("Microsoft Clarity");
    }
    if (window.hj || window._hjSettings) {
      addTracker("Hotjar Session Recording");
    }
    if (window.mixpanel) {
      addTracker("Mixpanel Analytics");
    }
    if (window.amplitude) {
      addTracker("Amplitude Telemetry");
    }

    // 5. Scan Cookies for tracker tokens
    try {
      if (document.cookie) {
        if (/(_ga|_gid|_gat|__utm|_gcl)/i.test(document.cookie)) {
          addTracker("Google Analytics / Tag Manager");
        }
        if (/(_fbp|_fbc|fr=|datr=)/i.test(document.cookie)) {
          addTracker("Meta / Facebook Pixel");
        }
        if (/(_tt_|tt_enable)/i.test(document.cookie)) {
          addTracker("TikTok Pixel");
        }
        if (/(_clck|_clsk)/i.test(document.cookie)) {
          addTracker("Microsoft Clarity");
        }
        if (/(_hj)/i.test(document.cookie)) {
          addTracker("Hotjar Session Recording");
        }
      }
    } catch (e) {}

    detectedTrackers = detected;
    return detected;
  }

  // 2. Automate Cookie Banner "Reject Optional / Only Necessary" Clicks & Dark Pattern unchecking
  function automateCookieRejection() {
    const checkboxes = Array.from(document.querySelectorAll("input[type='checkbox']"));
    let uncheckedCount = 0;
    checkboxes.forEach((cb) => {
      const label = (cb.labels && cb.labels[0] ? cb.labels[0].textContent : "") + (cb.name || "") + (cb.id || "");
      const isMarketing = /(marketing|tracking|analytics|advertising|profiling|partners|commercial|optional|third-party)/i.test(label);
      if (cb.checked && !cb.disabled && isMarketing) {
        cb.checked = false;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        uncheckedCount++;
      }
    });

    if (uncheckedCount > 0) {
      autoActionsExecuted.push(`Unchecked ${uncheckedCount} optional tracking checkboxes`);
    }

    const rejectSelectors = [
      "#onetrust-reject-all-handler",
      ".onetrust-close-btn-handler",
      "#CybotCookiebotDialogBodyButtonDecline",
      "#didomi-notice-disagree-button",
      ".qc-cmp2-buttons-desktop button:last-child",
      ".klaro .cm-btn-decline",
      ".axeptio_btn_dismiss",
      "#axeptio_btn_refuse",
      "button[aria-label*='reject' i]",
      "button[aria-label*='decline' i]",
      "button[aria-label*='deny' i]",
      "button[id*='reject' i]",
      "button[class*='reject' i]",
      "button[id*='decline' i]",
      "button[class*='decline' i]",
      "button[id*='necessary' i]",
      "button[class*='necessary' i]",
      "a[id*='reject' i]",
      "a[class*='reject' i]"
    ];

    for (const selector of rejectSelectors) {
      const btn = document.querySelector(selector);
      if (btn && btn.offsetParent !== null) {
        try {
          btn.click();
          autoActionsExecuted.push("Optional Cookies Disabler auto-clicked 'Reject Optional' on Consent Banner");
          updateFloatingPill("Optional Cookies Disabled");
          return true;
        } catch (e) {}
      }
    }

    const buttons = Array.from(document.querySelectorAll("button, a, div[role='button']"));
    for (const btn of buttons) {
      if (btn.offsetParent === null) continue;
      const text = btn.textContent.trim().toLowerCase();
      if (
        text === "reject all" ||
        text === "decline all" ||
        text === "deny all" ||
        text === "reject non-essential" ||
        text === "reject optional" ||
        text === "reject optional cookies" ||
        text === "only necessary cookies" ||
        text === "necessary only" ||
        text === "use necessary cookies only" ||
        text === "essential cookies only" ||
        text === "continue without accepting" ||
        text === "refuse all"
      ) {
        try {
          btn.click();
          autoActionsExecuted.push(`Optional Cookies Disabler auto-clicked '${btn.textContent.trim()}'`);
          updateFloatingPill(`Optional Cookies Disabled (${btn.textContent.trim()})`);
          return true;
        } catch (e) {}
      }
    }

    return false;
  }

  // 3. Automate Platform Privacy Opt-Outs (Google, Meta, Criteo, Amazon)
  function automatePlatformSettings() {
    const host = window.location.hostname.toLowerCase();
    const href = window.location.href.toLowerCase();

    if (host.includes("myadcenter.google.com")) {
      const toggles = Array.from(document.querySelectorAll("[role='switch'], button[aria-checked='true']"));
      toggles.forEach((t) => {
        if (t.getAttribute("aria-checked") === "true") {
          t.click();
          autoActionsExecuted.push("Automated click to turn OFF Google Personalized Ads");
          updateFloatingPill("Google Ads Opt-Out Applied");
        }
      });
    }

    if (host.includes("criteo.com") && href.includes("disable-criteo")) {
      const optOutBtn = document.querySelector("#opt-out-btn, .opt-out-button, button[name*='optout']");
      if (optOutBtn) {
        optOutBtn.click();
        autoActionsExecuted.push("Automated click for Criteo Ad Network suppression");
        updateFloatingPill("Criteo Opt-Out Applied");
      }
    }
  }

  // 4. In-Page Floating Guardra Pill & Mini-Bar (Shadow DOM)
  let shadowRoot = null;
  let isExpanded = false;
  let isDismissed = false;
  let cachedAutoDisable = false;
  let cachedTheme = "dark";
  let cachedAdblockStatus = { globalEnabled: true, sitePaused: false, totalBlockedCount: 0 };
  let cachedCookieAudit = null;

  function renderFloatingPill(rating) {
    if (isDismissed) return;
    chrome.storage.local.get(["guardra_inpage_enabled", "guardra_auto_disable_cookies", "guardra_theme"], (res) => {
      if (res.guardra_inpage_enabled === false) {
        const rootHost = document.getElementById("guardra-inpage-root");
        if (rootHost) rootHost.remove();
        return;
      }
      const domain = window.location.hostname.replace(/^www\./, "").toLowerCase();
      const theme = res.guardra_theme || "dark";
      const autoDisable = res.guardra_auto_disable_cookies;

      chrome.runtime.sendMessage({
        type: "GET_ADBLOCK_STATUS",
        domain: domain
      }, (adblockResp) => {
        const adblockStatus = (!chrome.runtime.lastError && adblockResp) ? adblockResp : { globalEnabled: true, sitePaused: false, totalBlockedCount: 0 };
        
        chrome.runtime.sendMessage({
          type: "GET_COOKIE_AUDIT",
          domain: domain,
          url: window.location.href
        }, (auditResp) => {
          const cookieAudit = (!chrome.runtime.lastError && auditResp) ? auditResp : null;
          _doRenderFloatingPill(rating, autoDisable, theme, adblockStatus, cookieAudit);
        });
      });
    });
  }

  function _doRenderFloatingPill(rating, autoDisableCookies = false, theme = "dark", adblockStatus = { globalEnabled: true, sitePaused: false, totalBlockedCount: 0 }, cookieAudit = null) {
    if (isDismissed) return;
    currentRating = rating;
    cachedAutoDisable = autoDisableCookies;
    cachedTheme = theme;
    if (adblockStatus) cachedAdblockStatus = adblockStatus;
    if (cookieAudit) cachedCookieAudit = cookieAudit;

    const domain = window.location.hostname.replace(/^www\./, "");
    
    let rootHost = document.getElementById("guardra-inpage-root");
    if (!rootHost) {
      rootHost = document.createElement("div");
      rootHost.id = "guardra-inpage-root";
      rootHost.style.cssText = "all: initial; position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; max-height: calc(100vh - 40px); display: flex; flex-direction: column; justify-content: flex-end; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";
      document.body.appendChild(rootHost);
      shadowRoot = rootHost.attachShadow({ mode: "open" });
    }

    const grade = rating?.grade || "C";
    const score = rating?.score !== undefined ? Math.round(rating.score) : (rating?.overall_score !== undefined ? Math.round(rating.overall_score) : 55);
    const grievanceEmail = rating?.compliance?.dpdp?.grievance_email || rating?.compliance?.gdpr?.dpo_contact || (rating?.contacts?.email && rating.contacts.email[0]) || "Not found";
    const dpdpStatusText = rating?.compliance?.dpdp?.compliant ? "Grievance Officer Active" : "Grievance Officer Not Found";
    const dpdpStatusColor = rating?.compliance?.dpdp?.compliant ? "#10b981" : "#ef4444";

    let activeCookies = [];
    let detailedCookiesList = [];
    if (cookieAudit && cookieAudit.cookies && cookieAudit.cookies.length > 0) {
      activeCookies = cookieAudit.cookies.filter(c => !c.disabled && !c.isBlocked).map(c => c.name);
      detailedCookiesList = [...cookieAudit.cookies];
    }
    if (activeCookies.length === 0) {
      try {
        if (document.cookie) {
          document.cookie.split(";").forEach(c => {
            const name = c.split("=")[0].trim();
            if (name && !activeCookies.includes(name)) {
              activeCookies.push(name);
              const isEss = isEssentialCookie({ name });
              if (!detailedCookiesList.some(dc => dc.name === name)) {
                detailedCookiesList.push({
                  name: name,
                  isTracking: !isEss,
                  category: isEss ? "Essential Cookie" : "Analytics/Advertising",
                  isBlocked: autoDisableCookies && !isEss
                });
              }
            }
          });
        }
      } catch (e) {}
    }

    // Merge any cached disabled cookies so they remain visible with a disabled tag
    if (window.__guardra_disabled_cookies) {
      window.__guardra_disabled_cookies.forEach(dc => {
        if (!detailedCookiesList.some(c => c.name === dc.name)) {
          detailedCookiesList.push({
            name: dc.name,
            isTracking: true,
            category: dc.category || "Analytics (Disabled)",
            isBlocked: true,
            disabled: true
          });
        }
      });
    }

    // Merge detected trackers, cookie audit trackers, and rating trackers
    const combinedTrackerMap = new Map();
    (detectedTrackers || []).forEach(t => {
      const name = typeof t === "string" ? t : (t.name || "Tracker");
      combinedTrackerMap.set(name, {
        name: name,
        src: t.src || "",
        isBlocked: isTrackerBlockingActive || t.isBlocked
      });
    });

    if (cookieAudit && cookieAudit.trackers) {
      cookieAudit.trackers.forEach(t => {
        const name = typeof t === "string" ? t : (t.name || "Tracker");
        const existing = combinedTrackerMap.get(name);
        if (!existing) {
          combinedTrackerMap.set(name, {
            name: name,
            src: typeof t === "object" ? (t.src || "") : "",
            isBlocked: isTrackerBlockingActive || (typeof t === "object" && t.isBlocked)
          });
        } else if (isTrackerBlockingActive || (typeof t === "object" && t.isBlocked)) {
          existing.isBlocked = true;
        }
      });
    }

    if (rating && rating.trackers) {
      rating.trackers.forEach(t => {
        const name = typeof t === "string" ? t : (t.name || "Tracker");
        if (!combinedTrackerMap.has(name)) {
          combinedTrackerMap.set(name, {
            name: name,
            src: "",
            isBlocked: isTrackerBlockingActive
          });
        }
      });
    }

    const trackerList = Array.from(combinedTrackerMap.values());

    const blockedCount = adblockStatus.tabBlockedCount !== undefined ? adblockStatus.tabBlockedCount : (adblockStatus.totalBlockedCount || 0);
    const lifetimeCount = adblockStatus.lifetimeBlockedCount || 0;
    const isPaused = !!adblockStatus.sitePaused;
    const isGlobalOff = adblockStatus.globalEnabled === false;
    const isLight = theme === "light";

    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      ::selection { background: #FF6B50; color: #fff; }
      
      .pill-container {
        display: flex;
        align-items: center;
        gap: 7px;
        background: ${isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(17, 17, 17, 0.94)'};
        backdrop-filter: blur(14px);
        color: ${isLight ? '#0f172a' : '#ebebeb'};
        border: 1px solid ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'};
        border-radius: 14px;
        padding: 6px 12px;
        font-size: 11px;
        box-shadow: ${isLight ? '0 10px 30px rgba(0,0,0,0.12)' : '0 12px 36px rgba(0,0,0,0.75)'};
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        user-select: none;
      }
      .pill-container:hover {
        background: ${isLight ? '#ffffff' : '#181818'};
        border-color: ${isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)'};
        transform: translateY(-2px);
      }
      .logo-shield {
        background: ${isLight ? '#0f172a' : '#ffffff'};
        color: ${isLight ? '#ffffff' : '#000000'};
        font-weight: 900;
        font-size: 11px;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s ease;
      }
      .pill-container:hover .logo-shield {
        transform: rotate(12deg);
      }
      .grade-pill {
        background: ${isLight ? '#f1f5f9' : '#1a1a1a'};
        color: ${isLight ? '#0f172a' : '#ebebeb'};
        padding: 2px 6px;
        border-radius: 6px;
        font-weight: 800;
        font-family: monospace;
        border: 1px solid ${isLight ? '#cbd5e1' : '#2a2a2a'};
      }
      .close-btn {
        background: none;
        border: none;
        color: ${isLight ? '#94a3b8' : '#888888'};
        cursor: pointer;
        font-size: 15px;
        line-height: 1;
        padding: 2px 4px;
        margin-left: 2px;
        transition: all 0.2s ease;
      }
      .close-btn:hover {
        color: #FF6B50;
        transform: scale(1.15);
      }
      .pill-chip {
        background: ${isLight ? '#f8fafc' : '#161616'};
        padding: 2px 7px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 10px;
        color: ${isLight ? '#475569' : '#aaaaaa'};
        border: 1px solid ${isLight ? '#e2e8f0' : '#222222'};
        display: inline-flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      }
      .pill-chip.adblock-active {
        background: ${isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.15)'};
        color: ${isLight ? '#059669' : '#10b981'};
        border-color: ${isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.35)'};
        font-weight: 700;
      }
      .pill-chip.adblock-paused {
        background: ${isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.15)'};
        color: ${isLight ? '#d97706' : '#f59e0b'};
        border-color: ${isLight ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.35)'};
        font-weight: 700;
      }
      .pill-chip.adblock-disabled {
        background: ${isLight ? '#f1f5f9' : '#181818'};
        color: ${isLight ? '#64748b' : '#71717a'};
      }

      /* Expanded Panel */
      .panel-container {
        width: 330px;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        overflow-x: hidden;
        background: ${isLight ? '#ffffff' : '#050505'};
        border: 1px solid ${isLight ? '#e2e8f0' : '#222222'};
        border-radius: 18px;
        padding: 14px;
        box-shadow: ${isLight ? '0 20px 50px rgba(0,0,0,0.18)' : '0 20px 50px rgba(0,0,0,0.88)'};
        color: ${isLight ? '#0f172a' : '#ebebeb'};
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scrollbar-width: thin;
        scrollbar-color: ${isLight ? '#cbd5e1 #f1f5f9' : '#333333 #111111'};
      }
      .panel-container::-webkit-scrollbar { width: 5px; }
      .panel-container::-webkit-scrollbar-track { background: ${isLight ? '#f1f5f9' : '#111111'}; border-radius: 4px; }
      .panel-container::-webkit-scrollbar-thumb { background: ${isLight ? '#cbd5e1' : '#333333'}; border-radius: 4px; }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid ${isLight ? '#e2e8f0' : '#222222'};
        padding-bottom: 10px;
      }
      .site-title { font-weight: 800; font-size: 13px; color: ${isLight ? '#0f172a' : '#ffffff'}; }
      .meta-row { display: flex; justify-content: space-between; color: ${isLight ? '#64748b' : '#888888'}; font-size: 10.5px; }
      
      .section-card {
        background: ${isLight ? '#f8fafc' : '#111111'};
        border: 1px solid ${isLight ? '#e2e8f0' : '#222222'};
        border-radius: 12px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .action-btn {
        background: #FF6B50;
        color: #000000;
        border: none;
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        text-align: center;
        display: block;
        text-decoration: none;
        transition: all 0.2s ease;
      }
      .action-btn:hover { background: #E55A40; color: #ffffff; }
      .secondary-btn {
        background: ${isLight ? '#ffffff' : '#161616'};
        color: ${isLight ? '#0f172a' : '#ebebeb'};
        border: 1px solid ${isLight ? '#cbd5e1' : '#333333'};
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 10.5px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        display: block;
        transition: all 0.2s ease;
      }
      .secondary-btn:hover { background: ${isLight ? '#f1f5f9' : '#222222'}; }

      .expandable-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 3px 0;
        font-weight: 700;
        font-size: 11px;
        color: ${isLight ? '#0f172a' : '#ffffff'};
      }
      .expandable-content {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 6px;
        max-height: 180px;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
      }
      .item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: ${isLight ? '#f8fafc' : '#141414'};
        border: 1px solid ${isLight ? '#e2e8f0' : '#262626'};
        border-radius: 8px;
        padding: 6px 9px;
        gap: 8px;
        transition: all 0.2s ease;
      }
      .item-row.disabled {
        opacity: 0.6;
        border-color: ${isLight ? '#e2e8f0' : '#202020'};
      }
      .item-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
        flex: 1;
      }
      .item-name {
        font-size: 11px;
        font-weight: 700;
        color: ${isLight ? '#0f172a' : '#f1f5f9'};
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      .item-badge {
        font-size: 9px;
        font-weight: 600;
        padding: 1px 6px;
        border-radius: 6px;
        display: inline-block;
        width: fit-content;
      }
      .item-badge.tracking {
        background: rgba(255, 107, 80, 0.15);
        color: #FF6B50;
        border: 1px solid rgba(255, 107, 80, 0.3);
      }
      .item-badge.essential {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .btn-item-action {
        background: ${isLight ? '#ffffff' : '#1e1e1e'};
        color: ${isLight ? '#ef4444' : '#f87171'};
        border: 1px solid ${isLight ? '#fca5a5' : '#451a1a'};
        border-radius: 6px;
        padding: 3px 8px;
        font-size: 9.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .btn-item-action:hover:not(.disabled) {
        background: #ef4444;
        color: #ffffff;
        border-color: #ef4444;
      }
      .btn-item-action.disabled {
        background: ${isLight ? '#f1f5f9' : '#1a1a1a'};
        color: ${isLight ? '#94a3b8' : '#64748b'};
        border-color: ${isLight ? '#e2e8f0' : '#2a2a2a'};
        cursor: default;
      }
      .btn-section-action {
        background: ${isLight ? '#f1f5f9' : '#1e1e1e'};
        color: ${isLight ? '#0f172a' : '#ebebeb'};
        border: 1px solid ${isLight ? '#cbd5e1' : '#333333'};
        border-radius: 6px;
        padding: 3px 7px;
        font-size: 9.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }
      .btn-section-action:hover:not(.disabled) {
        background: #FF6B50;
        color: #ffffff;
        border-color: #FF6B50;
      }
      .btn-section-action.disabled {
        background: ${isLight ? '#f8fafc' : '#161616'};
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.3);
        cursor: default;
      }
      .tracker-chip {
        display: inline-flex;
        align-items: center;
        font-weight: 700;
        font-size: 10px;
        background: rgba(255, 107, 80, 0.12);
        border: 1px solid rgba(255, 107, 80, 0.3);
        color: #FF6B50;
        padding: 3px 8px;
        border-radius: 10px;
        white-space: nowrap;
      }
      .cookie-chip {
        display: inline-flex;
        align-items: center;
        font-weight: 700;
        font-family: monospace;
        font-size: 10px;
        background: ${isLight ? '#f1f5f9' : '#181818'};
        border: 1px solid ${isLight ? '#e2e8f0' : '#333333'};
        color: ${isLight ? '#334155' : '#ebebeb'};
        padding: 3px 8px;
        border-radius: 10px;
        white-space: nowrap;
      }
    `;

    // AdBlock Chip HTML in Collapsed Pill
    let adblockChipHtml = "";
    if (isGlobalOff) {
      adblockChipHtml = `<span class="pill-chip adblock-disabled">🛡️ Ads Off</span>`;
    } else {
      adblockChipHtml = `<span class="pill-chip adblock-active">🛡️ ${blockedCount} Blocked (${lifetimeCount} Total)</span>`;
    }

    if (!isExpanded) {
      shadowRoot.innerHTML = `
        <style>${css}</style>
        <div class="pill-container" id="guardra-pill">
          <span class="logo-shield">G.</span>
          <span style="font-weight:700;">${domain}</span>
          <span class="grade-pill">${grade} (${score}/100)</span>
          ${adblockChipHtml}
          <span class="pill-chip">⚡ ${trackerList.length} Trackers</span>
          <span class="pill-chip">🍪 ${activeCookies.length} Cookies</span>
          <button class="close-btn" id="guardra-close-pill" title="Dismiss">✕</button>
        </div>
      `;

      shadowRoot.getElementById("guardra-pill").addEventListener("click", (e) => {
        if (e.target.id === "guardra-close-pill") return;
        isExpanded = true;
        _doRenderFloatingPill(currentRating, cachedAutoDisable, cachedTheme, cachedAdblockStatus, cachedCookieAudit);
        renderFloatingPill(currentRating);
      });

      shadowRoot.getElementById("guardra-close-pill").addEventListener("click", (e) => {
        e.stopPropagation();
        isDismissed = true;
        chrome.storage.local.set({ guardra_inpage_enabled: false });
        rootHost.remove();
      });
    } else {
      const breaches = currentRating?.breaches || [];

      const breachHtml = breaches.length > 0 ? `
        <div class="section-card" style="border-color: rgba(255,107,80,0.4); background: rgba(255,107,80,0.08);">
          <div class="meta-row" style="color: #FF6B50; font-weight:700;">
            <span>🚨 Breach: ${breaches[0].breach_date || "Recorded"}</span>
            <span>${breaches.length} Incident${breaches.length > 1 ? "s" : ""}</span>
          </div>
          <div style="font-size:10px; color:${isLight ? '#334155' : '#ebebeb'}; margin-top:2px; line-height:1.2;">
            ${breaches[0].name}
          </div>
          ${breaches[0].article_url ? `
            <a href="${breaches[0].article_url}" target="_blank" style="color:#FF6B50; font-size:9.5px; margin-top:3px; text-decoration:none; display:inline-block; font-weight:600;">
              🔗 Read Investigative Article &rarr;
            </a>
          ` : ""}
        </div>
      ` : "";

      // Adblock Section in Expanded Panel
      const adblockPanelHtml = `
        <div class="section-card" style="border-left: 3px solid ${isGlobalOff ? '#64748b' : '#10b981'};">
          <div class="meta-row" style="align-items:center;">
            <span style="font-weight:700; color:${isLight ? '#0f172a' : '#ffffff'};">🛡️ Ad & Tracker Shield</span>
            <span style="color:${isGlobalOff ? '#64748b' : '#10b981'}; font-weight:700; font-family:monospace;">
              ${isGlobalOff ? 'DISABLED' : `${blockedCount} Session / ${lifetimeCount} Total`}
            </span>
          </div>
          <div style="font-size:10px; color:${isLight ? '#64748b' : '#888888'};">
            ${isGlobalOff ? 'Ad blocking is turned OFF across all websites.' : 'DNR engine & cosmetic rules actively blocking ads.'}
          </div>
        </div>
      `;

      shadowRoot.innerHTML = `
        <style>${css}</style>
        <div class="panel-container">
          <div class="panel-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="logo-shield">G.</span>
              <div>
                <div class="site-title">${domain}</div>
                <div style="font-size:9.5px; color:${isLight ? '#64748b' : '#888888'}; font-family:monospace; text-transform:uppercase; letter-spacing:0.05em;">Midnight Audit</div>
              </div>
            </div>
            <button class="close-btn" id="guardra-minimize-panel" title="Minimize">✕</button>
          </div>

          <div class="section-card">
            <div class="meta-row">
              <span>Privacy Score</span>
              <span style="font-family:monospace; font-weight:700; color:${isLight ? '#0f172a' : '#fff'};">${grade} (${score}/100)</span>
            </div>
            <div class="meta-row">
              <span>DPDP Act 2023</span>
              <span style="color:${dpdpStatusColor}; font-weight:600;">${dpdpStatusText}</span>
            </div>
            <div class="meta-row">
              <span>Grievance Contact</span>
              <span style="font-family:monospace; color:${grievanceEmail === 'Not found' ? '#ef4444' : '#38bdf8'};">${grievanceEmail}</span>
            </div>
          </div>

          ${adblockPanelHtml}
          ${breachHtml}

          <div class="section-card" style="padding: 10px;">
            <div class="expandable-header" id="guardra-trackers-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span>⚡ Trackers (${trackerList.length})</span>
                ${trackerList.length > 0 ? `<button class="btn-section-action" id="guardra-disable-all-trackers-btn" title="Disable all trackers on this page">⚡ Disable All Trackers</button>` : ''}
              </div>
              <span class="toggle-icon" id="guardra-trackers-icon">▼</span>
            </div>
            <div class="expandable-content" id="guardra-trackers-content">
              ${trackerList.length > 0 ? trackerList.map((t, idx) => {
                const tName = typeof t === "string" ? t : (t.name || "Tracker");
                const isBlocked = isTrackerBlockingActive || t.isBlocked;
                const lower = tName.toLowerCase();
                let badgeCategory = "Telemetry Script";
                if (lower.includes("google") || lower.includes("analytics")) badgeCategory = "Analytics Tracker";
                else if (lower.includes("meta") || lower.includes("facebook") || lower.includes("pixel")) badgeCategory = "Social / Ad Pixel";
                else if (lower.includes("tiktok")) badgeCategory = "Social Pixel";
                else if (lower.includes("criteo") || lower.includes("taboola") || lower.includes("outbrain")) badgeCategory = "Ad Retargeting";
                else if (lower.includes("hotjar") || lower.includes("clarity")) badgeCategory = "Session Recording";

                return `
                  <div class="item-row ${isBlocked ? 'disabled' : ''}" id="guardra-tracker-row-${idx}">
                    <div class="item-info">
                      <div class="item-name">${tName}</div>
                      <span class="item-badge tracking">${badgeCategory}</span>
                    </div>
                    <button class="btn-item-action btn-disable-tracker ${isBlocked ? 'disabled' : ''}" data-tracker-name="${tName}" data-idx="${idx}">
                      ${isBlocked ? '✅ Disabled' : 'Disable'}
                    </button>
                  </div>
                `;
              }).join("") : `<span style="color: #71717a; font-size: 10px; font-style: italic; padding: 4px 0;">None detected on page</span>`}
            </div>
          </div>

          <div class="section-card" style="padding: 10px;">
            <div class="expandable-header" id="guardra-cookies-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span>🍪 Cookies (${detailedCookiesList.length})</span>
                <button class="btn-section-action" id="guardra-disable-non-essential-cookies-btn" title="Purge advertising & analytics cookies">🍪 Disable Non-Essential Cookies</button>
              </div>
              <span class="toggle-icon" id="guardra-cookies-icon">▼</span>
            </div>
            <div class="expandable-content" id="guardra-cookies-content">
              ${detailedCookiesList.length > 0 ? detailedCookiesList.map((c, idx) => {
                const cName = c.name || c;
                const isTracking = c.isTracking !== undefined ? c.isTracking : !isEssentialCookie({ name: cName });
                const isBlocked = (autoDisableCookies && isTracking) || c.isBlocked || c.disabled;
                const category = c.category || (isTracking ? "Analytics/Tracking" : "Essential Cookie");

                return `
                  <div class="item-row ${isBlocked ? 'disabled' : ''}" id="guardra-cookie-row-${idx}">
                    <div class="item-info">
                      <div class="item-name" style="font-family: monospace;">${cName}</div>
                      <span class="item-badge ${isTracking ? 'tracking' : 'essential'}">${category}</span>
                    </div>
                    <button class="btn-item-action btn-disable-cookie ${isBlocked ? 'disabled' : ''}" data-cookie-name="${cName}" data-idx="${idx}">
                      ${isBlocked ? '✅ Disabled' : 'Disable'}
                    </button>
                  </div>
                `;
              }).join("") : `<span style="color: #71717a; font-size: 10px; font-style: italic; padding: 4px 0;">No cookies stored</span>`}
            </div>
          </div>
        </div>
      `;

      const trackersHeader = shadowRoot.getElementById("guardra-trackers-header");
      const trackersContent = shadowRoot.getElementById("guardra-trackers-content");
      const trackersIcon = shadowRoot.getElementById("guardra-trackers-icon");
      if (trackersHeader && trackersContent) {
        trackersHeader.addEventListener("click", (e) => {
          e.stopPropagation();
          const isClosed = trackersContent.style.display === "none";
          trackersContent.style.display = isClosed ? "flex" : "none";
          if (trackersIcon) {
            trackersIcon.textContent = isClosed ? "▼" : "▲";
          }
        });
      }

      const cookiesHeader = shadowRoot.getElementById("guardra-cookies-header");
      const cookiesContent = shadowRoot.getElementById("guardra-cookies-content");
      const cookiesIcon = shadowRoot.getElementById("guardra-cookies-icon");
      if (cookiesHeader && cookiesContent) {
        cookiesHeader.addEventListener("click", (e) => {
          e.stopPropagation();
          const isClosed = cookiesContent.style.display === "none";
          cookiesContent.style.display = isClosed ? "flex" : "none";
          if (cookiesIcon) {
            cookiesIcon.textContent = isClosed ? "▼" : "▲";
          }
        });
      }

      const disableAllTrackersBtn = shadowRoot.getElementById("guardra-disable-all-trackers-btn");
      if (disableAllTrackersBtn) {
        disableAllTrackersBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          disableAllTrackersBtn.textContent = "Disabling...";
          chrome.storage.local.set({ guardra_block_trackers: true });
          trackerList.forEach((t, idx) => {
            const tName = typeof t === "string" ? t : (t.name || "Tracker");
            chrome.runtime.sendMessage({
              type: "BLOCK_TRACKER_SCRIPT",
              trackerName: tName,
              domain: domain,
              url: window.location.href
            });
            const row = shadowRoot.getElementById(`guardra-tracker-row-${idx}`);
            if (row) row.classList.add("disabled");
          });
          shadowRoot.querySelectorAll(".btn-disable-tracker").forEach(b => {
            b.textContent = "✅ Disabled";
            b.classList.add("disabled");
          });
          disableAllTrackersBtn.textContent = "✅ Trackers Disabled";
          disableAllTrackersBtn.classList.add("disabled");
        });
      }

      const disableNonEssentialCookiesBtn = shadowRoot.getElementById("guardra-disable-non-essential-cookies-btn");
      if (disableNonEssentialCookiesBtn) {
        disableNonEssentialCookiesBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          disableNonEssentialCookiesBtn.textContent = "Disabling...";
          chrome.runtime.sendMessage({
            type: "ENFORCE_STRICT_COOKIES",
            domain: domain,
            url: window.location.href
          }, () => {
            disableNonEssentialCookiesBtn.textContent = "✅ Non-Essential Disabled";
            disableNonEssentialCookiesBtn.classList.add("disabled");
            shadowRoot.querySelectorAll(".btn-disable-cookie").forEach(b => {
              b.textContent = "✅ Disabled";
              b.classList.add("disabled");
            });
            shadowRoot.querySelectorAll(".item-badge.tracking").forEach(badge => {
              const row = badge.closest(".item-row");
              if (row) row.classList.add("disabled");
            });
          });
        });
      }

      shadowRoot.querySelectorAll(".btn-disable-tracker").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const tName = btn.getAttribute("data-tracker-name");
          const idx = btn.getAttribute("data-idx");
          if (btn.classList.contains("disabled")) return;

          btn.textContent = "Disabling...";
          btn.style.opacity = "0.7";

          chrome.runtime.sendMessage({
            type: "BLOCK_TRACKER_SCRIPT",
            trackerName: tName,
            domain: domain,
            url: window.location.href
          }, () => {
            btn.textContent = "✅ Disabled";
            btn.classList.add("disabled");
            btn.style.opacity = "1";
            const row = shadowRoot.getElementById(`guardra-tracker-row-${idx}`);
            if (row) row.classList.add("disabled");
          });
        });
      });

      shadowRoot.querySelectorAll(".btn-disable-cookie").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const cName = btn.getAttribute("data-cookie-name");
          const idx = btn.getAttribute("data-idx");
          if (btn.classList.contains("disabled")) return;

          btn.textContent = "Disabling...";
          btn.style.opacity = "0.7";

          chrome.runtime.sendMessage({
            type: "REMOVE_SINGLE_COOKIE",
            name: cName,
            domain: domain,
            url: window.location.href
          }, () => {
            btn.textContent = "✅ Disabled";
            btn.classList.add("disabled");
            btn.style.opacity = "1";
            const row = shadowRoot.getElementById(`guardra-cookie-row-${idx}`);
            if (row) row.classList.add("disabled");
            
            window.__guardra_disabled_cookies = window.__guardra_disabled_cookies || [];
            if (!window.__guardra_disabled_cookies.some(d => d.name === cName)) {
              window.__guardra_disabled_cookies.push({ name: cName, category: "Analytics/Tracking (Disabled)" });
            }

            try {
              document.cookie = cName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
              document.cookie = cName + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + domain;
            } catch (err) {}
          });
        });
      });

      const minBtn = shadowRoot.getElementById("guardra-minimize-panel");
      if (minBtn) {
        minBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          isExpanded = false;
          _doRenderFloatingPill(currentRating, cachedAutoDisable, cachedTheme, cachedAdblockStatus, cachedCookieAudit);
          renderFloatingPill(currentRating);
        });
      }
    }
  }

  function updateFloatingPill(statusText) {
    if (shadowRoot && !isExpanded) {
      const pill = shadowRoot.getElementById("guardra-pill");
      if (pill) {
        pill.innerHTML = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981;"></span><span style="font-weight:600; color:#34d399;">${statusText}</span>`;
        setTimeout(() => {
          if (shadowRoot && !isExpanded) renderFloatingPill(currentRating);
        }, 3000);
      }
    }
  }

  let lastTelemetrySent = 0;
  let lastDomain = "";

  // 5. Send Telemetry to background & backend
  function sendTelemetry() {
    const now = Date.now();
    if (now - lastTelemetrySent < 15000 && lastDomain === window.location.hostname) return;
    lastTelemetrySent = now;
    lastDomain = window.location.hostname;

    const trackers = scanTrackers();

    try {
      chrome.runtime.sendMessage({
        type: "BROWSER_ACTIVITY",
        data: {
          url: window.location.href,
          hostname: window.location.hostname,
          trackers_detected: trackers,
          tracker_count: trackers.length,
          auto_actions: autoActionsExecuted
        }
      }, () => {
        if (chrome.runtime.lastError) {}
      });
    } catch (e) {}
  }


  // Broadcast telemetry immediately
  sendTelemetry();
  
  // 6. Request rating and initialize on page
  function init() {
    checkAndApplyCosmeticFilter();
    scanTrackers();
    automateCookieRejection();
    automatePlatformSettings();
    sendTelemetry();

    const urlLower = window.location.href.toLowerCase();
    if (urlLower.includes("privacy") || urlLower.includes("privacy-policy")) {
      const title = document.title || "";
      const text = document.body ? document.body.innerText.substring(0, 10000) : "";
      if (text) {
        try {
          chrome.runtime.sendMessage({
            type: "UPDATE_POLICY_CACHE",
            data: {
              url: window.location.href,
              hostname: window.location.hostname,
              title: title,
              text: text
            }
          });
        } catch (e) {}
      }
    }

    const domain = window.location.hostname.replace(/^www\./, "").toLowerCase();
    chrome.runtime.sendMessage({ type: "GET_CURRENT_RATING", domain: domain, url: window.location.href }, (res) => {
      if (res && res.rating) {
        renderFloatingPill(res.rating);
      } else {
        renderFloatingPill({
          domain: domain,
          name: domain.split(".")[0].toUpperCase(),
          grade: "C",
          score: 55,
          color: "amber"
        });
      }
    });
  }

  // 7. Strict Cookie Enforcement & Always-On In-Page Shield listeners
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes.guardra_inpage_enabled !== undefined) {
        const enabled = changes.guardra_inpage_enabled.newValue !== false;
        if (!enabled) {
          isDismissed = true;
          const rootHost = document.getElementById("guardra-inpage-root");
          if (rootHost) rootHost.remove();
        } else {
          isDismissed = false;
          if (currentRating) renderFloatingPill(currentRating);
        }
      }
      if (changes.guardra_theme !== undefined || changes.adblock_paused_domains !== undefined || changes.adblock_global_enabled !== undefined) {
        if (currentRating) renderFloatingPill(currentRating);
      }
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "THEME_CHANGED") {
      if (currentRating) renderFloatingPill(currentRating);
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "ADBLOCK_ITEM_BLOCKED") {
      if (currentRating && !isDismissed) renderFloatingPill(currentRating);
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "TOGGLE_INPAGE_SHIELD") {
      if (msg.enabled === false) {
        isDismissed = true;
        const rootHost = document.getElementById("guardra-inpage-root");
        if (rootHost) rootHost.remove();
      } else {
        isDismissed = false;
        renderFloatingPill(currentRating);
      }
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "STRICT_COOKIES_ENFORCED") {
      try {
        // Purge tracking keys from localStorage
        const trackerKeyRegex = /^(_ga|_gid|_gat|_fbp|_fbc|amplitude|mixpanel|_hj|mp_|_clck|_clsk|criteo)/i;
        Object.keys(localStorage).forEach(k => {
          if (trackerKeyRegex.test(k)) localStorage.removeItem(k);
        });
        Object.keys(sessionStorage).forEach(k => {
          if (trackerKeyRegex.test(k)) sessionStorage.removeItem(k);
        });
      } catch (e) {}

      automateCookieRejection();
      updateFloatingPill("Strict Cookies Enforced");
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "BLOCK_ALL_TRACKERS") {
      isTrackerBlockingActive = true;
      (detectedTrackers || []).forEach(t => {
        t.isBlocked = true;
      });
      if (currentRating && !isDismissed) {
        renderFloatingPill(currentRating);
      }
      updateFloatingPill("Trackers Disabled");
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "ADBLOCK_COUNT_UPDATED" || msg.type === "COOKIE_AUDIT_UPDATED") {
      if (currentRating && !isDismissed) {
        renderFloatingPill(currentRating);
      }
      sendResponse({ success: true });
      return true;
    }

    if (msg.type === "ADBLOCK_GLOBAL_CHANGED") {
      if (msg.enabled === false) {
        removeCosmeticAdFilter();
      } else {
        checkAndApplyCosmeticFilter();
      }
      if (currentRating) renderFloatingPill(currentRating);
      sendResponse({ success: true });
      return true;
    }
  });

  // --- Comprehensive Cosmetic & SPA Sponsored Post Blocker Engine ---
  const COSMETIC_AD_SELECTORS = [
    // Standard Ad Networks & Banners
    "ins.adsbygoogle",
    "div[id^='google_ads_iframe']",
    "iframe[id^='google_ads_frame']",
    "div[id*='gpt-ad']",
    "div[id*='dfp-ad']",
    ".ad-container",
    ".ad-banner",
    ".ad-wrapper",
    ".ad-slot",
    ".ad_slot",
    ".ad-box",
    ".sponsored-post",
    ".sponsored-content",
    ".native-ad",
    ".trc_rbox_div",
    ".outbrain_widget",
    ".taboola-ad",
    ".taboola-container",
    "div[data-ad-unit]",
    "div[data-ad-slot]",
    "div[data-ad-client]",
    "div[data-google-query-id]",
    "div[id^='taboola-']",
    "div[id^='outbrain-']",
    "div[id^='criteo-']",

    // Instagram Web Sponsored Posts & Stories
    "article:has(a[href*='/about/this_ad/'])",
    "article:has(a[href*='/ads/'])",
    "article:has(a[href*='about_this_ad'])",
    "article:has(svg[aria-label*='Sponsored'])",
    "div[data-ad-preview]",
    "div[data-ad-rendering]",
    "div:has(> a[href*='/about/this_ad/'])",

    // Facebook Sponsored Feed Units
    "div[data-pagelet*='FeedUnit']:has(a[href*='/ads/about'])",
    "div[data-pagelet*='sponsor']",
    "div[data-pagelet*='AdBreak']",

    // Reddit Promoted Posts
    "div[data-promoted='true']",
    "shreddit-post[is-promoted='true']",
    ".promotedlink",

    // Twitter / X Promoted Tweets
    "article[data-testid='tweet']:has(svg[aria-label*='Promoted'])",

    // Google Search Sponsored Ads
    "div[data-text-ad]",
    "div#tads",
    "div#tadsb",
    "div#bottomads",

    // YouTube Video & Feed Ads
    "ytd-ad-slot-renderer",
    "ytd-in-feed-ad-layout-renderer",
    "ytd-banner-promo-renderer",
    "#masthead-ad",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-promoted-sparkles-text-search-renderer",
    "ytd-compact-promoted-video-renderer",
    "ytd-promoted-video-renderer",
    ".ytp-ad-overlay-container",
    ".ytp-ad-message-container",
    ".ytp-ad-text",
    "ytd-engagement-panel-section-list-renderer[target-id='engagement-panel-ads']",
    "ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
    "ytd-player-legacy-desktop-watch-ads-renderer",
    "ytd-action-companion-ad-renderer",
    "#player-ads",
    ".ytp-ad-image-overlay",
    ".ytp-ad-module",
    ".ytp-ad-player-overlay",
    ".ytp-ad-player-overlay-layout",
    ".ytp-ad-player-overlay-flyout-cta",
    ".ytp-ad-button-vm",
    ".ytp-ad-overlay-image",
    ".ytp-ad-text-overlay",
    ".ytp-ad-preview-container",
    "ytd-statement-banner-renderer",
    "ytd-mealbar-promo-renderer",
    "yt-smart-banner-renderer",
    "#sparkles-container",
    ".ytd-page-manager > ytd-search-pyv-ad-renderer"
  ];

  let spaAdSweeperInterval = null;
  let spaAdObserver = null;

  function runSpaAdSweep() {
    const host = location.hostname.toLowerCase();

    // 1. Instagram Web Sponsored Posts & Stories Sweeper
    if (host.includes("instagram.com")) {
      const candidates = document.querySelectorAll("article, div[role='dialog'] section, div[data-testid]");
      candidates.forEach(art => {
        if (art.getAttribute("data-guardra-blocked") === "true") return;

        const hasAdLink = art.querySelector("a[href*='/about/this_ad/'], a[href*='/ads/'], a[href*='about_this_ad']");
        const hasAdSvg = art.querySelector("svg[aria-label='Sponsored'], svg[aria-label='Patrocinado'], svg[aria-label='Gesponsert']");

        let isSponsoredText = false;
        if (!hasAdLink && !hasAdSvg) {
          const spans = art.querySelectorAll("span, a");
          for (const s of spans) {
            const txt = (s.textContent || "").trim();
            if (txt === "Sponsored" || txt === "Paid partnership" || txt === "Patrocinado" || txt === "Gesponsert" || txt === "Sponsorisé") {
              if (s.children.length === 0 && txt.length < 25) {
                isSponsoredText = true;
                break;
              }
            }
          }
        }

        if (hasAdLink || hasAdSvg || isSponsoredText) {
          art.setAttribute("data-guardra-blocked", "true");
          art.style.cssText = "display: none !important; visibility: hidden !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; pointer-events: none !important;";
          reportBlockedAd();
        }
      });
    }

    // 2. Facebook Web Sponsored Posts
    if (host.includes("facebook.com")) {
      const units = document.querySelectorAll("div[data-pagelet*='FeedUnit'], div[role='article']");
      units.forEach(unit => {
        if (unit.getAttribute("data-guardra-blocked") === "true") return;
        const hasAdLink = unit.querySelector("a[href*='/ads/about/']");
        if (hasAdLink) {
          unit.setAttribute("data-guardra-blocked", "true");
          unit.style.cssText = "display: none !important; height: 0 !important; overflow: hidden !important;";
          reportBlockedAd();
        }
      });
    }

    // 3. Reddit Promoted Posts
    if (host.includes("reddit.com")) {
      const redditAds = document.querySelectorAll("shreddit-post[is-promoted='true'], div[data-promoted='true'], .promotedlink");
      redditAds.forEach(post => {
        if (post.getAttribute("data-guardra-blocked") === "true") return;
        post.setAttribute("data-guardra-blocked", "true");
        post.style.cssText = "display: none !important; height: 0 !important; overflow: hidden !important;";
        reportBlockedAd();
      });
    }

    // 4. Twitter / X Promoted Tweets
    if (host.includes("x.com") || host.includes("twitter.com")) {
      const tweets = document.querySelectorAll("article[data-testid='tweet']");
      tweets.forEach(tweet => {
        if (tweet.getAttribute("data-guardra-blocked") === "true") return;
        const spans = tweet.querySelectorAll("span");
        let isPromoted = false;
        for (const s of spans) {
          const txt = (s.textContent || "").trim();
          if (txt === "Promoted" || txt === "Ad") {
            isPromoted = true;
            break;
          }
        }
        if (isPromoted) {
          tweet.setAttribute("data-guardra-blocked", "true");
          tweet.style.cssText = "display: none !important; height: 0 !important; overflow: hidden !important;";
          reportBlockedAd(1);
        }
      });
    }

    // 5. Generic Web & News Site Ad Units (Google Ads, DFP/GPT, Taboola, Outbrain, Criteo, ad iframes)
    const genericAdSelectors = [
      "ins.adsbygoogle",
      "div[id^='div-gpt-ad']",
      "div[id*='google_ads']",
      "div[id*='gpt-ad']",
      "div[data-google-query-id]",
      "div[data-ad-unit]",
      "div[data-ad-slot]",
      "div[data-ad-client]",
      "div[data-dfp]",
      "iframe[id*='google_ads']",
      "iframe[src*='googleads']",
      "iframe[src*='doubleclick']",
      "iframe[id*='taboola']",
      "iframe[src*='taboola']",
      "div[class*='taboola']",
      "div[id*='taboola']",
      "div[class*='outbrain']",
      "div[id*='outbrain']",
      "div[class*='criteo']",
      "div[id*='criteo']",
      "div[class*='ad-slot']",
      "div[class*='ad_slot']",
      "div[class*='ad-container']",
      "div[class*='ad_container']",
      "div[class*='ad-wrapper']",
      "div[class*='ad-banner']",
      "div[class*='advertisement']",
      "div[id*='ad_banner']",
      "div[id*='ad-banner']",
      "div[id*='header-ad']",
      "div[id*='footer-ad']",
      "div[id*='sidebar-ad']"
    ];

    try {
      const genericElements = document.querySelectorAll(genericAdSelectors.join(", "));
      let genericCount = 0;
      genericElements.forEach(el => {
        if (el.getAttribute("data-guardra-blocked") === "true") return;
        el.setAttribute("data-guardra-blocked", "true");
        el.style.cssText = "display: none !important; visibility: hidden !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; pointer-events: none !important;";
        genericCount++;
      });
      if (genericCount > 0) {
        reportBlockedAd(genericCount);
      }
    } catch (e) {}
  }

  function reportBlockedAd(count = 1) {
    if (!count || count <= 0) return;
    const domain = location.hostname.replace(/^www\./i, "");
    chrome.runtime.sendMessage({
      type: "REPORT_COSMETIC_BLOCKED",
      count: count,
      domain: domain
    }, () => {
      if (chrome.runtime.lastError) {}
    });
  }

  function applyCosmeticAdFilter() {
    let style = document.getElementById("guardra-cosmetic-adblock");
    if (!style) {
      style = document.createElement("style");
      style.id = "guardra-cosmetic-adblock";
      const rule = COSMETIC_AD_SELECTORS.join(", ") + " { display: none !important; visibility: hidden !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; opacity: 0 !important; pointer-events: none !important; }";
      style.textContent = rule;
      (document.head || document.documentElement).appendChild(style);
    }

    // Start continuous SPA sweeper
    if (!spaAdSweeperInterval) {
      runSpaAdSweep();
      spaAdSweeperInterval = setInterval(runSpaAdSweep, 250);
      window.addEventListener("scroll", runSpaAdSweep, { passive: true });

      const target = document.body || document.documentElement;
      if (target) {
        spaAdObserver = new MutationObserver(runSpaAdSweep);
        spaAdObserver.observe(target, { childList: true, subtree: true });
      }
    }
  }

  function removeCosmeticAdFilter() {
    const style = document.getElementById("guardra-cosmetic-adblock");
    if (style) style.remove();

    if (spaAdSweeperInterval) {
      clearInterval(spaAdSweeperInterval);
      spaAdSweeperInterval = null;
    }
    if (spaAdObserver) {
      spaAdObserver.disconnect();
      spaAdObserver = null;
    }
    window.removeEventListener("scroll", runSpaAdSweep);

    // Unhide previously blocked elements
    document.querySelectorAll("[data-guardra-blocked='true']").forEach(el => {
      el.removeAttribute("data-guardra-blocked");
      el.style.display = "";
      el.style.visibility = "";
      el.style.height = "";
      el.style.maxHeight = "";
      el.style.overflow = "";
      el.style.pointerEvents = "";
    });
  }

  // --- YouTube Video Ad Interceptor & Neutralizer ---
  let ytAdInterval = null;
  let isAdCurrentlyHandled = false;

  function injectYouTubeMainWorldAdBlocker() {
    if (!location.hostname.includes("youtube.com")) return;
    const code = `
      (function() {
        if (window.__guardra_yt_injected) return;
        window.__guardra_yt_injected = true;

        function sanitize(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.adPlacements) delete obj.adPlacements;
          if (obj.playerAds) delete obj.playerAds;
          if (obj.adSlots) delete obj.adSlots;
          if (obj.adBreakHeartbeatParams) delete obj.adBreakHeartbeatParams;
          if (obj.playerConfig && obj.playerConfig.adPlacements) delete obj.playerConfig.adPlacements;
        }

        try {
          if (window.ytInitialPlayerResponse) sanitize(window.ytInitialPlayerResponse);

          let originalResponse = window.ytInitialPlayerResponse;
          Object.defineProperty(window, 'ytInitialPlayerResponse', {
            get() { return originalResponse; },
            set(val) {
              sanitize(val);
              originalResponse = val;
            },
            configurable: true
          });

          const origFetch = window.fetch;
          window.fetch = async function() {
            const response = await origFetch.apply(this, arguments);
            const url = arguments[0] ? (typeof arguments[0] === 'string' ? arguments[0] : arguments[0].url) : '';
            if (url && (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next'))) {
              try {
                const clone = response.clone();
                const data = await clone.json();
                sanitize(data);
                return new Response(JSON.stringify(data), {
                  status: response.status,
                  statusText: response.statusText,
                  headers: response.headers
                });
              } catch (e) {}
            }
            return response;
          };
        } catch (e) {}
      })();
    `;
    const script = document.createElement("script");
    script.textContent = code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  function initYouTubeAdSkipper() {
    if (!location.hostname.includes("youtube.com")) return;
    injectYouTubeMainWorldAdBlocker();

    if (ytAdInterval) return;

    function handleYouTubeAds() {
      const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
      const video = document.querySelector("video.html5-main-video") || document.querySelector("video");
      if (!player || !video) return;

      const hasAdClass = player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting");
      const hasSkipBtn = document.querySelector(".ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot") !== null;
      const hasAdBadge = document.querySelector(".ytp-ad-simple-ad-badge, .ytp-ad-duration-remaining, .ytp-ad-preview-text") !== null;

      const isRealAdPlaying = hasAdClass || (hasSkipBtn && hasAdBadge);

      if (isRealAdPlaying) {
        try {
          if (!video.muted) video.muted = true;
          if (video.duration && isFinite(video.duration) && video.currentTime < video.duration - 0.2) {
            video.currentTime = video.duration - 0.1;
          }
          video.playbackRate = 16.0;
        } catch (e) {}

        const skipButtons = [
          ".ytp-ad-skip-button",
          ".ytp-ad-skip-button-modern",
          ".ytp-skip-ad-button",
          "button.ytp-ad-skip-button-modern",
          ".ytp-ad-skip-button-slot button",
          ".ytp-ad-skip-button-slot",
          ".ytp-ad-overlay-close-button",
          ".ytp-ad-survey-answer",
          "ytd-button-renderer#dismiss-button",
          "button[aria-label*='Skip']",
          "button[class*='skip']"
        ];

        for (const selector of skipButtons) {
          const btn = document.querySelector(selector);
          if (btn && typeof btn.click === "function") {
            try { btn.click(); } catch (e) {}
          }
        }

        if (!isAdCurrentlyHandled) {
          isAdCurrentlyHandled = true;
          chrome.runtime.sendMessage({ type: "REPORT_COSMETIC_BLOCKED", count: 1 }).catch(() => {});
        }
      } else {
        if (isAdCurrentlyHandled) {
          isAdCurrentlyHandled = false;
          try {
            video.muted = false;
            video.playbackRate = 1.0;
          } catch (e) {}
        } else if (video.playbackRate > 2.0) {
          video.playbackRate = 1.0;
        }
      }
    }

    ytAdInterval = setInterval(handleYouTubeAds, 250);
  }

  function stopYouTubeAdSkipper() {
    if (ytAdInterval) {
      clearInterval(ytAdInterval);
      ytAdInterval = null;
    }
    isAdCurrentlyHandled = false;
    const video = document.querySelector("video");
    if (video) {
      if (video.playbackRate > 2.0) video.playbackRate = 1.0;
    }
  }

  function checkAndApplyCosmeticFilter() {
    chrome.runtime.sendMessage({
      type: "GET_ADBLOCK_STATUS"
    }, (resp) => {
      if (chrome.runtime.lastError || !resp) return;
      if (resp.globalEnabled !== false) {
        applyCosmeticAdFilter();
        initYouTubeAdSkipper();
      } else {
        removeCosmeticAdFilter();
        stopYouTubeAdSkipper();
      }
    });
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Secondary sweep for lazy scripts
  setTimeout(() => {
    checkAndApplyCosmeticFilter();
    scanTrackers();
    automateCookieRejection();
    sendTelemetry();
    if (currentRating) {
      renderFloatingPill(currentRating);
    }
  }, 2500);
})();
