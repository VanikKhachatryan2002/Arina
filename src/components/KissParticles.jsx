import { useEffect, useRef } from "react";
import { kissPaths } from "../animations/kissPaths.js";

const palette = ["#ffc0d5", "#d9b7f3", "#b9d6ef", "#f6d49e", "#f0a9c0"];
export function KissParticles({ onComplete }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) { drawingRef.current.style.opacity = "1"; onComplete(); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points = [];
    drawingRef.current.querySelectorAll("path").forEach((path, pathIndex) => {
      const length = path.getTotalLength();
      for (let n = 0; n < length; n += 2.1) {
        const p = path.getPointAtLength(n);
        const i = points.length;
        points.push({ x: p.x, y: p.y, startX: (Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * 560,
          startY: (Math.sin(i * 311.7) * 19341.13 % 1 + 1) % 1 * 740,
          delay: ((i * 13) % 100) / 100 * 1.8, color: palette[(i + pathIndex) % palette.length], size: i % 13 === 0 ? 1.85 : 1.15,
        });
      }
    });
    let frame = 0, last = 0, elapsed = 0, complete = false, visible = true;
    let width = 560, height = 740;
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
      const scale = Math.min(width / 560, height / 740);
      const ox = (width - 560 * scale) / 2, oy = (height - 740 * scale) / 2;
      points.forEach((p, i) => {
        const progress = Math.max(0, Math.min(1, (t - 1.2 - p.delay) / 7.2));
        const eased = progress * progress * (3 - 2 * progress);
        const drift = (1 - eased) * Math.sin(t * .5 + i * .8) * 18;
        const x = ox + (p.startX + (p.x - p.startX) * eased + drift + pointer.x * eased * 3) * scale;
        const y = oy + (p.startY + (p.y - p.startY) * eased + Math.cos(t * .6 + i) * (1 - eased) * 14 + pointer.y * eased * 3) * scale;
        ctx.globalAlpha = (.55 + (Math.sin(t * 1.8 + i * 2.3) + 1) * .22) * (.28 + eased * .72);
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
    resize(); resume();
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", resume); reduced.removeEventListener("change", resume); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); };
  }, [onComplete]);
  return <div className="kiss-particles" role="img" aria-label="Розовые, золотые и лавандовые искры собираются в рисунок: мужчина нежно целует любимую в лоб">
    <svg ref={drawingRef} className="kiss-drawing" viewBox="0 0 560 740" fill="none" stroke="#f4bad5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kissPaths.map((path, i) => <path key={i} d={path} />)}</svg>
    <canvas ref={canvasRef} aria-hidden="true" />
  </div>;
}
