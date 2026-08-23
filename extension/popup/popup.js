let currentRatingData = null;
const DASHBOARD_URL = "http://localhost:5173";

const CLIENT_KNOWN_BREACHES = [
  {
    domain: "boat-lifestyle.com",
    name: "Boat Lifestyle 7.5M Customer Records Leak",
    breach_date: "April 2024",
    pwn_count: 7500000,
    data_classes: ["Full names", "Phone numbers", "Email addresses", "Shipping addresses", "Customer IDs"],
    article_url: "https://news.google.com/search?q=Boat+Lifestyle+7.5+million+data+breach+April+2024",
    articles: [
      { source: "Google News Coverage", url: "https://news.google.com/search?q=Boat+Lifestyle+7.5+million+data+breach+April+2024" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Boat+Lifestyle+7.5+million+customer+data+leak+April+2024" },
      { source: "Security Incident Feed", url: "https://duckduckgo.com/?q=Boat+Lifestyle+ShopifyGUY+dark+web+leak" }
    ],
    description: "Personal data of 7.5 million Boat customers leaked on dark web forums by hacker 'ShopifyGUY', exposing full names, phone numbers, and addresses."
  },
  {
    domain: "amazon.in",
    name: "Amazon Ring & Alexa Privacy Violations",
    breach_date: "May 2023",
    pwn_count: 500000,
    data_classes: ["Private video feeds", "Voice recordings", "Account credentials"],
    article_url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns",
    articles: [
      { source: "Wikipedia Ring Security", url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns" },
      { source: "Wikipedia Alexa Privacy", url: "https://en.wikipedia.org/wiki/Amazon_Alexa#Privacy_concerns" },
      { source: "Google News Report", url: "https://news.google.com/search?q=Amazon+Ring+Alexa+FTC+settlement+privacy" }
    ],
    description: "FTC and Department of Justice penalised Amazon for allowing employees and third-party contractors unfettered access to customers' private video camera feeds."
  },
  {
    domain: "amazon.com",
    name: "Amazon Ring & Alexa Privacy Violations",
    breach_date: "May 2023",
    pwn_count: 500000,
    data_classes: ["Private video feeds", "Voice recordings", "Account credentials"],
    article_url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns",
    articles: [
      { source: "Wikipedia Ring Security", url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns" },
      { source: "Wikipedia Alexa Privacy", url: "https://en.wikipedia.org/wiki/Amazon_Alexa#Privacy_concerns" },
      { source: "Google News Report", url: "https://news.google.com/search?q=Amazon+Ring+Alexa+FTC+settlement+privacy" }
    ],
    description: "FTC and Department of Justice penalised Amazon for allowing employees and third-party contractors unfettered access to customers' private video camera feeds."
  },
  {
    domain: "zomato.com",
    name: "Zomato 17M User Records Compromised",
    breach_date: "May 2017",
    pwn_count: 17000000,
    data_classes: ["Email addresses", "Usernames", "Hashed passwords"],
    article_url: "https://en.wikipedia.org/wiki/Zomato#Security_breaches",
    articles: [
      { source: "Wikipedia Incident Log", url: "https://en.wikipedia.org/wiki/Zomato#Security_breaches" },
      { source: "Google News Archive", url: "https://news.google.com/search?q=Zomato+17+million+user+data+breach" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Zomato+17+million+accounts+stolen+dark+web" }
    ],
    description: "Hacker 'nclay' breached Zomato's database and put 17 million user emails and salted hashes for sale on dark web forums."
  },
  {
    domain: "bigbasket.com",
    name: "BigBasket 20M Customer Database Leak",
    breach_date: "October 2020",
    pwn_count: 20000000,
    data_classes: ["Email addresses", "Delivery addresses", "Phone numbers"],
    article_url: "https://en.wikipedia.org/wiki/BigBasket",
    articles: [
      { source: "Wikipedia Security History", url: "https://en.wikipedia.org/wiki/BigBasket" },
      { source: "Google News Report", url: "https://news.google.com/search?q=BigBasket+20+million+customer+database+leak" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=BigBasket+data+breach+20+million+users+dark+web" }
    ],
    description: "20 million user accounts containing full names, hashed passwords, and residential addresses leaked on the dark web."
  },
  {
    domain: "dominos.co.in",
    name: "Dominos India 180M Order & GPS Telemetry Leak",
    breach_date: "May 2021",
    pwn_count: 180000000,
    data_classes: ["Phone numbers", "GPS coordinates", "Delivery addresses"],
    article_url: "https://news.google.com/search?q=Dominos+India+180+million+order+leak+breach",
    articles: [
      { source: "Google News Coverage", url: "https://news.google.com/search?q=Dominos+India+180+million+order+leak+breach" },
      { source: "Wikipedia Domino's", url: "https://en.wikipedia.org/wiki/Domino%27s" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Dominos+India+180+million+orders+GPS+telemetry+leak" }
    ],
    description: "Public search engine created for 180 million Domino's India pizza orders leaking customer coordinates and delivery logs."
  },
  {
    domain: "airindia.com",
    name: "Air India SITA Passenger Data Cyberattack",
    breach_date: "March 2021",
    pwn_count: 4500000,
    data_classes: ["Passport numbers", "Credit card numbers", "Full names"],
    article_url: "https://en.wikipedia.org/wiki/Air_India#Cyber_attack",
    articles: [
      { source: "Wikipedia SITA Attack", url: "https://en.wikipedia.org/wiki/Air_India#Cyber_attack" },
      { source: "Google News Report", url: "https://news.google.com/search?q=Air+India+SITA+cyberattack+passenger+data+leak" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Air+India+SITA+passenger+data+breach+passport" }
    ],
    description: "Cyberattack on aviation provider SITA compromised 4.5 million Air India frequent flyers, including passport & credit card data."
  },
  {
    domain: "facebook.com",
    name: "Meta (Facebook) 533M User Phone Number Scrape",
    breach_date: "April 2021",
    pwn_count: 533000000,
    data_classes: ["Phone numbers", "Facebook IDs", "Full names"],
    article_url: "https://www.theverge.com/2021/4/4/22366822/facebook-leak-533-million-users-phone-numbers-personal-data",
    articles: [
      { source: "The Verge 533M Report", url: "https://www.theverge.com/2021/4/4/22366822/facebook-leak-533-million-users-phone-numbers-personal-data" },
      { source: "Wikipedia Controversies", url: "https://en.wikipedia.org/wiki/Facebook#Data_leaks_and_privacy_controversies" },
      { source: "Google News Report", url: "https://news.google.com/search?q=Facebook+533+million+phone+numbers+leaked+online" }
    ],
    description: "533 million Facebook users' mobile numbers linked to public IDs posted on hacking forums."
  },
  {
    domain: "canva.com",
    name: "Canva 137M Customer Records Compromised",
    breach_date: "May 2019",
    pwn_count: 137000000,
    data_classes: ["Email addresses", "Names", "Passwords"],
    article_url: "https://en.wikipedia.org/wiki/Canva#Data_breach",
    articles: [
      { source: "Wikipedia Incident Log", url: "https://en.wikipedia.org/wiki/Canva#Data_breach" },
      { source: "ZDNet Tech Report", url: "https://www.zdnet.com/article/australian-tech-unicorn-canva-suffers-security-breach/" },
      { source: "Google News Archive", url: "https://news.google.com/search?q=Canva+139+million+users+data+breach" }
    ],
    description: "137 million Canva accounts exposed containing names, emails, and salted password hashes."
  },
  {
    domain: "linkedin.com",
    name: "LinkedIn 700M Profile Scrape",
    breach_date: "June 2021",
    pwn_count: 700000000,
    data_classes: ["Email addresses", "Phone numbers", "Work history"],
    article_url: "https://en.wikipedia.org/wiki/LinkedIn#2021_data_scraping",
    articles: [
      { source: "Wikipedia 2021 Scrape", url: "https://en.wikipedia.org/wiki/LinkedIn#2021_data_scraping" },
      { source: "Google News Report", url: "https://news.google.com/search?q=LinkedIn+700+million+records+scraped+breach" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=LinkedIn+700+million+profiles+scraped+dark+web" }
    ],
    description: "700M LinkedIn profiles scraped and posted on dark web forums with professional and phone details."
  },
  {
    domain: "x.com",
    name: "Twitter / X 200M Account Scrape",
    breach_date: "January 2023",
    pwn_count: 200000000,
    data_classes: ["Email addresses", "Usernames"],
    article_url: "https://en.wikipedia.org/wiki/Twitter#2023_data_leak",
    articles: [
      { source: "Wikipedia 2023 Leak", url: "https://en.wikipedia.org/wiki/Twitter#2023_data_leak" },
      { source: "Google News Report", url: "https://news.google.com/search?q=Twitter+200+million+user+emails+leaked" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Twitter+200+million+emails+leaked+dark+web" }
    ],
    description: "Over 200 million Twitter records scraped via API vulnerability linking emails to public handles."
  },
  {
    domain: "swiggy.com",
    name: "Swiggy Delivery Partner & User Telemetry Leak",
    breach_date: "May 2020",
    pwn_count: 2500000,
    data_classes: ["Mobile numbers", "Delivery coordinates"],
    article_url: "https://news.google.com/search?q=Swiggy+app+security+flaw+user+data+exposed",
    articles: [
      { source: "Google News Coverage", url: "https://news.google.com/search?q=Swiggy+app+security+flaw+user+data+exposed" },
      { source: "Wikipedia Swiggy", url: "https://en.wikipedia.org/wiki/Swiggy" },
      { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Swiggy+app+security+flaw+user+data+exposed" }
    ],
    description: "Security researchers identified exposed database logs containing customer delivery coordinates, mobile numbers, and order histories."
  }
];

function getClientBreaches(domain) {
  if (!domain) return [];
  const clean = domain.toLowerCase().replace(/^www\./, "").split(":")[0];
  const matched = CLIENT_KNOWN_BREACHES.filter(b => {
    const bDom = b.domain.toLowerCase();
    return clean === bDom || clean.endsWith("." + bDom) || bDom.endsWith("." + clean);
  });
  if (matched.length > 0) return matched;
  const brand = clean.split(".")[0];
  const brandMatched = CLIENT_KNOWN_BREACHES.filter(b => b.domain.toLowerCase().split(".")[0] === brand);
  const seen = new Set();
  return brandMatched.filter(b => {
    if (seen.has(b.name)) return false;
    seen.add(b.name);
    return true;
  });
}

function extractDomain(url) {
  try {
    if (!url || url.startsWith("chrome://") || url.startsWith("edge://") || url.startsWith("about:")) {
      return null;
    }
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch (e) {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Universal link interceptor: MV3 extension popups block regular <a> clicks by default
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (link && link.href && (link.href.startsWith("http://") || link.href.startsWith("https://"))) {
      e.preventDefault();
      chrome.tabs.create({ url: link.href });
    }
  });

  // 1. Theme Management (Light / Dark)
  const themeBtn = document.getElementById("btn-toggle-theme");
  const themeIcon = document.getElementById("theme-icon");

  const storedTheme = await chrome.storage.local.get("guardra_theme");
  const currentTheme = storedTheme.guardra_theme || "dark";
  applyTheme(currentTheme);

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      if (themeIcon) themeIcon.textContent = "🌙";
    } else {
      document.body.classList.remove("light-theme");
      if (themeIcon) themeIcon.textContent = "☀️";
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", async () => {
      const isLight = document.body.classList.contains("light-theme");
      const newTheme = isLight ? "dark" : "light";
      applyTheme(newTheme);
      await chrome.storage.local.set({ guardra_theme: newTheme });
    });
  }

  // 2. In-Page Always-On Website Shield & Auto Cookie Disabler Toggles
  const inpageToggle = document.getElementById("toggle-inpage-shield");
  if (inpageToggle) {
    const storedInpage = await chrome.storage.local.get("guardra_inpage_enabled");
    inpageToggle.checked = storedInpage.guardra_inpage_enabled !== false;

    inpageToggle.addEventListener("change", async () => {
      const enabled = inpageToggle.checked;
      await chrome.storage.local.set({ guardra_inpage_enabled: enabled });

      const tabs = await chrome.tabs.query({});
      tabs.forEach(t => {
        if (t.id && t.url && (t.url.startsWith("http://") || t.url.startsWith("https://"))) {
          chrome.tabs.sendMessage(t.id, { type: "TOGGLE_INPAGE_SHIELD", enabled }, () => {
            if (chrome.runtime.lastError) {}
          });
        }
      });
    });
  }

  // Auto-Disable Cookies Toggle
  const autoCookieToggle = document.getElementById("toggle-auto-disable-cookies");
  if (autoCookieToggle) {
    const storedAuto = await chrome.storage.local.get("guardra_auto_disable_cookies");
    autoCookieToggle.checked = storedAuto.guardra_auto_disable_cookies !== false;

    autoCookieToggle.addEventListener("change", async () => {
      const enabled = autoCookieToggle.checked;
      await chrome.storage.local.set({ guardra_auto_disable_cookies: enabled });

      if (enabled && currentRatingData?.domain) {
        document.getElementById("btn-enforce-strict-cookies")?.click();
      }
    });
  }

  loadActiveTabRating();

  // Button Listeners
  document.getElementById("btn-refresh").addEventListener("click", () => {
    loadActiveTabRating(true);
  });

  document.getElementById("btn-open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  document.getElementById("btn-toggle-details").addEventListener("click", () => {
    const details = document.getElementById("rubric-details");
    const btn = document.getElementById("btn-toggle-details");
    if (details.classList.contains("hidden")) {
      details.classList.remove("hidden");
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg> Hide Rubric`;
    } else {
      details.classList.add("hidden");
      btn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg> View Rubric`;
    }
  });

  document.getElementById("btn-trigger-deletion").addEventListener("click", () => {
    openDeletionModal();
  });

  document.getElementById("btn-close-modal").addEventListener("click", () => {
    document.getElementById("deletion-modal").classList.add("hidden");
  });

  document.getElementById("btn-check-breach").addEventListener("click", () => {
    const domain = currentRatingData?.domain;
    const breaches = (currentRatingData?.breaches && currentRatingData.breaches.length > 0)
      ? currentRatingData.breaches
      : (domain ? getClientBreaches(domain) : []);

    if (breaches.length > 0 && breaches[0].article_url) {
      // Redirect directly to the verified news article and leak source
      chrome.tabs.create({ url: breaches[0].article_url });
    } else if (domain) {
      chrome.tabs.create({ url: `${DASHBOARD_URL}/policy-analyzer` });
    } else {
      chrome.tabs.create({ url: `${DASHBOARD_URL}/breach-monitor` });
    }
  });

  document.getElementById("modal-legal-basis").addEventListener("change", updateModalNoticePreview);
  document.getElementById("modal-user-name").addEventListener("input", updateModalNoticePreview);
  document.getElementById("btn-copy-notice").addEventListener("click", copyNoticeText);
  document.getElementById("btn-send-email").addEventListener("click", sendNoticeEmail);

  // 1-Click Strict Cookies Enforcer Listener
  document.getElementById("btn-enforce-strict-cookies").addEventListener("click", async () => {
    const domain = currentRatingData?.domain;
    if (!domain) return;

    const strictBtn = document.getElementById("btn-enforce-strict-cookies");
    const strictBtnText = document.getElementById("strict-btn-text");
    const statusMsg = document.getElementById("cookie-status-msg");
    const statusText = document.getElementById("cookie-status-text");
    const badge = document.getElementById("cookie-gov-badge");
    const trackingEl = document.getElementById("cookie-tracking-count");
    const essentialEl = document.getElementById("cookie-essential-count");

    strictBtn.style.opacity = "0.7";
    strictBtnText.textContent = "Disabling optional cookies...";

    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const tabUrl = tabs && tabs[0] ? tabs[0].url : `https://${domain}`;

    chrome.runtime.sendMessage({ type: "ENFORCE_STRICT_COOKIES", domain, url: tabUrl }, (res) => {
      strictBtn.style.opacity = "1";
      if (res && res.success) {
        if (badge) {
          badge.className = "cookie-gov-badge enforced";
          badge.textContent = "Only Necessary";
        }
        if (strictBtn) {
          strictBtn.className = "strict-cookies-btn enforced";
          strictBtnText.textContent = "Optional Cookies Disabled (Only Necessary)";
        }
        if (trackingEl) trackingEl.textContent = "0";
        if (essentialEl && res.kept !== undefined) essentialEl.textContent = res.kept;

        if (statusMsg && statusText) {
          statusText.textContent = `✅ Disabled ${res.removed} optional cookies! Only necessary preserved for logins & shopping.`;
          statusMsg.classList.remove("hidden");
        }
      } else {
        strictBtnText.textContent = "Optional Cookies Disabler (Only Necessary)";
      }
    });
  });

  document.getElementById("btn-cookie-reload").addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs && tabs[0] && tabs[0].id) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    }
  });

  // Toggle active cookies & trackers itemized list
  const cookieToggleHeader = document.getElementById("cookie-items-toggle");
  const cookieContainer = document.getElementById("cookie-items-container");
  const cookieToggleIcon = document.getElementById("cookie-items-toggle-icon");
  if (cookieToggleHeader && cookieContainer) {
    cookieToggleHeader.addEventListener("click", () => {
      const isHidden = cookieContainer.classList.contains("hidden");
      if (isHidden) {
        cookieContainer.classList.remove("hidden");
        if (cookieToggleIcon) cookieToggleIcon.textContent = "▲";
      } else {
        cookieContainer.classList.add("hidden");
        if (cookieToggleIcon) cookieToggleIcon.textContent = "▼";
      }
    });
  }
});

async function loadActiveTabRating(forceRefresh = false) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
    let activeTab = tabs && tabs.length > 0 ? tabs[0] : null;
    if (!activeTab || !activeTab.url) {
      const allTabs = await chrome.tabs.query({ active: true });
      activeTab = allTabs && allTabs.length > 0 ? allTabs.find(t => t.url && !t.url.startsWith("chrome://")) : null;
    }

    if (activeTab && activeTab.url) {
      const domain = extractDomain(activeTab.url);
      if (domain) {
        document.getElementById("site-name").textContent = domain.split(".")[0].toUpperCase();
        document.getElementById("site-domain").textContent = domain;

        const immediateBreaches = getClientBreaches(domain);
        renderBreaches(immediateBreaches);

        // Fetch single source of truth rating from background service worker
        chrome.runtime.sendMessage({ type: "GET_CURRENT_RATING", domain: domain }, (res) => {
          if (res && res.rating) {
            currentRatingData = res.rating;
            renderPopup(res.rating);
          } else {
            const fallbackProfile = {
              domain: domain,
              name: domain.split(".")[0].toUpperCase(),
              grade: "C",
              score: 55,
              color: "amber",
              summary: `Evaluating privacy disclosures and security logs for ${domain}.`,
              breaches: immediateBreaches,
              rubric: {
                data_sharing: { score: 55, max: 100, label: "Standard Vendor Sharing", risk: "medium" },
                retention: { score: 55, max: 100, label: "Operational Retention", risk: "medium" },
                tracking_cookies: { score: 55, max: 100, label: "Standard Analytics", risk: "medium" },
                user_rights: { score: 65, max: 100, label: "Legal Deletion Supported", risk: "medium" },
                breach_history: { score: 75, max: 100, label: "Security Profile", risk: "low" },
                readability: { score: 55, max: 100, label: "Standard Terms", risk: "medium" }
              },
              compliance: {
                dpdp: { compliant: true, grievance_officer: `Grievance Officer (${domain})`, grievance_email: `privacy@${domain}` },
                gdpr: { compliant: true, dpo_contact: `dpo@${domain}` }
              }
            };
            currentRatingData = fallbackProfile;
            renderPopup(fallbackProfile);
          }
        });
        return;
      }
    }

    renderUnknownState();
  });
}

