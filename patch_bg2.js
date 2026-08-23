const fs = require('fs');
let code = fs.readFileSync('extension/background/service_worker.js', 'utf8');

// Also update fetchSiteRatingRaw to track its own latency so it can send it!
// Oh wait, fetch is already happening.
code = code.replace(
  /async function fetchSiteRatingRaw\(domain\) \{/,
  `async function fetchSiteRatingRaw(domain) {
  const requestStart = Date.now();`
);

fs.writeFileSync('extension/background/service_worker.js', code);
