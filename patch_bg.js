const fs = require('fs');
let code = fs.readFileSync('extension/background/service_worker.js', 'utf8');

// 1. fetchSiteRatingRaw - update endpoints
code = code.replace(
  /const endpoints = \[\s*`http:\/\/localhost:8000\/api\/policy\/rating\?domain=\$\{encodeURIComponent\(cleanDom\)\}`,\s*`\$\{REMOTE_API_BASE\}\/api\/policy\/rating\?domain=\$\{encodeURIComponent\(cleanDom\)\}`\s*\];/,
  `const endpoints = [
    \`http://localhost:8756/api/policy/rating?domain=\${encodeURIComponent(cleanDom)}\`,
    \`http://localhost:8000/api/policy/rating?domain=\${encodeURIComponent(cleanDom)}\`,
    \`https://guardra-api.botvaibhav.dev/api/policy/rating?domain=\${encodeURIComponent(cleanDom)}\`
  ];`
);

// 2. update fetchSiteRating to record latency
code = code.replace(
  /async function fetchSiteRating\(domain\) \{\s*const rating = await fetchSiteRatingRaw\(domain\);\s*return await adjustRatingForCookies\(rating, domain\);\s*\}/,
  `async function fetchSiteRating(domain) {
  const start = Date.now();
  const rating = await fetchSiteRatingRaw(domain);
  const end = Date.now();
  if (rating) {
    rating.latency = end - start;
  }
  return await adjustRatingForCookies(rating, domain);
}`
);

// 3. add reportBrowserActivity
const reportFunc = `
async function reportBrowserActivity(tabUrl, domain, trackers) {
  const endpoints = [
    "http://localhost:8756/api/hub/telemetry",
    "http://localhost:8000/api/hub/telemetry",
    "https://guardra-api.botvaibhav.dev/api/hub/telemetry"
  ];
  
  const start = Date.now();
  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain,
          url: tabUrl,
          action_type: "Active Tab Scanned",
          details: \`Detected \${trackers ? trackers.length : 0} trackers on \${domain}\`,
          trackers_detected: trackers || [],
          auto_actions_taken: [],
          client_time: start
        })
      });
      const end = Date.now();
      const latency = end - start;
      if (resp.ok) {
        console.log(\`Telemetry sent to \${endpoint} with latency \${latency}ms\`);
        break;
      }
    } catch (e) {}
  }
}
`;

// Insert reportBrowserActivity before chrome.runtime.onMessage.addListener
code = code.replace(/chrome\.runtime\.onMessage\.addListener\(/, reportFunc + '\nchrome.runtime.onMessage.addListener(');

// 4. Update the BROWSER_ACTIVITY handler
code = code.replace(
  /if \(message\.type === "BROWSER_ACTIVITY"\) \{[\s\S]*?\}\);[\s\S]*?\}/,
  `if (message.type === "BROWSER_ACTIVITY") {
    const data = message.data;
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId && data.trackers_detected) {
      chrome.storage.local.get(\`tab_session_\${tabId}\`).then(res => {
        const session = res[\`tab_session_\${tabId}\`] || {};
        session.trackers_detected = data.trackers_detected;
        chrome.storage.local.set({ [\`tab_session_\${tabId}\`]: session });
      });
    }
    reportBrowserActivity(data.url, data.hostname, data.trackers_detected);
  }`
);

fs.writeFileSync('extension/background/service_worker.js', code);
