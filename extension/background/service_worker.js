const DEFAULT_API_BASE = "https://guardra-api.botvaibhav.dev";

const EMBEDDED_STANDALONE_DATABASE = {
  "boat-lifestyle.com": {
    name: "Boat Lifestyle",
    grade: "D",
    score: 38,
    color: "red",
    summary: "Personal data of 7.5 million Boat customers was leaked on dark web forums in April 2024, exposing names, phone numbers, and addresses. Extensive commercial marketing retargeting.",
    breaches: [
      {
        name: "Boat Lifestyle 7.5M Customer Records Leak",
        domain: "boat-lifestyle.com",
        breach_date: "April 2024",
        pwn_count: 7500000,
        data_classes: ["Full names", "Phone numbers", "Email addresses", "Shipping addresses", "Customer IDs"],
        article_url: "https://news.google.com/search?q=Boat+Lifestyle+7.5+million+data+breach+April+2024",
        articles: [
          { source: "Google News Coverage", url: "https://news.google.com/search?q=Boat+Lifestyle+7.5+million+data+breach+April+2024" },
          { source: "DuckDuckGo Intel", url: "https://duckduckgo.com/?q=Boat+Lifestyle+7.5+million+customer+data+leak+April+2024" },
          { source: "Security Incident Feed", url: "https://duckduckgo.com/?q=Boat+Lifestyle+ShopifyGUY+dark+web+leak" }
        ],
        description: "Personal data of 7.5 million customers leaked on dark web forums by hacker 'ShopifyGUY', exposing PII and delivery addresses."
      }
    ],
    rubric: {
      data_sharing: { score: 35, max: 100, label: "Shared Across Ad Networks & Marketing Partners", risk: "high" },
      retention: { score: 40, max: 100, label: "Order & Device History Retained for Advertising", risk: "medium" },
      tracking_cookies: { score: 30, max: 100, label: "Multiple Ad Pixels (Meta, Google, Criteo)", risk: "high" },
      user_rights: { score: 60, max: 100, label: "DPDP Grievance Officer Disclosed", risk: "medium" },
      breach_history: { score: 20, max: 100, label: "7.5 Million Records Leaked in April 2024", risk: "critical" },
      readability: { score: 55, max: 100, label: "Standard E-Commerce Terms", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Imagine Marketing Ltd (Boat)", grievance_email: "privacy@boat-lifestyle.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: false, dpo_contact: null, lawful_basis_stated: false, erasure_art17_disclosed: false },
      ccpa: { compliant: false, opt_out_link: null, do_not_sell: false }
    }
  },
  "amazon.com": {
    name: "Amazon",
    grade: "D",
    score: 38,
    color: "amber",
    summary: "Deep tracking of purchase intent, voice recordings (Alexa), and browsing telemetry. Extensive internal behavioral advertising.",
    breaches: [
      {
        name: "Amazon Ring & Alexa Privacy Violations",
        domain: "amazon.com",
        breach_date: "May 2023",
        pwn_count: 500000,
        data_classes: ["Private video feeds", "Voice recordings", "Account credentials", "Device identifiers"],
        article_url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns",
        articles: [
          { source: "Wikipedia Ring Security", url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns" },
          { source: "Wikipedia Alexa Privacy", url: "https://en.wikipedia.org/wiki/Amazon_Alexa#Privacy_concerns" },
          { source: "Wikipedia Amazon Concerns", url: "https://en.wikipedia.org/wiki/Amazon_(company)#Privacy_and_surveillance_concerns" }
        ],
        description: "FTC and Department of Justice penalised Amazon for allowing employees and third-party contractors unfettered access to customers' private video camera feeds."
      }
    ],
    rubric: {
      data_sharing: { score: 35, max: 100, label: "Shared Across Amazon Ad Network & Partners", risk: "high" },
      retention: { score: 30, max: 100, label: "Retains Purchase & Voice History Indefinitely", risk: "high" },
      tracking_cookies: { score: 30, max: 100, label: "Third-Party Ad Pixels and Fingerprinting", risk: "high" },
      user_rights: { score: 65, max: 100, label: "Data Request Tool Available in Account Settings", risk: "medium" },
      breach_history: { score: 45, max: 100, label: "Ring Camera Leaks, Internal Insider Leaks", risk: "medium" },
      readability: { score: 45, max: 100, label: "Long Multi-Section Dense Agreement", risk: "high" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Amazon India", grievance_email: "grievanceofficer@amazon.in", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "eu-dpo@amazon.lu", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://www.amazon.com/adprefs", do_not_sell: true }
    }
  },
  "amazon.in": {
    name: "Amazon India",
    grade: "D",
    score: 38,
    color: "amber",
    summary: "Deep tracking of purchase intent, delivery location history, and browsing telemetry. Aligned with DPDP Act 2023 grievance provisions in India.",
    breaches: [
      {
        name: "Amazon Ring & Alexa Privacy Violations",
        domain: "amazon.in",
        breach_date: "May 2023",
        pwn_count: 500000,
        data_classes: ["Private video feeds", "Voice recordings", "Account credentials", "Device identifiers"],
        article_url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns",
        articles: [
          { source: "Wikipedia Ring Security", url: "https://en.wikipedia.org/wiki/Ring_(company)#Privacy_and_security_concerns" },
          { source: "Wikipedia Alexa Privacy", url: "https://en.wikipedia.org/wiki/Amazon_Alexa#Privacy_concerns" },
          { source: "Wikipedia Amazon Concerns", url: "https://en.wikipedia.org/wiki/Amazon_(company)#Privacy_and_surveillance_concerns" }
        ],
        description: "FTC and Department of Justice penalised Amazon for allowing employees and third-party contractors unfettered access to customers' private video camera feeds."
      }
    ],
    rubric: {
      data_sharing: { score: 35, max: 100, label: "Shared Across Amazon Ad Network & Third-Party Merchants", risk: "high" },
      retention: { score: 30, max: 100, label: "Retains Purchase & Device History Indefinitely", risk: "high" },
      tracking_cookies: { score: 30, max: 100, label: "Third-Party Ad Pixels and Telemetry", risk: "high" },
      user_rights: { score: 65, max: 100, label: "DPDP Section 12 Deletion Requests via Grievance Officer", risk: "medium" },
      breach_history: { score: 50, max: 100, label: "Monitored Security Profile", risk: "medium" },
      readability: { score: 45, max: 100, label: "Dense Commercial Agreement", risk: "high" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Amazon Seller Services Pvt Ltd", grievance_email: "grievanceofficer@amazon.in", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "eu-dpo@amazon.lu", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://www.amazon.in/adprefs", do_not_sell: true }
    }
  },
  "swiggy.com": {
    name: "Swiggy",
    grade: "C",
    score: 58,
    color: "amber",
    summary: "Continuous real-time GPS location tracking, dietary order profiling, device telemetry, and advertising SDKs.",
    rubric: {
      data_sharing: { score: 45, max: 100, label: "Shared with Restaurant Partners, Delivery Fleet & Ad Networks", risk: "high" },
      retention: { score: 60, max: 100, label: "Retained for 7 Years for Statutory Tax & Commercial Audits", risk: "medium" },
      tracking_cookies: { score: 50, max: 100, label: "Multiple Analytics & Remarketing Pixels (AppsFlyer, CleverTap)", risk: "medium" },
      user_rights: { score: 75, max: 100, label: "Account Deletion Flow in App Settings (Sec 12 Compliant)", risk: "low" },
      breach_history: { score: 70, max: 100, label: "No Major Uncontained Breaches Reported", risk: "low" },
      readability: { score: 60, max: 100, label: "Standard Length with India DPDP Act Reference", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Bundl Technologies Pvt Ltd", grievance_email: "grievances@swiggy.in", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: false, dpo_contact: null, lawful_basis_stated: false, erasure_art17_disclosed: false },
      ccpa: { compliant: false, opt_out_link: null, do_not_sell: false }
    }
  },
  "zomato.com": {
    name: "Zomato",
    grade: "C-",
    score: 52,
    color: "amber",
    summary: "Extensive order history profiling, continuous live location tracking, and vendor monetization. 17M record breach in 2017.",
    rubric: {
      data_sharing: { score: 40, max: 100, label: "Broad Third-Party Delivery & Marketing Network Sharing", risk: "high" },
      retention: { score: 55, max: 100, label: "Order Data Retained for Long-Term Behavioral Modeling", risk: "medium" },
      tracking_cookies: { score: 45, max: 100, label: "Behavioral Trackers & Ad Network Telemetry", risk: "medium" },
      user_rights: { score: 70, max: 100, label: "Data Deletion Option Available in Profile Settings", risk: "low" },
      breach_history: { score: 40, max: 100, label: "17 Million User Records Leaked in 2017 Hack", risk: "high" },
      readability: { score: 60, max: 100, label: "Clear Structure with Indian Grievance Desk", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Redressal Officer, Zomato Ltd", grievance_email: "grievanceofficer@zomato.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "dpo@zomato.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: false, opt_out_link: null, do_not_sell: false }
    }
  },
  "google.com": {
    name: "Google",
    grade: "D+",
    score: 42,
    color: "amber",
    summary: "Pervasive cross-web tracking, search intent indexing, location history, and YouTube telemetry feeding the largest commercial ad exchange.",
    rubric: {
      data_sharing: { score: 35, max: 100, label: "Data Broadcast across Global Google Ads & Bidder Network", risk: "high" },
      retention: { score: 40, max: 100, label: "Default 18-Month Auto-Delete Window (Configurable)", risk: "medium" },
      tracking_cookies: { score: 25, max: 100, label: "Pervasive Tracking Across 80%+ of the Global Web", risk: "high" },
      user_rights: { score: 80, max: 100, label: "Google Takeout and Comprehensive Privacy Dashboard Available", risk: "low" },
      breach_history: { score: 65, max: 100, label: "Robust Infrastructure, Significant Antitrust Fines", risk: "medium" },
      readability: { score: 50, max: 100, label: "Layered Policy with Interactive Guides", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Google LLC India Support", grievance_email: "support-in@google.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "data-protection-office@google.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://myadcenter.google.com", do_not_sell: true }
    }
  },
  "meta.com": {
    name: "Meta",
    grade: "F",
    score: 28,
    color: "red",
    summary: "Systematic shadow profiling, cross-site Pixel telemetry, biometric inference, and massive historical data breaches.",
    rubric: {
      data_sharing: { score: 20, max: 100, label: "Off-Facebook Tracking and Commercial Ad Partner Sharing", risk: "high" },
      retention: { score: 25, max: 100, label: "Indefinite Telemetry Retention for AI Model Training", risk: "high" },
      tracking_cookies: { score: 15, max: 100, label: "Meta Pixel Deployed on Millions of Third-Party Websites", risk: "high" },
      user_rights: { score: 65, max: 100, label: "Accounts Center Controls (Opaque Opt-Out Flow)", risk: "medium" },
      breach_history: { score: 20, max: 100, label: "533M Phone Number Leak (2019), Cambridge Analytica Scandal", risk: "high" },
      readability: { score: 40, max: 100, label: "Dense, Fragmented Legal Disclosures", risk: "high" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Meta Platforms Inc (India)", grievance_email: "fb-grievance-officer-india@fb.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "https://www.facebook.com/help/contact/540977946302970", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://www.facebook.com/adpreferences", do_not_sell: true }
    }
  },
  "duckduckgo.com": {
    name: "DuckDuckGo",
    grade: "A+",
    score: 96,
    color: "green",
    summary: "Strict zero-tracking search engine. Does not store IP addresses, search queries, or user identifiers.",
    rubric: {
      data_sharing: { score: 98, max: 100, label: "Zero Third-Party Commercial Sharing", risk: "low" },
      retention: { score: 98, max: 100, label: "No Personal Data Stored or Retained", risk: "low" },
      tracking_cookies: { score: 98, max: 100, label: "No Tracking Cookies or Fingerprinting", risk: "low" },
      user_rights: { score: 95, max: 100, label: "Privacy by Design (No Personal Data to Erase)", risk: "low" },
      breach_history: { score: 95, max: 100, label: "Zero Data Breach History", risk: "low" },
      readability: { score: 90, max: 100, label: "Short, Clear, Human-Readable Privacy Policy", risk: "low" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Privacy Team, DuckDuckGo Inc.", grievance_email: "privacy@duckduckgo.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "privacy@duckduckgo.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: null, do_not_sell: true }
    }
  },
  "proton.me": {
    name: "Proton",
    grade: "A+",
    score: 95,
    color: "green",
    summary: "End-to-end encrypted email, drive, and VPN. Zero-access architecture protected by strict Swiss privacy laws.",
    rubric: {
      data_sharing: { score: 98, max: 100, label: "Zero Commercial Data Sharing", risk: "low" },
      retention: { score: 95, max: 100, label: "Encrypted at Rest; Retained Only for Account Lifespan", risk: "low" },
      tracking_cookies: { score: 95, max: 100, label: "No Third-Party Advertising Pixels", risk: "low" },
      user_rights: { score: 95, max: 100, label: "Instant Complete Account & Data Erasure Flow", risk: "low" },
      breach_history: { score: 95, max: 100, label: "Audited Cryptography with Clean Track Record", risk: "low" },
      readability: { score: 88, max: 100, label: "Transparent and Plain-Language Legal Disclosures", risk: "low" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Privacy Officer, Proton AG", grievance_email: "privacy@proton.me", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "dpo@proton.me", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: null, do_not_sell: true }
    }
  },
  "flipkart.com": {
    name: "Flipkart",
    grade: "C-",
    score: 48,
    color: "amber",
    summary: "Tracks shopping behavior, device identifiers, and location. Aligned with DPDP Act grievance provisions in India.",
    rubric: {
      data_sharing: { score: 40, max: 100, label: "Shared with Walmart Group Entities & Third-Party Sellers", risk: "high" },
      retention: { score: 45, max: 100, label: "Retained for Extended Commercial Records & Fraud Audits", risk: "medium" },
      tracking_cookies: { score: 45, max: 100, label: "Ad Tracking and Cross-Device Synchronizing", risk: "medium" },
      user_rights: { score: 65, max: 100, label: "Grievance Officer Support for Erasure Requests", risk: "medium" },
      breach_history: { score: 60, max: 100, label: "Standard Commercial Security Infrastructure", risk: "low" },
      readability: { score: 55, max: 100, label: "Standard E-Commerce Legal Terms", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Flipkart Internet Pvt Ltd", grievance_email: "grievance.officer@flipkart.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: false, dpo_contact: null, lawful_basis_stated: false, erasure_art17_disclosed: false },
      ccpa: { compliant: false, opt_out_link: null, do_not_sell: false }
    }
  },
  "github.com": {
    name: "GitHub",
    grade: "B+",
    score: 82,
    color: "green",
    summary: "Developer platform with clear data handling terms. Telemetry opt-out available in settings.",
    rubric: {
      data_sharing: { score: 80, max: 100, label: "Limited to Microsoft Group and Service Infrastructure", risk: "low" },
      retention: { score: 80, max: 100, label: "User-Controlled Repositories & Account Erasure", risk: "low" },
      tracking_cookies: { score: 85, max: 100, label: "Minimal Tracking on Code Views", risk: "low" },
      user_rights: { score: 85, max: 100, label: "Full Repository & Account Export and Purge", risk: "low" },
      breach_history: { score: 75, max: 100, label: "Standard Security Audits & Incident Notifications", risk: "low" },
      readability: { score: 85, max: 100, label: "Well-Documented and Transparent", risk: "low" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Privacy Officer, GitHub", grievance_email: "support@github.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "dpo@github.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://github.com/settings", do_not_sell: true }
    }
  },
  "netflix.com": {
    name: "Netflix",
    grade: "B",
    score: 76,
    color: "green",
    summary: "Viewing telemetry used for recommendation algorithms. Clear privacy controls with no broad third-party data sales.",
    rubric: {
      data_sharing: { score: 75, max: 100, label: "Controlled Streaming Infrastructure Sharing", risk: "low" },
      retention: { score: 70, max: 100, label: "Viewing History Cleared on Account Deletion", risk: "medium" },
      tracking_cookies: { score: 75, max: 100, label: "First-Party Viewing Preference Cookies", risk: "low" },
      user_rights: { score: 85, max: 100, label: "1-Click Viewing History & Profile Erasure", risk: "low" },
      breach_history: { score: 85, max: 100, label: "High Security Standards", risk: "low" },
      readability: { score: 75, max: 100, label: "Clear and Concise Disclosures", risk: "low" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Grievance Officer, Netflix Entertainment Services India LLP", grievance_email: "grievance-officer-india@netflix.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "privacy@netflix.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://www.netflix.com/youraccount", do_not_sell: true }
    }
  },
  "apple.com": {
    name: "Apple",
    grade: "A-",
    score: 85,
    color: "green",
    summary: "Privacy-centric device architecture with on-device AI processing and App Tracking Transparency.",
    rubric: {
      data_sharing: { score: 85, max: 100, label: "Strict Data Minimization & No Third-Party Data Sale", risk: "low" },
      retention: { score: 80, max: 100, label: "On-Device Processing for Siri & Search", risk: "low" },
      tracking_cookies: { score: 85, max: 100, label: "Minimal Web Tracking with Safari ITP", risk: "low" },
      user_rights: { score: 90, max: 100, label: "privacy.apple.com Self-Service Data Deletion Portal", risk: "low" },
      breach_history: { score: 85, max: 100, label: "Strong Hardware Encryption & Security Record", risk: "low" },
      readability: { score: 85, max: 100, label: "High Plain-Language Clarity", risk: "low" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: "Privacy Officer, Apple India", grievance_email: "privacy@apple.com", redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: "dpo@apple.com", lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: true, opt_out_link: "https://privacy.apple.com", do_not_sell: true }
    }
  }
};

function extractDomain(url) {
  try {
    if (!url || url.startsWith("chrome://") || url.startsWith("about:") || url.startsWith("edge://")) {
      return null;
    }
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch (e) {
    return null;
  }
}

function updateBadge(tabId, grade, colorHex) {
  if (!tabId) return;
  chrome.action.setBadgeText({ tabId, text: grade || "" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: colorHex || "#64748b" });
}

const LOCAL_API_BASE = "http://localhost:8000";
const REMOTE_API_BASE = "https://guardra-api.botvaibhav.dev";

async function getApiBase() {
  const result = await chrome.storage.local.get("apiBase");
  return result.apiBase || LOCAL_API_BASE;
}


async function adjustRatingForCookies(rating, domain) {
  if (!rating || !rating.rubric || !rating.rubric.tracking_cookies) return rating;
  const cleanDom = domain.replace(/^www\./, "");
  const storageKey = `strict_cookies_${cleanDom}`;
  const stored = await chrome.storage.local.get([storageKey, "guardra_auto_disable_cookies"]);
  const isEnforced = (stored[storageKey] && stored[storageKey].enforced) || stored.guardra_auto_disable_cookies;

  if (isEnforced) {
    rating.rubric.tracking_cookies.score = 100;
    rating.rubric.tracking_cookies.label = "Tracking Cookies Neutralized";
    rating.rubric.tracking_cookies.risk = "low";
    
    let totalScore = 0;
    let count = 0;
    for (const key in rating.rubric) {
      totalScore += rating.rubric[key].score;
      count++;
    }
    if (count > 0) {
      rating.score = Math.round(totalScore / count);
      if (rating.score >= 90) rating.grade = "A+";
      else if (rating.score >= 80) rating.grade = "A";
      else if (rating.score >= 70) rating.grade = "B";
      else if (rating.score >= 60) rating.grade = "C";
      else if (rating.score >= 50) rating.grade = "D";
      else rating.grade = "F";
    }
  }
  return rating;
}

async function fetchSiteRating(domain) {
  const rating = await fetchSiteRatingRaw(domain);
  return await adjustRatingForCookies(rating, domain);
}

async function fetchSiteRatingRaw(domain) {
  if (!domain) return null;
  const cleanDom = domain.replace(/^www\./, "").toLowerCase();

  // Try local API first, then remote API
  const endpoints = [
    `http://localhost:8000/api/policy/rating?domain=${encodeURIComponent(cleanDom)}`,
    `${REMOTE_API_BASE}/api/policy/rating?domain=${encodeURIComponent(cleanDom)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const resp = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          "X-Guardra-Client": "Extension-v2.0",
          "Accept": "application/json"
        }
      });
      clearTimeout(timeoutId);
      if (resp.ok) {
        const liveRating = await resp.json();
        await chrome.storage.local.set({ 
          [`cached_rating_${cleanDom}`]: liveRating,
          currentTabRating: liveRating,
          currentTabDomain: cleanDom
        });
        return liveRating;
      }
    } catch (e) {}
  }

  // 2. Check local storage cache
  const cached = await chrome.storage.local.get(`cached_rating_${cleanDom}`);
  if (cached && cached[`cached_rating_${cleanDom}`]) {
    return cached[`cached_rating_${cleanDom}`];
  }

  // 3. Fallback to embedded database
  for (const [key, val] of Object.entries(EMBEDDED_STANDALONE_DATABASE)) {
    if (cleanDom === key || cleanDom.endsWith("." + key) || key.endsWith("." + cleanDom)) {
      return {
        domain: cleanDom,
        name: val.name,
        grade: val.grade,
        score: val.score,
        color: val.color,
        summary: val.summary,
        breaches: val.breaches || [],
        rubric: val.rubric,
        compliance: val.compliance,
        category: "Web Platform",
        source: "standalone_offline"
      };
    }
  }

  // 4. Default fallback baseline profile for unlisted domain
  return {
    domain: cleanDom,
    name: cleanDom.split(".")[0].toUpperCase(),
    grade: "C",
    score: 55,
    color: "amber",
    summary: `Active scanning for ${cleanDom}. Privacy disclosures active.`,
    rubric: {
      data_sharing: { score: 55, max: 100, label: "Standard Vendor Sharing", risk: "medium" },
      retention: { score: 55, max: 100, label: "Standard Retention Window", risk: "medium" },
      tracking_cookies: { score: 55, max: 100, label: "Standard Analytics", risk: "medium" },
      user_rights: { score: 65, max: 100, label: "Legal Deletion Supported", risk: "medium" },
      breach_history: { score: 75, max: 100, label: "No Known Major Breaches", risk: "low" },
      readability: { score: 55, max: 100, label: "Standard Terms", risk: "medium" }
    },
    compliance: {
      dpdp: { compliant: true, grievance_officer: `Grievance Redressal (${cleanDom})`, grievance_email: `privacy@${cleanDom}`, redressal_period_days: 30, erasure_right_disclosed: true },
      gdpr: { compliant: true, dpo_contact: `dpo@${cleanDom}`, lawful_basis_stated: true, erasure_art17_disclosed: true },
      ccpa: { compliant: false, opt_out_link: null, do_not_sell: false }
    },
    category: "Website",
    source: "standalone_heuristic"
  };
}

// --- Cookie Classification & Governance Engine ---
const STRICT_ESSENTIAL_COOKIE_PATTERNS = [
  /^(sess|session|sid|token|auth|jwt|bearer|login|user_session|secure_session)/i,
  /^(phpsessid|jsessionid|aspsessionid|connect\.sid|ss-id|ci_session)/i,
  /^(csrf|_csrf|xsrf|_xsrf|csrf_token|antiforgery|__cf_bm|cf_clearance|__cfruid)/i,
  /^(cart|basket|order|checkout|currency|locale|lang|country)/i,
  /^(cookie_consent|optanon|cookieconsent|cc_cookie|gdpr|eu_consent|notice_preferences)/i
];

const KNOWN_TRACKER_COOKIE_PATTERNS = [
  /^(_ga|_gid|_gat|_gcl|__utm|gtag|gads|1P_JAR|NID|DSID|IDE)/i,
  /^(_fbp|_fbc|datr|sb|fr|c_user|xs|act|presence)/i,
  /^(_ttp|_tt)/i,
  /^(_clck|_clsk|MUID)/i,
  /^(cto_|_hj)/i
];

function isEssentialCookie(cookie) {
  const name = (cookie.name || "").trim();
  for (const pat of KNOWN_TRACKER_COOKIE_PATTERNS) {
    if (pat.test(name)) return false;
  }
  for (const pat of STRICT_ESSENTIAL_COOKIE_PATTERNS) {
    if (pat.test(name)) return true;
  }
  if (cookie.session || !cookie.expirationDate) {
    return true;
  }
  return false;
}

async function getDomainCookies(domain, tabUrl) {
  if (!domain) return [];
  const cleanDomain = domain.replace(/^www\./, "");
  
  let allCookies = [];
  try {
    const domainCookies = await chrome.cookies.getAll({ domain: cleanDomain });
    allCookies.push(...domainCookies);
  } catch (e) {}

  if (tabUrl && tabUrl.startsWith("http")) {
    try {
      const urlCookies = await chrome.cookies.getAll({ url: tabUrl });
      allCookies.push(...urlCookies);
    } catch (e) {}
  }

  const cookieMap = new Map();
  allCookies.forEach(c => {
    const key = `${c.name}|${c.domain}|${c.path}`;
    cookieMap.set(key, c);
  });
  return Array.from(cookieMap.values());
}

async function auditDomainCookies(domain, tabUrl, tabId) {
  const cookies = await getDomainCookies(domain, tabUrl);
  let essential = 0;
  let tracking = 0;
  const trackingNames = [];
  const essentialNames = [];
  const detailedCookies = [];

  cookies.forEach(c => {
    const isEss = isEssentialCookie(c);
    if (isEss) {
      essential++;
      essentialNames.push(c.name);
    } else {
      tracking++;
      trackingNames.push(c.name);
    }

    let category = isEss ? "Essential Cookie" : "Analytics/Advertising";
    const nameLower = (c.name || "").toLowerCase();
    if (nameLower.includes("ad") || nameLower.startsWith("_fb") || nameLower.includes("criteo") || nameLower.startsWith("_tt") || nameLower.includes("nid") || nameLower.includes("ide")) {
      category = "Advertising";
    } else if (nameLower.startsWith("_ga") || nameLower.startsWith("_gi") || nameLower.includes("analytics") || nameLower.includes("hotjar") || nameLower.includes("clarity")) {
      category = "Analytics";
    } else if (nameLower.includes("session") || nameLower.includes("auth") || nameLower.includes("login") || nameLower.includes("cart") || nameLower.includes("csrf")) {
      category = "Essential";
    }

    detailedCookies.push({
      name: c.name,
      domain: c.domain,
      isTracking: !isEss,
      category: category,
      value: c.value,
      storeId: c.storeId,
      path: c.path,
      secure: c.secure
    });
  });

  const cleanDom = (domain || "").replace(/^www\./, "");
  const storageKey = `strict_cookies_${cleanDom}`;
  const stored = await chrome.storage.local.get(storageKey);
  const isEnforced = !!stored[storageKey]?.enforced;

  let trackers = [];
  if (tabId) {
    const sessionRes = await chrome.storage.local.get(`tab_session_${tabId}`);
    const session = sessionRes[`tab_session_${tabId}`] || {};
    trackers = session.trackers_detected || [];
  }
  if (!trackers || trackers.length === 0) {
    const actRes = await chrome.storage.local.get(`activity_${cleanDom}`);
    if (actRes[`activity_${cleanDom}`]?.trackers_detected) {
      trackers = actRes[`activity_${cleanDom}`].trackers_detected;
    }
  }

  return {
    domain: cleanDom,
    total: cookies.length + (trackers ? trackers.length : 0),
    essential,
    tracking,
    isEnforced,
    trackingNames,
    essentialNames,
    cookies: detailedCookies,
    trackers: trackers || []
  };
}

async function enforceStrictCookies(domain, tabUrl) {
  const cookies = await getDomainCookies(domain, tabUrl);
  let kept = 0;
  let removed = 0;
  const removedNames = [];

  for (const c of cookies) {
    if (isEssentialCookie(c)) {
      kept++;
    } else {
      const protocol = c.secure ? "https:" : "http:";
      const cleanDom = c.domain.replace(/^\./, "");
      const cookieUrl = `${protocol}//${cleanDom}${c.path}`;

      try {
        await chrome.cookies.remove({
          url: cookieUrl,
          name: c.name,
          storeId: c.storeId
        });
        removed++;
        removedNames.push(c.name);
      } catch (err) {
        if (tabUrl) {
          try {
            await chrome.cookies.remove({
              url: tabUrl,
              name: c.name,
              storeId: c.storeId
            });
            removed++;
            removedNames.push(c.name);
          } catch (e2) {}
        }
      }
    }
  }

  const cleanDom = domain.replace(/^www\./, "");
  const storageKey = `strict_cookies_${cleanDom}`;
  await chrome.storage.local.set({
    [storageKey]: {
      enforced: true,
      timestamp: Date.now(),
      removedCount: removed,
      keptCount: kept
    }
  });

  try {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (t.url && extractDomain(t.url) === cleanDom) {
        chrome.tabs.sendMessage(t.id, { type: "STRICT_COOKIES_ENFORCED", domain: cleanDom }, () => {
          if (chrome.runtime.lastError) {}
        });
        updateTabState(t.id, t.url);
      }
    }
  } catch (e) {}

  return {
    success: true,
    total: cookies.length,
    kept,
    removed,
    removedNames
  };
}


chrome.cookies.onChanged.addListener(async (changeInfo) => {
  if (changeInfo.removed) return;
  const cookie = changeInfo.cookie;
  if (isEssentialCookie(cookie)) return;

  const cleanDom = cookie.domain.replace(/^\./, "");
  const storageKey = `strict_cookies_${cleanDom}`;
  const stored = await chrome.storage.local.get([storageKey, "guardra_auto_disable_cookies"]);
  
  const isEnforced = (stored[storageKey] && stored[storageKey].enforced) || stored.guardra_auto_disable_cookies;

  if (isEnforced) {
    const protocol = cookie.secure ? "https:" : "http:";
    const cookieUrl = `${protocol}//${cleanDom}${cookie.path}`;
    try {
      await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
      });
    } catch (e) {}
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REMOVE_SINGLE_COOKIE") {
    const { domain, name, storeId, path, secure, url } = message;
    let cookieUrl = url;
    if (!cookieUrl && domain) {
      const cleanDom = domain.replace(/^\./, "");
      const protocol = secure ? "https:" : "http:";
      cookieUrl = `${protocol}//${cleanDom}${path || "/"}`;
    }
    
    if (cookieUrl && name) {
      const removeDetails = {
        url: cookieUrl,
        name: name
      };
      if (storeId !== undefined) removeDetails.storeId = storeId;

      chrome.cookies.remove(removeDetails).then((removedCookie) => {
        sendResponse({ success: !!removedCookie, name: name });
      }).catch(err => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    } else {
      return false;
    }
  }

  if (message.type === "BLOCK_TRACKER_SCRIPT") {
    const { trackerName, domain, url } = message;
    const cleanDom = (domain || "").replace(/^www\./, "");
    
    let patternRegex = null;
    const lower = (trackerName || "").toLowerCase();
    if (lower.includes("meta") || lower.includes("facebook")) {
      patternRegex = /^(_fbp|_fbc|fr|tr|datr|sb|c_user|xs|wd)/i;
    } else if (lower.includes("google") || lower.includes("analytics")) {
      patternRegex = /^(_ga|_gid|_gat|__utm|_gcl_|_gac_|1P_JAR|NID|ANID|IDE|DSID)/i;
    } else if (lower.includes("criteo")) {
      patternRegex = /^(cto_|criteo)/i;
    } else if (lower.includes("tiktok")) {
      patternRegex = /^(_tt_enable_cookie|_ttp)/i;
    } else if (lower.includes("hotjar")) {
      patternRegex = /^(_hj)/i;
    } else if (lower.includes("clarity")) {
      patternRegex = /^(_clck|_clsk|MUID)/i;
    }

    if (patternRegex) {
      chrome.cookies.getAll({ domain: cleanDom }).then(cookies => {
        cookies.forEach(c => {
          if (patternRegex.test(c.name)) {
            const protocol = c.secure ? "https:" : "http:";
            chrome.cookies.remove({
              url: `${protocol}//${cleanDom}${c.path}`,
              name: c.name,
              storeId: c.storeId
            }).catch(() => {});
          }
        });
      }).catch(() => {});
    }

    sendResponse({ success: true, trackerName });
    return true;
  }

  if (message.type === "GET_COOKIE_AUDIT") {
    const domain = message.domain;
    const tabUrl = message.url;
    const tabId = message.tabId;
    auditDomainCookies(domain, tabUrl, tabId).then(stats => {
      sendResponse(stats);
    }).catch(err => {
      sendResponse({ error: err.message, total: 0, essential: 0, tracking: 0 });
    });
    return true;
  }

  if (message.type === "ENFORCE_STRICT_COOKIES") {
    const domain = message.domain;
    const tabUrl = message.url;
    enforceStrictCookies(domain, tabUrl).then(result => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (message.type === "GET_CURRENT_RATING") {
    if (message.domain) {
      fetchSiteRating(message.domain).then(rating => {
        sendResponse({ domain: message.domain, rating });
      });
      return true;
    }

    const tabUrl = sender.tab?.url;
    const domain = tabUrl ? extractDomain(tabUrl) : null;
    if (domain) {
      fetchSiteRating(domain).then(rating => {
        sendResponse({ domain, rating });
      });
      return true;
    } else {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
        let activeTab = tabs && tabs.length > 0 ? tabs[0] : null;
        if (!activeTab || !activeTab.url) {
          const allTabs = await chrome.tabs.query({ active: true });
          activeTab = allTabs.find(t => t.url && !t.url.startsWith("chrome://")) || null;
        }

        if (activeTab && activeTab.url) {
          const d = extractDomain(activeTab.url);
          if (d) {
            const r = await fetchSiteRating(d);
            sendResponse({ domain: d, rating: r });
            return;
          }
        }
        sendResponse({ domain: null, rating: null });
      });
      return true;
    }
  }

  // Telemetry sync if remote API configured
  if (message.type === "BROWSER_ACTIVITY") {
    const data = message.data;
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId && data.trackers_detected) {
      chrome.storage.local.get(`tab_session_${tabId}`).then(res => {
        const session = res[`tab_session_${tabId}`] || {};
        session.trackers_detected = data.trackers_detected;
        chrome.storage.local.set({ [`tab_session_${tabId}`]: session });
      });
    }
    getApiBase().then((apiBase) => {
      if (apiBase && apiBase.startsWith("http")) {
        fetch(`${apiBase}/api/hub/telemetry/active-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: data.hostname,
            url: data.url,
            action_type: data.auto_actions && data.auto_actions.length > 0 ? "Automated Privacy Actions" : "Active Tab Scanned",
            details: data.auto_actions && data.auto_actions.length > 0 ? data.auto_actions.join("; ") : `Detected ${data.tracker_count} trackers on ${data.hostname}`,
            trackers_detected: data.trackers_detected || [],
            auto_actions_taken: data.auto_actions || []
          })
        }).catch(() => {});
      }
    });
  }
});

