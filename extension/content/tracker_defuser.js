/**
 * Guardra - Tracker Defuser (MAIN World)
 * Injected declaratively via manifest.json (world: "MAIN")
 * Completely eliminates CSP inline-script violations.
 */
(() => {
  try {
    window['ga-disable-ALL'] = true;
    window.ga = function() {};
    window.gtag = function() {};
    window.fbq = function() {};
    window.ttq = { track: function() {}, page: function() {}, load: function() {} };
    window.hj = function() {};
    window._hjSettings = {};
    window.clarity = function() {};
    window.mixpanel = { track: function() {}, identify: function() {}, init: function() {} };
    window.amplitude = { logEvent: function() {}, init: function() {} };

    if (navigator && navigator.sendBeacon) {
      const originalSendBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function(url, data) {
        if (typeof url === 'string' && (
          url.includes('google-analytics.com') ||
          url.includes('googletagmanager.com') ||
          url.includes('facebook.com/tr/') ||
          url.includes('tiktok.com') ||
          url.includes('hotjar.com') ||
          url.includes('clarity.ms') ||
          url.includes('criteo.com') ||
          url.includes('outbrain.com') ||
          url.includes('taboola.com')
        )) {
          return true;
        }
        return originalSendBeacon.apply(this, arguments);
      };
    }
  } catch (e) {}
})();
