const API_BASE = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:8000/api"
  : "https://guardra-api.botvaibhav.dev/api";


async function fetchWithFallback(endpoint, options = {}) {
  const localUrl = `http://localhost:8000/api${endpoint}`;
  const prodUrl = `https://guardra-api.botvaibhav.dev/api${endpoint}`;
  
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const localRes = await fetch(localUrl, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (localRes.ok) return await localRes.json();
  } catch (err) {
    // Ignore and fallback
  }

  try {
    const prodRes = await fetch(prodUrl, options);
    if (prodRes.ok) return await prodRes.json();
  } catch (err) {
    // Ignore and fallback to offline
  }

  return getOfflineFallback(endpoint);
}

function getOfflineFallback(endpoint) {
  if (endpoint.startsWith("/admin/stats")) {
    return {
      total_websites: 15,
      avg_score: 58.9,
      grade_distribution: { "A": 2, "B": 4, "C": 5, "D": 3, "F": 1 },
      top_10: [
        { domain: "example.com", overall_score: 95 },
        { domain: "test.com", overall_score: 88 }
      ]
    };
  }
  if (endpoint.startsWith("/admin/websites") && !endpoint.includes("/cookies") && !endpoint.includes("/rescan") && !endpoint.split("?")[0].endswith("/admin/websites")) {
    const parts = endpoint.split("?")[0].split("/");
    if (parts.length > 3) {
      const domain = parts[3];
      return {
        id: 1,
        domain: decodeURIComponent(domain),
        overall_score: 65,
        grade: "C",
        category: "Technology",
        source: "manual",
        last_scanned: new Date().toISOString(),
        pillar_scores: {
          cookies: 60,
          tracking: 70,
          transparency: 55,
          user_rights: 80,
          security: 65,
          data_sharing: 60
        },
        compliance_status: { gdpr: true, ccpa: false },
        cookies_found: 12
      };
    }
  }
  if (endpoint.startsWith("/admin/websites") && !endpoint.includes("/cookies") && !endpoint.includes("/rescan")) {
    const items = Array(15).fill(0).map((_, i) => ({
      id: i + 1,
      domain: `site${i + 1}.com`,
      overall_score: Math.floor(Math.random() * 100),
      grade: "C",
      category: "Misc",
      source: "top_5000"
    }));
    return {
      items,
      total: 15,
      page: 1,
      page_size: 50,
      pages: 1
    };
  }
  if (endpoint.startsWith("/admin/cookie-rules")) {
    return [
      { id: 1, name: "Analytics", pattern: "_ga", category: "analytics", auto_block: true },
      { id: 2, name: "Marketing", pattern: "fbp", category: "marketing", auto_block: true },
      { id: 3, name: "Session", pattern: "session_id", category: "necessary", auto_block: false },
      { id: 4, name: "Tracking", pattern: "track", category: "marketing", auto_block: true },
      { id: 5, name: "Preferences", pattern: "pref", category: "preferences", auto_block: false },
      { id: 6, name: "Ads", pattern: "ads", category: "marketing", auto_block: true },
      { id: 7, name: "Security", pattern: "sec", category: "necessary", auto_block: false },
      { id: 8, name: "Social", pattern: "tw", category: "marketing", auto_block: true }
    ];
  }
  if (endpoint.startsWith("/admin/top-5000/status")) {
    return {
      status: "idle",
      progress: 0,
      message: "Ready to start Top 5000 scan. Press refresh."
    };
  }
  if (endpoint.startsWith("/admin/audit-log")) {
    return {
      items: [
        { id: 1, action: "scan_started", admin: "system", timestamp: new Date().toISOString() },
        { id: 2, action: "rule_added", admin: "admin", timestamp: new Date().toISOString() }
      ],
      total: 2,
      page: 1,
      page_size: 50,
      pages: 1
    };
  }
  
  return null;
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  return res.json();
}

export function triggerExtensionDownload(redirectUrl = "https://google.com") {
  const link = document.createElement("a");
  link.href = "http://localhost:8000/api/extension/download";
  link.download = "guardra-extension.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (redirectUrl) {
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  }
}

export async function getLiveBrowserFeed() {
  const res = await fetch(`${API_BASE}/hub/telemetry/live-feed`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) return [];
  return res.json();
}

