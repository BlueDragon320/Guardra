const fs = require('fs');
let code = fs.readFileSync('extension/content/content_script.js', 'utf8');

// Ensure sendTelemetry is called immediately
code = code.replace(
  /\/\/ 6\. Request rating and initialize on page/,
  `// Broadcast telemetry immediately
  sendTelemetry();
  
  // 6. Request rating and initialize on page`
);

fs.writeFileSync('extension/content/content_script.js', code);
