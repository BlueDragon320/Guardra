let currentRatingData = null;
const DASHBOARD_URL = "http://localhost:5173";

document.addEventListener("DOMContentLoaded", async () => {
  loadActiveTabRating();

  // Button Listeners
  document.getElementById("btn-refresh").addEventListener("click", () => {
    loadActiveTabRating(true);
  });

  document.getElementById("btn-open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  document.getElementById("link-options").addEventListener("click", (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options/options.html"));
    }
  });

  document.getElementById("btn-toggle-details").addEventListener("click", () => {
    const details = document.getElementById("rubric-details");
    const btn = document.getElementById("btn-toggle-details");
    if (details.classList.contains("hidden")) {
      details.classList.remove("hidden");
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="18 15 12 9 6 15"/>
        </svg> Hide Rubric`;
    } else {
      details.classList.add("hidden");
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    chrome.tabs.create({ url: `${DASHBOARD_URL}/breach-monitor` });
  });

  document.getElementById("modal-legal-basis").addEventListener("change", updateModalNoticePreview);
  document.getElementById("modal-user-name").addEventListener("input", updateModalNoticePreview);
  document.getElementById("modal-user-email").addEventListener("input", updateModalNoticePreview);

  document.getElementById("btn-copy-notice").addEventListener("click", copyNoticeText);
  document.getElementById("btn-send-email").addEventListener("click", sendNoticeEmail);
});

async function loadActiveTabRating(forceRefresh = false) {
  chrome.runtime.sendMessage({ type: "GET_CURRENT_RATING" }, (response) => {
    if (response && response.rating) {
      currentRatingData = response.rating;
      renderPopup(response.rating);
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
  gradeBadge.className = `grade-badge ${data.color || "amber"}`;
  document.getElementById("grade-letter").textContent = data.grade || "C";
  document.getElementById("grade-score").textContent = `${data.score || 50}/100`;

  // Compliance Checks
  const dpdpBadge = document.getElementById("dpdp-badge");
  const dpdpText = document.getElementById("dpdp-text");
  if (data.compliance && data.compliance.dpdp) {
    if (data.compliance.dpdp.compliant) {
      dpdpBadge.className = "compliance-badge compliant";
      dpdpText.textContent = "DPDP Grievance Officer Disclosed";
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

function styleStat(elementId, risk) {
  const el = document.getElementById(elementId);
  if (risk === "low") el.style.color = "#10b981";
  else if (risk === "medium") el.style.color = "#f59e0b";
  else if (risk === "high" || risk === "critical") el.style.color = "#ef4444";
}

function renderUnknownState() {
  document.getElementById("site-name").textContent = "No Web Page Active";
  document.getElementById("site-domain").textContent = "Navigate to a website to see its privacy rating";
  document.getElementById("grade-letter").textContent = "-";
  document.getElementById("grade-score").textContent = "-";
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