export async function getSiteRating(domain) {
  const res = await fetch(`${API_BASE}/policy/rating?domain=${encodeURIComponent(domain)}`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch policy rating"); return null; }
  return res.json();
}

export async function analyzeUrl(url) {
  const res = await fetch(`${API_BASE}/policy/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to analyze URL"); return null; }
  return res.json();
}

export async function getCachedPolicies() {
  const res = await fetch(`${API_BASE}/policy/cached`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch cached policies"); return null; }
  return res.json();
}

export async function generateNotice(data) {
  const res = await fetch(`${API_BASE}/deletion/generate-notice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to generate notice"); return null; }
  return res.json();
}

export async function downloadPdfNotice(data) {
  const res = await fetch(`${API_BASE}/deletion/generate-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to generate PDF"); return null; }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Guardra_Erasure_Notice_${data.site_domain || "Statutory"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function submitDeletionRequest(data) {
  const res = await fetch(`${API_BASE}/deletion/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to submit request"); return null; }
  return res.json();
}

export async function getDeletionRequests() {
  const res = await fetch(`${API_BASE}/deletion/requests`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch deletion requests"); return null; }
  return res.json();
}

export async function updateRequestStatus(id, status, notes = "") {
  const res = await fetch(`${API_BASE}/deletion/requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to update status"); return null; }
  return res.json();
}

export async function getBrokersDirectory() {
  const res = await fetch(`${API_BASE}/deletion/directory`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch brokers directory"); return null; }
  return res.json();
}

export async function getRegulators() {
  const res = await fetch(`${API_BASE}/deletion/regulators`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch regulators"); return null; }
  return res.json();
}

export async function checkPasswordPwned(password, sha1Prefix, sha1Suffix) {
  const res = await fetch(`${API_BASE}/breach/check-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: password || undefined,
      sha1_prefix: sha1Prefix || undefined,
      sha1_suffix: sha1Suffix || undefined
    })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to check password"); return null; }
  return res.json();
}

export async function checkEmailExposure(email) {
  const res = await fetch(`${API_BASE}/breach/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to check email exposure"); return null; }
  return res.json();
}

export async function getPrivacyPlatforms() {
  const res = await fetch(`${API_BASE}/hub/platforms`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch privacy hub platforms"); return null; }
  return res.json();
}

export async function getFootprintData() {
  const res = await fetch(`${API_BASE}/hub/footprint`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch footprint data"); return null; }
  return res.json();
}

export async function toggleFootprintAction(actionId) {
  const res = await fetch(`${API_BASE}/hub/footprint/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action_id: actionId })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to toggle action"); return null; }
  return res.json();
}

// ===== Admin & Cookie Management API =====

export async function getAdminStats() {
  return fetchWithFallback("/admin/stats");
}

export async function getAdminWebsites({ page = 1, pageSize = 50, sortBy = "overall_score", sortOrder = "desc", gradeFilter, categoryFilter, sourceFilter, search, top5000Only } = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
    sort_order: sortOrder
  });
  if (gradeFilter) params.append("grade_filter", gradeFilter);
  if (categoryFilter) params.append("category_filter", categoryFilter);
  if (sourceFilter) params.append("source_filter", sourceFilter);
  if (search) params.append("search", search);
  if (top5000Only) params.append("top_5000_only", "true");

  return fetchWithFallback(`/admin/websites?${params.toString()}`);
}

export async function getWebsiteDetail(domain) {
  return fetchWithFallback(`/admin/websites/${encodeURIComponent(domain)}`);
}

export async function addAdminWebsite(data) {
  const res = await fetch(`${API_BASE}/admin/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    { console.error(err.detail || "Failed to add website"); return null; }
  }
  return res.json();
}

export async function rescanWebsite(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/rescan`, {
    method: "POST"
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to rescan website"); return null; }
  return res.json();
}

export async function deleteAdminWebsite(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}`, {
    method: "DELETE"
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to delete website"); return null; }
  return res.json();
}

export async function getWebsiteCookies(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/cookies`).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to fetch website cookies"); return null; }
  return res.json();
}

export async function updateWebsiteCookies(domain, preferences) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/cookies`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences })
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to update website cookies"); return null; }
  return res.json();
}

export async function getGlobalCookieRules() {
  return fetchWithFallback("/admin/cookie-rules");
}

export async function createGlobalCookieRule(rule) {
  const res = await fetch(`${API_BASE}/admin/cookie-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to create global cookie rule"); return null; }
  return res.json();
}

export async function deleteGlobalCookieRule(ruleId) {
  const res = await fetch(`${API_BASE}/admin/cookie-rules/${ruleId}`, {
    method: "DELETE"
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) { console.error("Failed to delete global cookie rule"); return null; }
  return res.json();
}

export async function refreshTop5000() {
  const res = await fetch(`${API_BASE}/admin/top-5000/refresh`, {
    method: "POST"
  }).catch(() => ({ ok: false, json: async () => null, blob: async () => new Blob() }));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    { console.error(err.detail || "Failed to trigger top 5000 refresh"); return null; }
  }
  return res.json();
}

export async function getTop5000Status() {
  return fetchWithFallback("/admin/top-5000/status");
}

export async function getAdminAuditLog(page = 1, pageSize = 50) {
  return fetchWithFallback(`/admin/audit-log?page=${page}&page_size=${pageSize}`);
}

