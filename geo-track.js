// Capture user geolocation (with permission) and POST to the Worker endpoint.
// Configure the endpoint via window.__LOCATION_ENDPOINT = "https://<your-worker>.workers.dev";
(function () {
  const ENDPOINT = (typeof window !== "undefined" && window.__LOCATION_ENDPOINT) || "https://arina.vanikkhachatryan2002.workers.dev";
  const STORAGE_KEY = "geo-track-sent";

  
  if (!ENDPOINT) {
    console.warn("No endpoint configured for location tracking.");
    return;
  }

  const hasLocalStorage = (() => {
    try {
      const k = "__geo_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (_) {
      return false;
    }
  })();

  if (hasLocalStorage && localStorage.getItem(STORAGE_KEY)) {
    return; // already sent this session
  }

  if (!("geolocation" in navigator)) {
    console.warn("Geolocation not supported.");
    return;
  }

  const markSent = () => {
    if (hasLocalStorage) localStorage.setItem(STORAGE_KEY, "1");
  };

  const send = async (payload) => {
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      markSent();
    } catch (err) {
      console.warn("Failed to send location:", err);
    }
  };

  const onSuccess = (pos) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    send({
      lat,
      lng,
      accuracy,
      source: "geolocation",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  };

  const onError = (err) => {
    send({
      source: "geolocation-failed",
      error: err && (err.message || String(err)),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  };

  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 600000,
  });
})();
