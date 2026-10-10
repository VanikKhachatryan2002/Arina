import { useEffect, useRef } from "react";
import portraitUrl from "../../assets/kiss-portrait-contours.png";

const palette = ["#ffc0d5", "#d9b7f3", "#b9d6ef", "#f6d49e", "#f0a9c0"];
const ART_WIDTH = 560;
const ART_HEIGHT = 740;

export function KissParticles({ onComplete }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    const canvas = canvasRef.current;
    const image = drawingRef.current;
    const ctx = canvas.getContext("2d");
    async function setup() {
      try { await image.decode(); }
      catch {
        if (!cancelled) { image.style.opacity = "1"; onComplete(); }
        return;
      }
      if (cancelled) return;
      if (!ctx) { image.style.opacity = "1"; onComplete(); return; }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      // Sample the actual illustration, so facial geometry stays faithful to the artwork.
      const mask = document.createElement("canvas");
      mask.width = ART_WIDTH; mask.height = ART_HEIGHT;
      const maskCtx = mask.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) { image.style.opacity = "1"; onComplete(); return; }
      const artScale = Math.min(ART_WIDTH / image.naturalWidth, ART_HEIGHT / image.naturalHeight);
      const artW = image.naturalWidth * artScale, artH = image.naturalHeight * artScale;
      maskCtx.drawImage(image, (ART_WIDTH - artW) / 2, (ART_HEIGHT - artH) / 2, artW, artH);
      const pixels = maskCtx.getImageData(0, 0, ART_WIDTH, ART_HEIGHT).data;
      const candidates = [];
      // Take the brightest pixel in each small cell; preserve thin eyelids and lip edges.
      for (let y = 0; y < ART_HEIGHT - 1; y += 2) {
        for (let x = 0; x < ART_WIDTH - 1; x += 2) {
          let best = 0, px = x, py = y;
          for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
            const offset = ((y + dy) * ART_WIDTH + x + dx) * 4;
            const luminance = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
            if (pixels[offset + 3] > 128 && luminance > best) { best = luminance; px = x + dx; py = y + dy; }
          }
          if (best > 105) candidates.push({ x: px, y: py });
        }
      }
      // Preserve all facial samples; thin the larger clothing/hair areas first.
      const isFace = p => p.x >= 260 && p.x <= 395 && p.y >= 255 && p.y <= 435;
      const face = candidates.filter(isFace);
      const rest = candidates.filter(p => !isFace(p));
      const remainder = Math.min(rest.length, Math.max(0, 6500 - face.length));
      const selected = face.concat(Array.from({ length: remainder }, (_, i) => rest[Math.floor(i * rest.length / remainder)]));
      const points = selected.map((p, i) => {
        return { ...p, startX: (Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * ART_WIDTH,
          startY: (Math.sin(i * 311.7) * 19341.13 % 1 + 1) % 1 * ART_HEIGHT,
          delay: ((i * 13) % 100) / 100 * 1.8, color: palette[i % palette.length], size: i % 17 === 0 ? 1.45 : .95 };
      });
      canvas.dataset.particleCount = String(points.length);
      let frame = 0, last = 0, elapsed = 0, complete = false, visible = true;
      let width = ART_WIDTH, height = ART_HEIGHT;
      const pointer = { x: 0, y: 0 };
      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = rect.width; height = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      function draw(timestamp) {
        if (reduced.matches && !complete) { complete = true; onComplete(); }
        if (document.hidden || !visible) { last = 0; return; }
        if (last) elapsed += Math.min((timestamp - last) / 1000, .08);
        last = timestamp;
        const t = reduced.matches ? 14 : elapsed;
        ctx.clearRect(0, 0, width, height);
        const scale = Math.min(width / ART_WIDTH, height / ART_HEIGHT);
        const ox = (width - ART_WIDTH * scale) / 2, oy = (height - ART_HEIGHT * scale) / 2;
        points.forEach((p, i) => {
          const progress = Math.max(0, Math.min(1, (t - 1.2 - p.delay) / 7.2));
          const eased = progress * progress * (3 - 2 * progress);
          const drift = (1 - eased) * Math.sin(t * .5 + i * .8) * 18;
          const x = ox + (p.startX + (p.x - p.startX) * eased + drift + pointer.x * eased * 3) * scale;
          const y = oy + (p.startY + (p.y - p.startY) * eased + Math.cos(t * .6 + i) * (1 - eased) * 14 + pointer.y * eased * 3) * scale;
          ctx.globalAlpha = (.65 + (Math.sin(t * 1.8 + i * 2.3) + 1) * .17) * (.28 + eased * .72);
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(x, y, p.size * scale, 0, Math.PI * 2); ctx.fill();
          if (i % 89 === 0 && Math.sin(t * 2 + i) > .96) {
            ctx.globalAlpha = .8; ctx.fillRect(x - 3 * scale, y, 6 * scale, .6 * scale); ctx.fillRect(x, y - 3 * scale, .6 * scale, 6 * scale);
          }
        });
        ctx.globalAlpha = 1;
        if (t >= 10.5 && !complete) { complete = true; onComplete(); }
        if (!reduced.matches) frame = requestAnimationFrame(draw);
      }
      function resume() { cancelAnimationFrame(frame); last = 0; draw(performance.now()); }
      function move(event) { const r = canvas.getBoundingClientRect(); pointer.x = (event.clientX - r.left) / r.width - .5; pointer.y = (event.clientY - r.top) / r.height - .5; }
      function leave() { pointer.x = 0; pointer.y = 0; }
      const resizeObserver = new ResizeObserver(() => { resize(); resume(); });
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resume(); else { cancelAnimationFrame(frame); last = 0; } });
      resizeObserver.observe(canvas); intersection.observe(canvas);
      document.addEventListener("visibilitychange", resume); reduced.addEventListener("change", resume);
      canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
      dispose = () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", resume); reduced.removeEventListener("change", resume); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); };
      resize(); resume();
    }
    setup();
    return () => { cancelled = true; dispose(); };
  }, [onComplete]);
  return <div className="kiss-particles" role="img" aria-label="Розовые, золотые и лавандовые искры собираются в портрет: мужчина нежно целует любимую в лоб">
    <img ref={drawingRef} className="kiss-drawing" src={portraitUrl} alt="" aria-hidden="true" style={{ maskImage: `url("${portraitUrl}")`, maskMode: "luminance", maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat" }} />
    <canvas ref={canvasRef} aria-hidden="true" />
  </div>;
}
