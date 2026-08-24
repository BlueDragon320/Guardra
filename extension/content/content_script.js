(function () {
  // Prevent multiple injections
  if (window.__guardra_injected) return;
  window.__guardra_injected = true;

  const TRACKER_SIGNATURES = [
    { name: "Google Analytics / Tag Manager", regex: /(google-analytics\.com|googletagmanager\.com|gtag\/js)/i },
    { name: "Meta / Facebook Pixel", regex: /(connect\.facebook\.net\/en_US\/fbevents\.js|fbevents)/i },
    { name: "TikTok Pixel", regex: /(analytics\.tiktok\.com|ttq)/i },
    { name: "Hotjar Session Recording", regex: /(static\.hotjar\.com|hotjar)/i },
    { name: "Criteo Ad Retargeting", regex: /(criteo\.net|criteo\.com)/i },
    { name: "Mixpanel Analytics", regex: /(mixpanel\.com|cdn\.mxpnl\.com)/i },
    { name: "Amplitude Telemetry", regex: /(amplitude\.com|cdn\.amplitude\.com)/i },
    { name: "Amazon Ad System", regex: /(amazon-adsystem\.com|media-amazon\.com\/images\/G\/01\/ad-sdk)/i },
    { name: "Taboola / Outbrain Ad Feeds", regex: /(taboola\.com|outbrain\.com)/i }
  ];

  let autoActionsExecuted = [];
  let detectedTrackers = [];
  let currentRating = null;
  let isAutoDisableActive = false;

  chrome.storage.local.get(["guardra_auto_disable_cookies"], (res) => {
    if (res.guardra_auto_disable_cookies) {
      isAutoDisableActive = true;
      const code = `
        window['ga-disable-ALL'] = true;
        window.ga = function(){};
        window.gtag = function(){};
        window.fbq = function(){};
        const originalSendBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function(url, data) {
          if (typeof url === 'string' && (url.includes('google-analytics.com') || url.includes('googletagmanager.com') || url.includes('facebook.com/tr/'))) {
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

      setInterval(() => {
        try {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            if (/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name)) {
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
              const domain = location.hostname.replace(/^www\./i, "");
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.' + domain;
            }
          }
          const trackerKeyRegex = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/;
          Object.keys(localStorage).forEach(k => {
            if (trackerKeyRegex.test(k)) localStorage.removeItem(k);
          });
        } catch (e) {}
      }, 1000);
    }
  });

  // 1. Scan trackers
  function scanTrackers() {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    const detected = [];
    
    scripts.forEach((script) => {
      const src = script.src;
      TRACKER_SIGNATURES.forEach((sig) => {
        if (sig.regex.test(src) && !detected.some(d => d.name === sig.name)) {
          let isBlocked = false;
          if (isAutoDisableActive && (sig.name.includes("Google Analytics") || sig.name.includes("Meta") || sig.name.includes("Tag Manager") || sig.name.includes("Facebook Pixel"))) {
            isBlocked = true;
          }
          detected.push({ name: sig.name, src: src.substring(0, 100), isBlocked: isBlocked });
        }
      });
    });

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
        _doRenderFloatingPill(rating, autoDisable, theme, adblockStatus);
      });
    });
  }

  function _doRenderFloatingPill(rating, autoDisableCookies = false, theme = "dark", adblockStatus = { globalEnabled: true, sitePaused: false, totalBlockedCount: 0 }) {
    if (isDismissed) return;
    currentRating = rating;
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

    const activeCookies = [];
    try {
      if (document.cookie) {
        document.cookie.split(";").forEach(c => {
          const name = c.split("=")[0].trim();
          if (name) activeCookies.push(name);
        });
      }
      Object.keys(localStorage).forEach(k => {
        if (!activeCookies.includes(k)) activeCookies.push(k);
      });
    } catch (e) {}

    const blockedCount = adblockStatus.totalBlockedCount || 0;
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
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 6px;
        max-height: 120px;
        overflow-y: auto;
        padding-right: 4px;
        scrollbar-width: thin;
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
    } else if (isPaused) {
      adblockChipHtml = `<span class="pill-chip adblock-paused">⏸️ Ads Paused</span>`;
    } else {
      adblockChipHtml = `<span class="pill-chip adblock-active">🛡️ ${blockedCount} Ads Blocked</span>`;
    }

    if (!isExpanded) {
      shadowRoot.innerHTML = `
        <style>${css}</style>
        <div class="pill-container" id="guardra-pill">
          <span class="logo-shield">G.</span>
          <span style="font-weight:700;">${domain}</span>
          <span class="grade-pill">${grade} (${score}/100)</span>
          ${adblockChipHtml}
          <span class="pill-chip">⚡ ${detectedTrackers.length} Trackers</span>
          <span class="pill-chip">🍪 ${activeCookies.length} Cookies</span>
          <button class="close-btn" id="guardra-close-pill" title="Dismiss">✕</button>
        </div>
      `;

      shadowRoot.getElementById("guardra-pill").addEventListener("click", (e) => {
        if (e.target.id === "guardra-close-pill") return;
        isExpanded = true;
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
        <div class="section-card" style="border-left: 3px solid ${isPaused ? '#f59e0b' : '#10b981'};">
          <div class="meta-row" style="align-items:center;">
            <span style="font-weight:700; color:${isLight ? '#0f172a' : '#ffffff'};">🛡️ Ad & Tracker Shield</span>
            <span style="color:${isPaused ? '#f59e0b' : '#10b981'}; font-weight:700; font-family:monospace;">
              ${isGlobalOff ? 'DISABLED' : (isPaused ? 'PAUSED' : `${blockedCount} BLOCKED`)}
            </span>
          </div>
          <div style="font-size:10px; color:${isLight ? '#64748b' : '#888888'};">
            ${isPaused ? `Ad blocking paused on ${domain}. Ads will load normally.` : `DNR network engine & cosmetic filters actively blocking ads on ${domain}.`}
          </div>
          <button class="${isPaused ? 'action-btn' : 'secondary-btn'}" id="guardra-panel-toggle-adblock" style="${isPaused ? 'background:#f59e0b; color:#000; margin-top:4px;' : 'margin-top:4px;'}">
            ${isPaused ? `▶️ Resume Ad Blocking on ${domain}` : `⏸️ Pause on ${domain}`}
          </button>
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
              <span>⚡ Trackers (${detectedTrackers.length})</span>
              <span class="toggle-icon" id="guardra-trackers-icon">▼</span>
            </div>
            <div class="expandable-content" id="guardra-trackers-content">
              ${detectedTrackers.length > 0 
                ? detectedTrackers.map(t => `<span class="tracker-chip">${t.name}</span>`).join("") 
                : `<span style="color: #71717a; font-size: 10px; font-style: italic;">None detected on page</span>`}
            </div>
          </div>

          <div class="section-card" style="padding: 10px;">
            <div class="expandable-header" id="guardra-cookies-header">
              <span>🍪 Cookies (${activeCookies.length})</span>
              <span class="toggle-icon" id="guardra-cookies-icon">▼</span>
            </div>
            <div class="expandable-content" id="guardra-cookies-content">
              ${activeCookies.length > 0 
                ? activeCookies.map(c => `<span class="cookie-chip">${c}</span>`).join("") 
                : `<span style="color: #71717a; font-size: 10px; font-style: italic;">No cookies stored</span>`}
            </div>
          </div>
        </div>
      `;

      // Panel Adblock Toggle Handler
      const panelAdblockToggle = shadowRoot.getElementById("guardra-panel-toggle-adblock");
      if (panelAdblockToggle) {
        panelAdblockToggle.addEventListener("click", () => {
          const cleanDom = domain.toLowerCase();
          chrome.runtime.sendMessage({
            type: "TOGGLE_SITE_ADBLOCK",
            domain: cleanDom,
            paused: !isPaused
          }, () => {
            location.reload();
          });
        });
      }

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

      const minBtn = shadowRoot.getElementById("guardra-minimize-panel");
      if (minBtn) {
        minBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          isExpanded = false;
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

    if (msg.type === "ADBLOCK_SITE_PAUSE_CHANGED") {
      if (msg.paused) {
        removeCosmeticAdFilter();
      } else {
        checkAndApplyCosmeticFilter();
      }
      if (currentRating) renderFloatingPill(currentRating);
      sendResponse({ success: true });
      return true;
    }
  });

  // --- Cosmetic Ad Blocker Engine ---
  const COSMETIC_AD_SELECTORS = [
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
    "div[data-ad-unit]",
    "div[data-ad-slot]",
    "div[data-ad-client]",
    // YouTube Specific Ad Containers & Promoted Slots
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
    ".ytp-ad-image-overlay"
  ];

  function applyCosmeticAdFilter() {
    let style = document.getElementById("guardra-cosmetic-adblock");
    if (!style) {
      style = document.createElement("style");
      style.id = "guardra-cosmetic-adblock";
      const rule = COSMETIC_AD_SELECTORS.join(", ") + " { display: none !important; visibility: hidden !important; height: 0 !important; min-height: 0 !important; max-height: 0 !important; opacity: 0 !important; pointer-events: none !important; }";
      style.textContent = rule;
      (document.head || document.documentElement).appendChild(style);
    }

    // Count hidden cosmetic elements and report
    try {
      const elements = document.querySelectorAll(COSMETIC_AD_SELECTORS.join(", "));
      if (elements.length > 0) {
        const domain = location.hostname.replace(/^www\./i, "");
        chrome.runtime.sendMessage({
          type: "REPORT_COSMETIC_BLOCKED",
          count: elements.length,
          domain: domain
        }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    } catch (e) {}
  }

  function removeCosmeticAdFilter() {
    const style = document.getElementById("guardra-cosmetic-adblock");
    if (style) style.remove();
  }

  // --- YouTube Video Ad Skipper & Neutralizer ---
  let ytAdInterval = null;
  let ytObserver = null;

  function initYouTubeAdSkipper() {
    if (!location.hostname.includes("youtube.com")) return;
    if (ytAdInterval) return;

    function handleYouTubeAds() {
      const player = document.getElementById("movie_player") || document.querySelector(".html5-video-player");
      const video = document.querySelector("video");
      if (!player || !video) return;

      // YouTube strictly adds "ad-showing" or "ad-interrupting" to the player element ONLY when an ad is playing
      const isRealAdPlaying = player.classList.contains("ad-showing") || player.classList.contains("ad-interrupting");

      if (isRealAdPlaying) {
        // 1. Instantly click skip buttons
        const skipButtons = [
          ".ytp-ad-skip-button",
          ".ytp-ad-skip-button-modern",
          ".ytp-skip-ad-button",
          "button.ytp-ad-skip-button-modern",
          ".ytp-ad-skip-button-slot button",
          ".ytp-ad-overlay-close-button",
          ".ytp-ad-survey-answer",
          "ytd-button-renderer#dismiss-button"
        ];

        for (const selector of skipButtons) {
          const btn = document.querySelector(selector);
          if (btn && typeof btn.click === "function") {
            try { btn.click(); } catch (e) {}
          }
        }

        // 2. Fast-forward the ad video stream ONLY when isRealAdPlaying is TRUE and duration is ad-length (< 300s)
        try {
          if (video.duration && isFinite(video.duration) && video.duration < 300) {
            video.currentTime = video.duration - 0.1;
          }
          video.playbackRate = 16.0;
        } catch (e) {}
      } else {
        // Normal video playback: ensure speed is not stuck on 16x
        if (video.playbackRate > 2.0) {
          video.playbackRate = 1.0;
        }
      }
    }

    ytAdInterval = setInterval(handleYouTubeAds, 100);

    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      ytObserver = new MutationObserver(() => {
        handleYouTubeAds();
      });
      ytObserver.observe(targetNode, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }
  }

  function stopYouTubeAdSkipper() {
    if (ytAdInterval) {
      clearInterval(ytAdInterval);
      ytAdInterval = null;
    }
    if (ytObserver) {
      ytObserver.disconnect();
      ytObserver = null;
    }
    const video = document.querySelector("video");
    if (video && video.playbackRate > 2.0) {
      video.playbackRate = 1.0;
    }
  }

  function checkAndApplyCosmeticFilter() {
    const domain = location.hostname.replace(/^www\./i, "");
    chrome.runtime.sendMessage({
      type: "GET_ADBLOCK_STATUS",
      domain: domain
    }, (resp) => {
      if (chrome.runtime.lastError || !resp) return;
      if (resp.globalEnabled !== false && !resp.sitePaused) {
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
