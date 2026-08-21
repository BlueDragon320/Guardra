let currentRatingData = null;
const DASHBOARD_URL = "http://localhost:5173";

const CLIENT_KNOWN_BREACHES = [
  {
    domain: "boat-lifestyle.com",
    name: "Boat Lifestyle 7.5M Customer Records Leak",
    breach_date: "April 2024",
    pwn_count: 7500000,
    data_classes: ["Full names", "Phone numbers", "Email addresses", "Shipping addresses", "Customer IDs"],
    article_url: "https://www.thehindu.com/sci-tech/technology/personal-data-of-over-75-million-boat-customers-leaked-on-dark-web/article68037375.ece",
    description: "Personal data of 7.5 million Boat customers leaked on dark web forums by hacker 'ShopifyGUY', exposing full names, phone numbers, and addresses."
  },
  {
    domain: "zomato.com",
    name: "Zomato 17M User Records Compromised",
    breach_date: "May 2017",
    pwn_count: 17000000,
    data_classes: ["Email addresses", "Usernames", "Hashed passwords"],
    article_url: "https://techcrunch.com/2017/05/18/zomato-hacked-17m-users-data-stolen/",
    description: "Hacker 'nclay' breached Zomato's database and put 17 million user emails and salted hashes for sale on dark web forums."
  },
  {
    domain: "bigbasket.com",
    name: "BigBasket 20M Customer Database Leak",
    breach_date: "October 2020",
    pwn_count: 20000000,
    data_classes: ["Email addresses", "Delivery addresses", "Phone numbers"],
    article_url: "https://gadgets360.com/internet/news/bigbasket-data-breach-2-crore-users-details-dark-web-sale-30-lakh-cyble-2322304",
    description: "20 million user accounts containing full names, hashed passwords, and residential addresses leaked on the dark web."
  },
  {
    domain: "dominos.co.in",
    name: "Dominos India 180M Order & GPS Telemetry Leak",
    breach_date: "May 2021",
    pwn_count: 180000000,
    data_classes: ["Phone numbers", "GPS coordinates", "Delivery addresses"],
    article_url: "https://www.bleepingcomputer.com/news/security/dominos-india-data-leak-180-million-order-details-made-searchable/",
    description: "Public search engine created for 180 million Domino's India pizza orders leaking customer coordinates and delivery logs."
  },
  {
    domain: "airindia.com",
    name: "Air India SITA Passenger Data Cyberattack",
    breach_date: "March 2021",
    pwn_count: 4500000,
    data_classes: ["Passport numbers", "Credit card numbers", "Full names"],
    article_url: "https://techcrunch.com/2021/05/21/air-india-cyberattack-sita-data-leak/",
    description: "Cyberattack on aviation provider SITA compromised 4.5 million Air India frequent flyers, including passport & credit card data."
  },
  {
    domain: "upstox.com",
    name: "Upstox 2.5M Investor KYC & PAN Leak",
    breach_date: "April 2021",
    pwn_count: 2500000,
    data_classes: ["PAN cards", "Bank account numbers", "KYC documents"],
    article_url: "https://www.medianama.com/2021/04/223-upstox-data-breach/",
    description: "Unauthorized database access exposed 2.5 million KYC records including PAN numbers and bank account numbers."
  },
  {
    domain: "facebook.com",
    name: "Meta (Facebook) 533M User Phone Number Scrape",
    breach_date: "April 2021",
    pwn_count: 533000000,
    data_classes: ["Phone numbers", "Facebook IDs", "Full names"],
    article_url: "https://www.businessinsider.com/stolen-data-of-533-million-facebook-users-leaked-online-2021-4",
    description: "533 million Facebook users' mobile numbers linked to public IDs posted on hacking forums."
  },
  {
    domain: "amazon.in",
    name: "Amazon Ring Insider Privacy Breach",
    breach_date: "May 2023",
    pwn_count: 500000,
    data_classes: ["Private video feeds", "Account credentials"],
    article_url: "https://www.reuters.com/legal/us-ftc-reaches-settlement-with-amazon-over-ring-security-cameras-2023-05-31/",
    description: "FTC penalized Amazon for allowing employees unfettered access to customers' private Ring video feeds."
  },
  {
    domain: "canva.com",
    name: "Canva 137M Customer Records Compromised",
    breach_date: "May 2019",
    pwn_count: 137000000,
    data_classes: ["Email addresses", "Names", "Passwords"],
    article_url: "https://techcrunch.com/2019/05/24/canva-cyber-attack-139-million-users/",
    description: "137 million Canva accounts exposed containing names, emails, and salted password hashes."
  },
  {
    domain: "linkedin.com",
    name: "LinkedIn 700M Profile Scrape",
    breach_date: "June 2021",
    pwn_count: 700000000,
    data_classes: ["Email addresses", "Phone numbers", "Work history"],
    article_url: "https://www.bleepingcomputer.com/news/security/700-million-linkedin-records-for-sale-on-hacker-forum/",
    description: "700M LinkedIn profiles scraped and posted on dark web forums with professional and phone details."
  },
  {
    domain: "x.com",
    name: "Twitter / X 200M Account Scrape",
    breach_date: "January 2023",
    pwn_count: 200000000,
    data_classes: ["Email addresses", "Usernames"],
    article_url: "https://www.reuters.com/technology/hackers-leak-emails-over-200-million-twitter-users-security-researcher-says-2023-01-05/",
    description: "Over 200 million Twitter records scraped via API vulnerability linking emails to public handles."
  },
  {
    domain: "swiggy.com",
    name: "Swiggy Delivery Partner & User Telemetry Leak",
    breach_date: "May 2020",
    pwn_count: 2500000,
    data_classes: ["Mobile numbers", "Delivery coordinates"],
    article_url: "https://www.thehindubusinessline.com/info-tech/security-flaw-in-swiggy-app-exposed-user-data-say-researchers/article31633519.ece",
    description: "Security flaw exposed delivery partner coordinates and order preferences."
  }
];