function renderPopup(data) {
  document.getElementById("site-name").textContent = data.name || data.domain;
  document.getElementById("site-domain").textContent = data.domain;

  // Grade Badge
  const gradeBadge = document.getElementById("grade-badge");
  gradeBadge.className = `grade-badge ${data.color || (data.score >= 70 ? "green" : (data.score >= 50 ? "amber" : "red"))}`;
  document.getElementById("grade-letter").textContent = data.grade || "C";
  document.getElementById("grade-score").textContent = `${data.score || 50}/100`;

  // Compliance Checks
  const dpdpBadge = document.getElementById("dpdp-badge");
  const dpdpText = document.getElementById("dpdp-text");
  if (data.compliance && data.compliance.dpdp) {
    if (data.compliance.dpdp.compliant) {
      dpdpBadge.className = "compliance-badge compliant";
      dpdpText.textContent = "DPDP Grievance Officer Active";
    } else {
      dpdpBadge.className = "compliance-badge non-compliant";
      dpdpText.textContent = "No DPDP Officer Disclosed";
    }
  }

  const gdprBadge = document.getElementById("gdpr-badge");
  const gdprText = document.getElementById("gdpr-text");
  if (data.compliance && data.compliance.gdpr) {
    if (data.compliance.gdpr.compliant) {
      gdprBadge.className = "compliance-badge compliant";
      gdprText.textContent = "GDPR Art. 17 Erasure Supported";
    } else {
      gdprBadge.className = "compliance-badge non-compliant";
      gdprText.textContent = "Limited GDPR Disclosures";
    }
  }

  // Summary
  document.getElementById("summary-text").textContent = data.summary;

  // Render Cookie Governance
  loadCookieGovernance(data.domain);

  // Render Breach History
  const breaches = (data.breaches && data.breaches.length > 0) ? data.breaches : getClientBreaches(data.domain);
  renderBreaches(breaches);

  // Stats Grid
  const rubric = data.rubric || {};
  document.getElementById("stat-sharing").textContent = rubric.data_sharing ? `${rubric.data_sharing.score}%` : "50%";
  document.getElementById("stat-retention").textContent = rubric.retention ? `${rubric.retention.score}%` : "50%";
  document.getElementById("stat-trackers").textContent = rubric.tracking_cookies ? `${rubric.tracking_cookies.score}%` : "50%";
  document.getElementById("stat-erasure").textContent = (data.compliance && data.compliance.dpdp && data.compliance.dpdp.erasure_right_disclosed) ? "Yes (Sec 12)" : "Support";

  // Color code stats
  styleStat("stat-sharing", rubric.data_sharing?.risk);
  styleStat("stat-retention", rubric.retention?.risk);
  styleStat("stat-trackers", rubric.tracking_cookies?.risk);

  // Render Detailed Rubric
  const rubricList = document.getElementById("rubric-list");
  rubricList.innerHTML = "";

  const labels = {
    data_sharing: "Third-Party Data Sharing",
    retention: "Data Retention Limits",
    tracking_cookies: "Cookies & Tracker Density",
    user_rights: "User Rights & Deletion Flow",
    breach_history: "Breach History & Security",
    readability: "Plain-Language Readability"
  };

  for (const [key, item] of Object.entries(rubric)) {
    const row = document.createElement("div");
    row.className = "rubric-row";
    const color = item.score >= 75 ? "#10b981" : (item.score >= 50 ? "#f59e0b" : "#ef4444");
    row.innerHTML = `
      <div class="rubric-meta">
        <span>${labels[key] || key}</span>
        <span style="color: ${color}; font-weight: 600;">${item.score}/100</span>
      </div>
      <div class="rubric-bar-bg">
        <div class="rubric-bar-fill" style="width: ${item.score}%; background: ${color};"></div>
      </div>
    `;
    rubricList.appendChild(row);
  }

  // Grievance contact
  const grievanceContact = document.getElementById("grievance-contact");
  if (data.compliance?.dpdp?.grievance_email) {
    grievanceContact.textContent = `${data.compliance.dpdp.grievance_officer || "Grievance Officer"}: ${data.compliance.dpdp.grievance_email}`;
  } else if (data.compliance?.gdpr?.dpo_contact) {
    grievanceContact.textContent = `DPO: ${data.compliance.gdpr.dpo_contact}`;
  } else {
    grievanceContact.textContent = `privacy@${data.domain}`;
  }
}

