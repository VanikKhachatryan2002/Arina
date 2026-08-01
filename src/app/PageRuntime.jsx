import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";

const pageModules = {
  index: () => import("../../main.js"),
  album: async () => {
    await import("../../album-shared.js");
    await import("../../album.js");
  },
  book: async () => {
    const { PageFlip } = await import("page-flip/dist/js/page-flip.module.js");
    window.PageFlip = PageFlip;
    await import("../../album-shared.js");
    await import("../../book.js");
  },
  april7: () => import("../../april7.js"),
  birthday: () => import("../../birthday.js"),
  may8: () => import("../../may8.js"),
  "new-year": () => import("../../new-year.js"),
  valentine: () => import("../../valentine.js"),
};

const trackedPages = new Set(["index", "album", "book", "birthday", "new-year"]);

function PageRuntime({ page, html, bodyClass = "", htmlClass = "" }) {
  const hostRef = useRef(null);
  const markup = useMemo(() => ({ __html: html }), [html]);

  useLayoutEffect(() => {
    document.body.className = bodyClass;
    document.documentElement.className = htmlClass;
    return () => {
      document.body.className = "";
      document.documentElement.className = "";
    };
  }, [bodyClass, htmlClass]);

  useEffect(() => {
    let active = true;
    let disposeAnimations = () => {};
    document.documentElement.dataset.appReady = "false";
    Promise.resolve(page === "index"
      ? Promise.all([
          import("../animations/loveParticles.js"),
          import("../animations/homeMotion.js"),
        ]).then(([{ setupLoveParticles }, { setupHomeMotion }]) => {
          const disposeParticles = setupLoveParticles();
          const disposeMotion = setupHomeMotion();
          const dispose = () => {
            disposeParticles();
            disposeMotion();
          };
          if (active) disposeAnimations = dispose;
          else dispose();
        })
      : undefined)
      .then(() => pageModules[page]?.())
      .then(async () => {
        if (trackedPages.has(page)) {
          window.__LOCATION_ENDPOINT = "https://arina.vanikkhachatryan2002.workers.dev";
          await import("../../geo-track.js");
        }
        if (active) document.documentElement.dataset.appReady = "true";
      })
      .catch((error) => console.error(`Failed to initialize ${page}`, error));
    return () => {
      active = false;
      disposeAnimations();
    };
  }, [page]);

  return <div ref={hostRef} dangerouslySetInnerHTML={markup} />;
}

export function mountPage(config) {
  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root application mount");
  document.documentElement.dataset.appReady = "false";
  createRoot(root).render(<PageRuntime {...config} />);
}