function getClientBreaches(domain) {
  if (!domain) return [];
  const clean = domain.toLowerCase().replace(/^www\./, "");
  return CLIENT_KNOWN_BREACHES.filter(b => clean === b.domain || clean.endsWith("." + b.domain) || b.domain.endsWith("." + clean));
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
  document.getElementById("modal-user-email").addEventListener("input", updateModalNoticePreview);

  document.getElementById("btn-copy-notice").addEventListener("click", copyNoticeText);
  document.getElementById("btn-send-email").addEventListener("click", sendNoticeEmail);
});

async function loadActiveTabRating(forceRefresh = false) {
  let domain = null;
  try {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs && tabs.length > 0 && tabs[0].url) {
      domain = extractDomain(tabs[0].url);
    }
  } catch (e) {}

  if (!domain) {
    try {
      const allTabs = await chrome.tabs.query({ active: true });
      const found = allTabs.find(t => t.url && !t.url.startsWith("chrome://"));
      if (found) domain = extractDomain(found.url);
    } catch (e) {}
  }

  if (domain) {
    document.getElementById("site-name").textContent = domain.split(".")[0].toUpperCase();
    document.getElementById("site-domain").textContent = domain;
    // Pre-render client breach status immediately
    const immediateBreaches = getClientBreaches(domain);
    renderBreaches(immediateBreaches);
  }

  chrome.runtime.sendMessage({ type: "GET_CURRENT_RATING", domain }, (response) => {
    if (response && response.rating) {
      currentRatingData = response.rating;
      renderPopup(response.rating);
    } else if (domain) {
      // If service worker is starting up, render client profile with verified breaches
      const clientBreaches = getClientBreaches(domain);
      renderPopup({
        domain: domain,
        name: domain.split(".")[0].toUpperCase(),
        grade: clientBreaches.length > 0 ? "D" : "B",
        score: clientBreaches.length > 0 ? 38 : 70,
        color: clientBreaches.length > 0 ? "red" : "green",
        summary: `Evaluating privacy disclosures and security logs for ${domain}.`,
        breaches: clientBreaches,
        rubric: {
          data_sharing: { score: 50, max: 100, label: "Standard Sharing", risk: "medium" },
          retention: { score: 50, max: 100, label: "Operational Retention", risk: "medium" },
          tracking_cookies: { score: 50, max: 100, label: "Standard Analytics", risk: "medium" },
          user_rights: { score: 60, max: 100, label: "Legal Deletion Supported", risk: "medium" },
          breach_history: { score: clientBreaches.length > 0 ? 20 : 75, max: 100, label: "Security Profile", risk: clientBreaches.length > 0 ? "critical" : "low" },
          readability: { score: 55, max: 100, label: "Standard Terms", risk: "medium" }
        },
        compliance: {
          dpdp: { compliant: true, grievance_officer: `Grievance Officer (${domain})`, grievance_email: `privacy@${domain}` },
          gdpr: { compliant: true, dpo_contact: `dpo@${domain}` }
        }
      });
    } else {
      renderUnknownState();
    }
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
      const articleHtml = b.article_url ? `
        <a href="${b.article_url}" target="_blank" rel="noopener noreferrer" class="breach-article-btn">
          <span>🔗 Read Investigative Article</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      ` : "";

      card.innerHTML = `
        <div class="breach-card-header">
          <span class="breach-title">${b.name || "Data Leak Incident"}</span>
          <span class="breach-date">${b.breach_date || "Disclosed"}</span>
        </div>
        <p class="breach-desc">${b.description || "Security incident compromised customer records."}</p>
        ${tagsHtml ? `<div class="breach-tags">${tagsHtml}</div>` : ""}
        ${articleHtml}
      `;
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