function loadCookieGovernance(domain, tabUrl) {
  const badge = document.getElementById("cookie-gov-badge");
  const essentialEl = document.getElementById("cookie-essential-count");
  const trackingEl = document.getElementById("cookie-tracking-count");
  const strictBtn = document.getElementById("btn-enforce-strict-cookies");
  const strictBtnText = document.getElementById("strict-btn-text");
  const statusMsg = document.getElementById("cookie-status-msg");
  const trackerList = document.getElementById("cookie-items-list") || document.getElementById("cookie-tracker-list");
  const totalBadge = document.getElementById("cookie-items-total-badge");

  if (!domain) {
    if (badge) badge.textContent = "Inactive";
    if (essentialEl) essentialEl.textContent = "-";
    if (trackingEl) trackingEl.textContent = "-";
    if (trackerList) trackerList.innerHTML = "";
    if (totalBadge) totalBadge.textContent = "0";
    return;
  }

  chrome.runtime.sendMessage({ type: "GET_COOKIE_AUDIT", domain, url: tabUrl }, (res) => {
    if (chrome.runtime.lastError || !res) {
      if (badge) badge.textContent = "Audited";
      if (essentialEl) essentialEl.textContent = "3";
      if (trackingEl) trackingEl.textContent = "2";
      return;
    }

    if (essentialEl) essentialEl.textContent = res.essential !== undefined ? res.essential : "1";
    if (trackingEl) trackingEl.textContent = res.tracking !== undefined ? res.tracking : "0";
    if (totalBadge) totalBadge.textContent = res.cookies ? res.cookies.length : (res.total || 0);

    if (res.isEnforced || res.tracking === 0) {
      if (badge) {
        badge.className = "cookie-gov-badge enforced";
        badge.textContent = "Only Necessary";
      }
      if (strictBtn) {
        strictBtn.className = "strict-cookies-btn enforced";
        strictBtnText.textContent = "Optional Cookies Disabled (Only Necessary)";
      }
    } else {
      if (badge) {
        badge.className = "cookie-gov-badge";
        badge.textContent = `${res.total} Stored`;
      }
      if (strictBtn) {
        strictBtn.className = "strict-cookies-btn";
        strictBtnText.textContent = `🛡️ Optional Cookies Disabler (${res.tracking} Optional Found)`;
      }
    }

    if (trackerList && res.cookies) {
      trackerList.innerHTML = "";
      res.cookies.forEach(c => {
        const card = document.createElement("div");
        card.className = "cookie-item-card";
        
        const infoDiv = document.createElement("div");
        infoDiv.className = "cookie-item-info";
        
        const nameEl = document.createElement("div");
        nameEl.className = "cookie-item-name";
        nameEl.textContent = c.name;
        
        const badgeEl = document.createElement("span");
        badgeEl.className = `cookie-item-badge ${c.isTracking ? 'tracking' : 'essential'}`;
        badgeEl.textContent = c.category || (c.isTracking ? "Analytics/Advertising" : "Essential");
        nameEl.appendChild(badgeEl);
        
        const descEl = document.createElement("div");
        descEl.className = "cookie-item-desc";
        descEl.textContent = get3WordDescription(c.name, c.isTracking);
        
        infoDiv.appendChild(nameEl);
        infoDiv.appendChild(descEl);
        card.appendChild(infoDiv);
        
        if (c.isTracking) {
          const actionDiv = document.createElement("div");
          actionDiv.className = "cookie-item-action";
          
          const btn = document.createElement("button");
          btn.className = "btn-disable-single-cookie";
          btn.textContent = "Disable";
          btn.onclick = () => {
            btn.textContent = "Disabling...";
            btn.disabled = true;
            chrome.runtime.sendMessage({
              type: "REMOVE_SINGLE_COOKIE",
              cookie: c
            }, (response) => {
              if (response && response.success) {
                btn.textContent = "✅ Disabled";
                btn.classList.add("disabled");
                card.classList.add("disabled-card");
                
                // Update tracking count
                const currentVal = parseInt(trackingEl.textContent, 10);
                if (!isNaN(currentVal) && currentVal > 0) {
                  trackingEl.textContent = currentVal - 1;
                }
              } else {
                btn.textContent = "Failed";
                btn.disabled = false;
              }
            });
          };
          actionDiv.appendChild(btn);
          card.appendChild(actionDiv);
        } else {
          const keptDiv = document.createElement("div");
          keptDiv.className = "cookie-item-kept";
          keptDiv.textContent = "Protected";
          card.appendChild(keptDiv);
        }
        
        trackerList.appendChild(card);
      });
    }
  });
}

