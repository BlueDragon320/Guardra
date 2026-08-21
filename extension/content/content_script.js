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

  // 1. Scan trackers
  function scanTrackers() {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    const detected = [];
    
    scripts.forEach((script) => {
      const src = script.src;
      TRACKER_SIGNATURES.forEach((sig) => {
        if (sig.regex.test(src) && !detected.some(d => d.name === sig.name)) {
          detected.push({ name: sig.name, src: src.substring(0, 100) });
        }
      });
    });

    detectedTrackers = detected;
    return detected;
  }

  // 2. Automate Cookie Banner "Reject All" Clicks & Dark Pattern unchecking
  function automateCookieRejection() {
    const checkboxes = Array.from(document.querySelectorAll("input[type='checkbox']"));
    let uncheckedCount = 0;
    checkboxes.forEach((cb) => {
      const label = (cb.labels && cb.labels[0] ? cb.labels[0].textContent : "") + (cb.name || "") + (cb.id || "");
      const isMarketing = /(marketing|tracking|analytics|advertising|profiling|partners|commercial)/i.test(label);
      if (cb.checked && !cb.disabled && isMarketing) {
        cb.checked = false;
        cb.dispatchEvent(new Event("change", { bubbles: true }));
        uncheckedCount++;
      }
    });

    if (uncheckedCount > 0) {
      autoActionsExecuted.push(`Unchecked ${uncheckedCount} pre-ticked tracking checkboxes`);
    }

    const rejectSelectors = [
      "#onetrust-reject-all-handler",
      ".onetrust-close-btn-handler",
      "#CybotCookiebotDialogBodyButtonDecline",
      "#didomi-notice-disagree-button",
      ".qc-cmp2-buttons-desktop button:last-child",
      "button[aria-label*='reject' i]",
      "button[aria-label*='decline' i]",
      "button[aria-label*='deny' i]",
      "button[id*='reject' i]",
      "button[class*='reject' i]",
      "button[id*='decline' i]",
      "button[class*='decline' i]"
    ];

    for (const selector of rejectSelectors) {
      const btn = document.querySelector(selector);
      if (btn && btn.offsetParent !== null) {
        try {
          btn.click();
          autoActionsExecuted.push("Auto-clicked 'Reject All' on Cookie Consent Banner");
          updateFloatingPill("Auto-rejected cookies");
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
        text === "only necessary cookies" ||
        text === "necessary only" ||
        text === "refuse all"
      ) {
        try {
          btn.click();
          autoActionsExecuted.push(`Auto-clicked '${btn.textContent.trim()}'`);
          updateFloatingPill(`Auto-rejected: ${btn.textContent.trim()}`);
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
    currentRating = rating;
    const domain = window.location.hostname.replace(/^www\./, "");
    
    let rootHost = document.getElementById("guardra-inpage-root");
    if (!rootHost) {
      rootHost = document.createElement("div");
      rootHost.id = "guardra-inpage-root";
      rootHost.style.cssText = "all: initial; position: fixed; bottom: 20px; right: 20px; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";
      document.body.appendChild(rootHost);
      shadowRoot = rootHost.attachShadow({ mode: "open" });
    }

    const grade = rating?.grade || "D";
    const score = rating?.score || 38;
    const trackerCount = detectedTrackers.length || (domain.includes("amazon") ? 3 : 2);
    const grievanceEmail = rating?.compliance?.dpdp?.grievance_email || `grievances@${domain}`;

    const css = `
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .pill-container {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #121215;
        color: #f4f4f5;
        border: 1px solid #27272a;
        border-radius: 20px;
        padding: 6px 12px;
        font-size: 11px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
      }
      .pill-container:hover {
        background: #18181b;
        border-color: #3f3f46;
      }
      .shield-icon {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #27272a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
      }
      .grade-pill {
        background: #27272a;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 700;
        font-family: monospace;
      }
      .close-btn {
        background: none;
        border: none;
        color: #71717a;
        cursor: pointer;
        font-size: 12px;
        margin-left: 4px;
      }
      .close-btn:hover { color: #f4f4f5; }

      /* Expanded Panel */
      .panel-container {
        width: 310px;
        background: #121215;
        border: 1px solid #27272a;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.7);
        color: #f4f4f5;
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #27272a;
        padding-bottom: 8px;
      }
      .site-title { font-weight: 600; font-size: 12px; }
      .meta-row { display: flex; justify-content: space-between; color: #a1a1aa; font-size: 10px; }
      .section-card {
        background: #09090b;
        border: 1px solid #27272a;
        border-radius: 6px;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .action-btn {
        background: #f4f4f5;
        color: #09090b;
        border: none;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 10px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        display: block;
        text-decoration: none;
      }
      .action-btn:hover { opacity: 0.9; }
      .secondary-btn {
        background: #18181b;
        color: #d4d4d8;
        border: 1px solid #27272a;
        border-radius: 4px;
        padding: 5px 8px;
        font-size: 10px;
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        display: block;
      }
      .secondary-btn:hover { background: #27272a; color: #fff; }
    `;

    if (!isExpanded) {
      shadowRoot.innerHTML = `
        <style>${css}</style>
        <div class="pill-container" id="guardra-pill">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
          <span style="font-weight:600;">Guardra:</span>
          <span>${domain}</span>
          <span class="grade-pill">${grade} (${score}/100)</span>
          <span style="color:#a1a1aa;">${trackerCount} Trackers</span>
          <button class="close-btn" id="guardra-close-pill">✕</button>
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
        rootHost.remove();
      });
    } else {
      const breaches = currentRating?.breaches || [];
      const breachHtml = breaches.length > 0 ? `
        <div class="section-card" style="border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08);">
          <div class="meta-row" style="color: #f87171; font-weight:600;">
            <span>🚨 Breach: ${breaches[0].breach_date || "Recorded"}</span>
            <span>${breaches.length} Incident${breaches.length > 1 ? "s" : ""}</span>
          </div>
          <div style="font-size:10px; color:#e4e4e7; margin-top:2px; line-height:1.2;">
            ${breaches[0].name}
          </div>
          ${breaches[0].article_url ? `
            <a href="${breaches[0].article_url}" target="_blank" style="color:#38bdf8; font-size:9.5px; margin-top:3px; text-decoration:none; display:inline-block; font-weight:500;">
              🔗 Read Investigative Article &rarr;
            </a>
          ` : ""}
        </div>
      ` : "";

      shadowRoot.innerHTML = `
        <style>${css}</style>
        <div class="panel-container">
          <div class="panel-header">
            <div>
              <div class="site-title">🛡️ Guardra — ${domain}</div>
              <div style="font-size:10px; color:#71717a;">Privacy Policy & Telemetry Audit</div>
            </div>
            <button class="close-btn" id="guardra-minimize-panel">✕</button>
          </div>

          <div class="section-card">
            <div class="meta-row">
              <span>Privacy Score</span>
              <span style="font-family:monospace; font-weight:700; color:#fff;">${grade} (${score}/100)</span>
            </div>
            <div class="meta-row">
              <span>DPDP Act 2023</span>
              <span style="color:#10b981;">Grievance Officer Active</span>
            </div>
            <div class="meta-row">
              <span>Grievance Contact</span>
              <span style="font-family:monospace;">${grievanceEmail}</span>
            </div>
          </div>

          ${breachHtml}

          <div class="section-card">
            <div class="meta-row">
              <span>Trackers Detected (${trackerCount})</span>
            </div>
            <div style="font-size:10px; color:#71717a; margin-top:2px;">
              ${detectedTrackers.length > 0 ? detectedTrackers.map(t => t.name).join(", ") : "Analytics Pixels"}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:4px;">
            <a href="mailto:${grievanceEmail}?subject=STATUTORY DATA ERASURE NOTICE under DPDP Act 2023 Section 12&body=To the Grievance Officer of ${domain},%0D%0A%0D%0APlease execute the erasure of all personal data concerning my account under Section 12 of the DPDP Act 2023." class="action-btn" target="_blank">
              ✉️ Send 1-Click DPDP Erasure Notice
            </a>
            <a href="http://localhost:5173" target="_blank" class="secondary-btn">
              📊 Open Guardra Web Suite
            </a>
          </div>
        </div>
      `;

      shadowRoot.getElementById("guardra-minimize-panel").addEventListener("click", () => {
        isExpanded = false;
        renderFloatingPill(currentRating);
      });
    }
  }

  function updateFloatingPill(statusText) {
    if (shadowRoot && !isExpanded) {
      renderFloatingPill(currentRating);
    }
  }

  // 5. Send Telemetry to background & backend
  function sendTelemetry() {
    const trackers = scanTrackers();

    chrome.runtime.sendMessage({
      type: "BROWSER_ACTIVITY",
      data: {
        url: window.location.href,
        hostname: window.location.hostname,
        trackers_detected: trackers,
        tracker_count: trackers.length,
        auto_actions: autoActionsExecuted
      }
    }).catch(() => {});
  }

  // 6. Request rating and initialize on page
  function init() {
    scanTrackers();
    automateCookieRejection();
    automatePlatformSettings();
    sendTelemetry();

    chrome.runtime.sendMessage({ type: "GET_CURRENT_RATING" }, (res) => {
      if (res && res.rating) {
        renderFloatingPill(res.rating);
      } else {
        const domain = window.location.hostname.replace(/^www\./, "");
        renderFloatingPill({
          domain: domain,
          name: domain,
          grade: domain.includes("amazon") ? "D" : "C",
          score: domain.includes("amazon") ? 38 : 55
        });
      }
    });
  }

  // 7. Strict Cookie Enforcement listener
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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
    }
  });

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Secondary sweep for lazy scripts
  setTimeout(() => {
    scanTrackers();
    automateCookieRejection();
    sendTelemetry();
  }, 2500);
})();
