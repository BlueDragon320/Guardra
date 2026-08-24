/**
 * Guardra - YouTube Defuser Engine (uBlock Origin Architecture)
 * Executes in world: "MAIN" at document_start to prune all ad placements,
 * player ads, and ad slots from YouTube's internal APIs before player initialization.
 */
(function () {
  'use strict';
  if (window.__guardra_yt_defuser_injected) return;
  window.__guardra_yt_defuser_injected = true;

  // 1. Recursive ad-sanitization helper
  function sanitizePlayerResponse(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    // Prune direct ad keys
    if (obj.adPlacements) delete obj.adPlacements;
    if (obj.playerAds) delete obj.playerAds;
    if (obj.adSlots) delete obj.adSlots;
    if (obj.adPlacementRenderer) delete obj.adPlacementRenderer;
    if (obj.adBreakHeartbeatParams) delete obj.adBreakHeartbeatParams;
    if (obj.playerConfig && obj.playerConfig.adPlacements) delete obj.playerConfig.adPlacements;

    // Sanitize nested structures
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        sanitizePlayerResponse(obj[i]);
      }
    } else {
      if (obj.playerResponse) {
        sanitizePlayerResponse(obj.playerResponse);
      }
      // Sanitize playback tracking URLs
      if (obj.playbackTracking) {
        const tracking = obj.playbackTracking;
        if (tracking.videostatsPlaybackUrl) delete tracking.videostatsPlaybackUrl.baseUrl;
        if (tracking.videostatsDelayplayUrl) delete tracking.videostatsDelayplayUrl.baseUrl;
        if (tracking.videostatsWatchtimeUrl) delete tracking.videostatsWatchtimeUrl.baseUrl;
        if (tracking.ptrackingUrl) delete tracking.ptrackingUrl.baseUrl;
        if (tracking.qoeUrl) delete tracking.qoeUrl.baseUrl;
        if (tracking.atrUrl) delete tracking.atrUrl.baseUrl;
      }
    }
    return obj;
  }

  // 2. Trap inline window.ytInitialPlayerResponse
  let _initialPlayerResponse = window.ytInitialPlayerResponse;
  if (_initialPlayerResponse) {
    sanitizePlayerResponse(_initialPlayerResponse);
  }

  try {
    Object.defineProperty(window, 'ytInitialPlayerResponse', {
      configurable: true,
      enumerable: true,
      get() {
        return _initialPlayerResponse;
      },
      set(val) {
        _initialPlayerResponse = sanitizePlayerResponse(val);
      }
    });
  } catch (e) {}

  // 3. Trap inline window.ytInitialData
  let _initialData = window.ytInitialData;
  if (_initialData) {
    sanitizePlayerResponse(_initialData);
  }

  try {
    Object.defineProperty(window, 'ytInitialData', {
      configurable: true,
      enumerable: true,
      get() {
        return _initialData;
      },
      set(val) {
        _initialData = sanitizePlayerResponse(val);
      }
    });
  } catch (e) {}

  // 4. Intercept Fetch API (/youtubei/v1/player and /youtubei/v1/next)
  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');

    const response = await origFetch.apply(this, args);

    if (url && (url.includes('/youtubei/v1/player') || url.includes('/youtubei/v1/next') || url.includes('/youtubei/v1/browse'))) {
      try {
        const originalClone = response.clone();
        const json = await originalClone.json();
        const cleanedJson = sanitizePlayerResponse(json);

        return new Response(JSON.stringify(cleanedJson), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (e) {
        return response;
      }
    }

    return response;
  };

  // 5. Intercept XMLHttpRequest for fallback InnerTube calls
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._url = typeof url === 'string' ? url : '';
    return origOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (this._url && (this._url.includes('/youtubei/v1/player') || this._url.includes('/youtubei/v1/next'))) {
      this.addEventListener('readystatechange', function () {
        if (this.readyState === 4 && this.status === 200) {
          try {
            const data = JSON.parse(this.responseText);
            const cleaned = sanitizePlayerResponse(data);
            Object.defineProperty(this, 'responseText', { value: JSON.stringify(cleaned), configurable: true });
            Object.defineProperty(this, 'response', { value: JSON.stringify(cleaned), configurable: true });
          } catch (e) {}
        }
      });
    }
    return origSend.apply(this, args);
  };

  // 6. Intercept JSON.parse
  const origJSONParse = JSON.parse;
  JSON.parse = function (...args) {
    const result = origJSONParse.apply(this, args);
    if (result && typeof result === 'object' && typeof args[0] === 'string') {
      if (args[0].includes('adPlacements') || args[0].includes('playerAds') || args[0].includes('adSlots')) {
        sanitizePlayerResponse(result);
      }
    }
    return result;
  };

  // 7. Neutralize Anti-Adblock Artificial Delays (Short-circuit setTimeout)
  const origSetTimeout = window.setTimeout;
  window.setTimeout = function (fn, delay, ...args) {
    if (delay === 5000 && typeof fn === 'function' && fn.toString().includes('ad')) {
      delay = 0;
    }
    return origSetTimeout.apply(this, [fn, delay, ...args]);
  };
})();