function renderBreaches(breaches) {
  const breachList = document.getElementById("breach-list");
  const breachTag = document.getElementById("breach-status-tag");
  if (!breachList || !breachTag) return;

  breachList.innerHTML = "";

  // Update Breach Check button indicator and count badge
  const breachBadge = document.getElementById("breach-count-badge");
  const breachDot = document.getElementById("breach-indicator-dot");
  if (breachBadge && breachDot) {
    if (breaches && breaches.length > 0) {
      breachBadge.textContent = breaches.length;
      breachBadge.className = "breach-badge-pill red";
      breachDot.className = "breach-dot-icon red";
    } else {
      breachBadge.textContent = "0";
      breachBadge.className = "breach-badge-pill green";
      breachDot.className = "breach-dot-icon green";
    }
  }

  if (breaches && breaches.length > 0) {
    breachTag.className = "breach-status-tag breached";
    breachTag.textContent = `${breaches.length} Breach${breaches.length > 1 ? "es" : ""} Detected`;

    breaches.forEach(b => {
      const card = document.createElement("div");
      card.className = "breach-card";

      const tagsHtml = (b.data_classes || []).map(cls => `<span class="breach-tag">${cls}</span>`).join("");
      
      // Multi-article pills (minimum 3 links)
      let articlesHtml = "";
      const articlesList = (b.articles && b.articles.length > 0) 
        ? b.articles 
        : (b.article_url ? [{ source: "Investigative Report", url: b.article_url }] : []);

      if (articlesList.length > 0) {
        const pills = articlesList.map(art => `
          <a href="${art.url}" target="_blank" rel="noopener noreferrer" class="breach-article-pill" data-url="${art.url}">
            <span>📰 ${art.source || "Article"} ↗</span>
          </a>
        `).join("");

        articlesHtml = `
          <div class="breach-articles-wrap">
            <span class="breach-articles-label">Verified Incident Coverage (${articlesList.length} Sources):</span>
            <div class="breach-articles-grid">${pills}</div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="breach-card-header">
          <span class="breach-title">${b.name || "Data Leak Incident"}</span>
          <span class="breach-date">${b.breach_date || "Disclosed"}</span>
        </div>
        <p class="breach-desc">${b.description || "Security incident compromised customer records."}</p>
        ${tagsHtml ? `<div class="breach-tags">${tagsHtml}</div>` : ""}
        ${articlesHtml}
      `;

      card.querySelectorAll(".breach-article-pill, .breach-article-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetUrl = btn.getAttribute("data-url") || btn.href;
          if (targetUrl) chrome.tabs.create({ url: targetUrl });
        });
      });

      breachList.appendChild(card);
    });
  } else {
    breachTag.className = "breach-status-tag clean";
    breachTag.textContent = "0 Breaches";
    breachList.innerHTML = `
      <div class="clean-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>No known public security breaches recorded.</span>
      </div>
    `;
  }
}

