import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/new-album.css";
import NewAlbumPage from "../pages/NewAlbumPage.jsx";

function Entry() {
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    window.__LOCATION_ENDPOINT = "https://arina.vanikkhachatryan2002.workers.dev";
    import("../../geo-track.js").catch((reason) => {
      console.warn("Visitor email notification could not be sent", reason);
    });
    fetch(new URL("./album-data.json", document.baseURI), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(setAlbum)
      .catch((reason) => {
        if (reason.name !== "AbortError") setError("Не удалось загрузить историю. Попробуйте обновить страницу.");
      });
    return () => controller.abort();
  }, []);

  if (error) return <main className="na-status"><p>{error}</p></main>;
  if (!album) return <main className="na-status"><span className="na-loader" /><p>Собираем воспоминания…</p></main>;
  return <NewAlbumPage album={album} />;
}

createRoot(document.getElementById("root")).render(<Entry />);
