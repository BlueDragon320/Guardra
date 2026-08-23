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

code = code.replace(
  /async function fetchSiteRatingRaw\(domain\) \{/,
  `async function fetchSiteRatingRaw(domain) {
  const requestStart = Date.now();`
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

// 3. Add reportBrowserActivity
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
      if (resp.ok) {
        const latency = end - start;
        break;
      }
    } catch (e) {}
  }
}
`;

code = code.replace(/chrome\.runtime\.onMessage\.addListener\(/, reportFunc + '\nchrome.runtime.onMessage.addListener(');

// 4. Safely replace the BROWSER_ACTIVITY logic
// Old logic ends with:
//         }).catch(() => {});
//       }
//     });
//   }
// });

const newBrowserActivity = `  // Telemetry sync if remote API configured
  if (message.type === "BROWSER_ACTIVITY") {
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
  }
});`;

const targetToReplace = `  // Telemetry sync if remote API configured
  if (message.type === "BROWSER_ACTIVITY") {
    const data = message.data;
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId && data.trackers_detected) {
      chrome.storage.local.get(\`tab_session_\${tabId}\`).then(res => {
        const session = res[\`tab_session_\${tabId}\`] || {};
        session.trackers_detected = data.trackers_detected;
        chrome.storage.local.set({ [\`tab_session_\${tabId}\`]: session });
      });
    }
    getApiBase().then((apiBase) => {
      if (apiBase && apiBase.startsWith("http")) {
        fetch(\`\${apiBase}/api/hub/telemetry/active-session\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: data.hostname,
            url: data.url,
            action_type: data.auto_actions && data.auto_actions.length > 0 ? "Automated Privacy Actions" : "Active Tab Scanned",
            details: data.auto_actions && data.auto_actions.length > 0 ? data.auto_actions.join("; ") : \`Detected \${data.tracker_count} trackers on \${data.hostname}\`,
            trackers_detected: data.trackers_detected || [],
            auto_actions_taken: data.auto_actions || []
          })
        }).catch(() => {});
      }
    });
  }
});`;

code = code.replace(targetToReplace, newBrowserActivity);

fs.writeFileSync('extension/background/service_worker.js', code);