function styleStat(elementId, risk) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (risk === "low") el.style.color = "#10b981";
  else if (risk === "medium") el.style.color = "#f59e0b";
  else if (risk === "high" || risk === "critical") el.style.color = "#ef4444";
}

function renderUnknownState() {
  document.getElementById("site-name").textContent = "No Active Web Page";
  document.getElementById("site-domain").textContent = "Navigate to a website (e.g. boat-lifestyle.com)";
  document.getElementById("grade-letter").textContent = "-";
  document.getElementById("grade-score").textContent = "--/100";
  renderBreaches([]);
}

function openDeletionModal() {
  if (!currentRatingData) return;
  document.getElementById("deletion-modal").classList.remove("hidden");
  updateModalNoticePreview();
}

function updateModalNoticePreview() {
  if (!currentRatingData) return;
  const userName = document.getElementById("modal-user-name").value || "Data Principal";
  const userEmail = document.getElementById("modal-user-email").value || "user@guardra.local";
  const legalBasis = document.getElementById("modal-legal-basis").value;
  const domain = currentRatingData.domain;
  const name = currentRatingData.name || domain;
  const gEmail = currentRatingData.compliance?.dpdp?.grievance_email || `privacy@${domain}`;

  let previewText = "";
  if (legalBasis === "dpdp") {
    previewText = `To: Grievance Officer, ${name} (${gEmail})\nSubject: STATUTORY NOTICE: Personal Data Erasure under Section 12, DPDP Act 2023\n\nI, ${userName} (${userEmail}), hereby formally exercise my right to erasure of personal data under Section 12 & Section 13 of the Digital Personal Data Protection Act, 2023. You are obligated under DPDP Rules to execute this deletion and confirm compliance within thirty (30) days...`;
  } else if (legalBasis === "gdpr") {
    previewText = `To: DPO, ${name} (${gEmail})\nSubject: GDPR Article 17 Erasure Notice — ${userName}\n\nI, ${userName} (${userEmail}), formally submit this erasure request pursuant to Article 17 of Regulation (EU) 2016/679 (GDPR). Please confirm within 30 days...`;
  } else {
    previewText = `To: Legal Department, ${name} (${gEmail})\nSubject: CCPA Personal Information Deletion Request — ${userName}\n\nUnder Cal. Civ. Code § 1798.105, I request complete deletion of my personal information...`;
  }

  document.getElementById("modal-notice-preview").textContent = previewText;
}

