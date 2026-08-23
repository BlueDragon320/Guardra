const API_BASE = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:8000/api"
  : "https://guardra-api.botvaibhav.dev/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
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
  const res = await fetch(`${API_BASE}/hub/telemetry/live-feed`);
  if (!res.ok) return [];
  return res.json();
}

export async function getSiteRating(domain) {
  const res = await fetch(`${API_BASE}/policy/rating?domain=${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error("Failed to fetch policy rating");
  return res.json();
}

export async function analyzeUrl(url) {
  const res = await fetch(`${API_BASE}/policy/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url })
  });
  if (!res.ok) throw new Error("Failed to analyze URL");
  return res.json();
}

export async function getCachedPolicies() {
  const res = await fetch(`${API_BASE}/policy/cached`);
  if (!res.ok) throw new Error("Failed to fetch cached policies");
  return res.json();
}

export async function generateNotice(data) {
  const res = await fetch(`${API_BASE}/deletion/generate-notice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to generate notice");
  return res.json();
}

export async function downloadPdfNotice(data) {
  const res = await fetch(`${API_BASE}/deletion/generate-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to generate PDF");
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
  });
  if (!res.ok) throw new Error("Failed to submit request");
  return res.json();
}

export async function getDeletionRequests() {
  const res = await fetch(`${API_BASE}/deletion/requests`);
  if (!res.ok) throw new Error("Failed to fetch deletion requests");
  return res.json();
}

export async function updateRequestStatus(id, status, notes = "") {
  const res = await fetch(`${API_BASE}/deletion/requests/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function getBrokersDirectory() {
  const res = await fetch(`${API_BASE}/deletion/directory`);
  if (!res.ok) throw new Error("Failed to fetch brokers directory");
  return res.json();
}

export async function getRegulators() {
  const res = await fetch(`${API_BASE}/deletion/regulators`);
  if (!res.ok) throw new Error("Failed to fetch regulators");
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
  });
  if (!res.ok) throw new Error("Failed to check password");
  return res.json();
}

export async function checkEmailExposure(email) {
  const res = await fetch(`${API_BASE}/breach/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Failed to check email exposure");
  return res.json();
}

export async function getPrivacyPlatforms() {
  const res = await fetch(`${API_BASE}/hub/platforms`);
  if (!res.ok) throw new Error("Failed to fetch privacy hub platforms");
  return res.json();
}

export async function getFootprintData() {
  const res = await fetch(`${API_BASE}/hub/footprint`);
  if (!res.ok) throw new Error("Failed to fetch footprint data");
  return res.json();
}

export async function toggleFootprintAction(actionId) {
  const res = await fetch(`${API_BASE}/hub/footprint/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action_id: actionId })
  });
  if (!res.ok) throw new Error("Failed to toggle action");
  return res.json();
}

// ===== Admin & Cookie Management API =====

export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
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

  const res = await fetch(`${API_BASE}/admin/websites?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch admin websites");
  return res.json();
}

export async function getWebsiteDetail(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}`);
  if (!res.ok) throw new Error("Failed to fetch website details");
  return res.json();
}

export async function addAdminWebsite(data) {
  const res = await fetch(`${API_BASE}/admin/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add website");
  }
  return res.json();
}

export async function rescanWebsite(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/rescan`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to rescan website");
  return res.json();
}

export async function deleteAdminWebsite(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete website");
  return res.json();
}

export async function getWebsiteCookies(domain) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/cookies`);
  if (!res.ok) throw new Error("Failed to fetch website cookies");
  return res.json();
}

export async function updateWebsiteCookies(domain, preferences) {
  const res = await fetch(`${API_BASE}/admin/websites/${encodeURIComponent(domain)}/cookies`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences })
  });
  if (!res.ok) throw new Error("Failed to update website cookies");
  return res.json();
}

export async function getGlobalCookieRules() {
  const res = await fetch(`${API_BASE}/admin/cookie-rules`);
  if (!res.ok) throw new Error("Failed to fetch global cookie rules");
  return res.json();
}

export async function createGlobalCookieRule(rule) {
  const res = await fetch(`${API_BASE}/admin/cookie-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rule)
  });
  if (!res.ok) throw new Error("Failed to create global cookie rule");
  return res.json();
}

export async function deleteGlobalCookieRule(ruleId) {
  const res = await fetch(`${API_BASE}/admin/cookie-rules/${ruleId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete global cookie rule");
  return res.json();
}

export async function refreshTop5000() {
  const res = await fetch(`${API_BASE}/admin/top-5000/refresh`, {
    method: "POST"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to trigger top 5000 refresh");
  }
  return res.json();
}

export async function getTop5000Status() {
  const res = await fetch(`${API_BASE}/admin/top-5000/status`);
  if (!res.ok) throw new Error("Failed to fetch top 5000 status");
  return res.json();
}

export async function getAdminAuditLog(page = 1, pageSize = 50) {
  const res = await fetch(`${API_BASE}/admin/audit-log?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error("Failed to fetch audit log");
  return res.json();
}

