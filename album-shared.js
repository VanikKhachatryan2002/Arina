/* Shared helpers for album/book pages. Keep behavior stable. */
(function(){
  const dateCache = new Map();
  let fallbackDataPromise = null;

  function formatDateRU(iso){
    if(!iso) return "";
    if(dateCache.has(iso)) return dateCache.get(iso);
    try{
      const d = new Date(iso + "T12:00:00");
      const s = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
      dateCache.set(iso, s);
      return s;
    }catch{
      return iso;
    }
  }

  function loadScript(src){
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Could not load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function ensureFileFallbackData(){
    if(window.__ALBUM_DATA__) return window.__ALBUM_DATA__;
    if(!fallbackDataPromise){
      fallbackDataPromise = loadScript("album-data.js").then(() => window.__ALBUM_DATA__);
    }
    return await fallbackDataPromise;
  }

  async function loadAlbumData(){
    const inline = document.getElementById("albumData");
    if(inline){
      const txt = inline.textContent.trim();
      if(txt && txt.startsWith("{")){
        try{
          return JSON.parse(txt);
        }catch{}
      }
    }
    if(location.protocol === "http:" || location.protocol === "https:"){
      const res = await fetch(new URL("./album-data.json", document.baseURI).toString(), { cache: "no-store" });
      if(!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    }
    const fallbackData = await ensureFileFallbackData();
    if(fallbackData) return fallbackData;
    throw new Error("No album data available. On file://, include album-data.js or inline JSON.");
  }

  window.__albumShared = { formatDateRU, loadAlbumData };
})();