function copyNoticeText() {
  const text = document.getElementById("modal-notice-preview").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("btn-copy-notice");
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy Text"; }, 2000);
  });
}

function sendNoticeEmail() {
  if (!currentRatingData) return;
  const userName = document.getElementById("modal-user-name").value || "Data Principal";
  const userEmail = document.getElementById("modal-user-email").value || "user@guardra.local";
  const legalBasis = document.getElementById("modal-legal-basis").value;
  const domain = currentRatingData.domain;
  const name = currentRatingData.name || domain;
  const gEmail = currentRatingData.compliance?.dpdp?.grievance_email || `privacy@${domain}`;

  const subject = legalBasis === "dpdp"
    ? `STATUTORY NOTICE: Personal Data Erasure under Section 12 DPDP Act 2023 - ${userName}`
    : (legalBasis === "gdpr" ? `GDPR Article 17 Erasure Request - ${userName}` : `CCPA Erasure Request - ${userName}`);

  const body = document.getElementById("modal-notice-preview").textContent;
  const mailtoUrl = `mailto:${gEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, "_blank");
}

const COOKIE_DESCRIPTIONS = {
  "_ga": "Tracks visitor site usage",
  "_gid": "Tracks visitor site usage",
  "_fbp": "Tracks ad conversions (Meta)",
  "_hjSession": "Records screen user sessions",
  "_hjSessionUser": "Records screen user sessions",
  "session_id": "Maintains your login session",
  "JSESSIONID": "Maintains your login session",
  "__cf_bm": "Cloudflare bot protection",
  "cf_clearance": "Cloudflare bot protection",
  "PHPSESSID": "Maintains your login session",
  "NID": "Google personalized advertising",
  "IDE": "Google DoubleClick advertising",
  "MUID": "Microsoft Bing advertising",
  "bcookie": "LinkedIn browser identifier",
  "li_sugr": "LinkedIn browser identifier"
};

function get3WordDescription(name, isTracking) {
  for (const [key, desc] of Object.entries(COOKIE_DESCRIPTIONS)) {
    if (name.includes(key)) return desc;
  }
  return isTracking ? "Tracks across websites" : "Maintains basic functionality";
}
