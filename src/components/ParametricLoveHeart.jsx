import { useCallback, useEffect, useRef, useState } from "react";

const TAU = Math.PI * 2;
const COLORS = ["#ff4d8d", "#ffcf70", "#8cf4ff", "#b995ff", "#72ffa8", "#ff836f"];

function heartPoint(angle, scale) {
  return {
    x: 16 * Math.sin(angle) ** 3 * scale,
    y: -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * scale,
  };
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

export function ParametricLoveHeart() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const [mode, setMode] = useState("words");
  const [replay, setReplay] = useState(0);

  const restart = useCallback((nextMode = mode) => {
    setMode(nextMode);
    setReplay((value) => value + 1);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return undefined;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    let width = 0;
    let height = 0;
    let ratio = 1;

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(280, bounds.width);
      height = Math.max(360, bounds.height);
      ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function background() {
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width / 2, height * 0.48, 0, width / 2, height * 0.48, width * 0.55);
      glow.addColorStop(0, "rgba(143, 42, 104, .28)");
      glow.addColorStop(0.48, "rgba(69, 19, 67, .12)");
      glow.addColorStop(1, "rgba(10, 5, 16, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }

    function drawWords(progress) {
      const centerX = width / 2;
      const centerY = height * 0.49;
      const unit = Math.min(width / 38, height / 35);
      const layers = 7;
      const points = 112;
      const total = layers * points;
      const visible = Math.floor(total * progress);
      context.textAlign = "center";
      context.textBaseline = "middle";

      for (let index = 0; index < visible; index += 1) {
        const layer = Math.floor(index / points);
        const pointIndex = index % points;
        const angle = pointIndex / points * TAU;
        const point = heartPoint(angle, unit * (0.63 + layer * 0.055));
        const alpha = 0.38 + layer / layers * 0.55;
        context.save();
        context.translate(centerX + point.x, centerY + point.y);
        context.rotate(angle + Math.PI / 2);
        context.font = `600 ${Math.max(7, unit * 0.72)}px Manrope, sans-serif`;
        context.fillStyle = `rgba(255, ${150 + layer * 10}, ${190 + layer * 6}, ${alpha})`;
        context.shadowColor = "rgba(255, 116, 174, .65)";
        context.shadowBlur = layer > 4 ? 7 : 3;
        context.fillText("I love you", 0, 0);
        context.restore();
      }

      if (progress > 0.78) {
        const fade = Math.min(1, (progress - 0.78) / 0.22);
        context.save();
        context.globalAlpha = fade;
        context.textAlign = "center";
        context.fillStyle = "#fff4f7";
        context.shadowColor = "#ff75ad";
        context.shadowBlur = 18;
        context.font = `italic 600 ${Math.min(32, width * 0.055)}px Cormorant Garamond, serif`;
        context.fillText("I love you, Arina", centerX, centerY + unit * 1.2);
        context.restore();
      }
    }

    function drawRays(progress, time) {
      const centerX = width / 2;
      const centerY = height * 0.5;
      const unit = Math.min(width / 39, height / 36);
      const points = 150;
      const visible = Math.floor(points * progress);

      for (let index = 0; index < visible; index += 1) {
        const angle = index / points * TAU;
        const outer = heartPoint(angle, unit * 0.84);
        const inner = heartPoint(angle, unit * 0.08);
        const color = COLORS[index % COLORS.length];
        const gradient = context.createLinearGradient(centerX + inner.x, centerY + inner.y, centerX + outer.x, centerY + outer.y);
        gradient.addColorStop(0, "rgba(255,255,255,.1)");
        gradient.addColorStop(0.42, color + "66");
        gradient.addColorStop(1, color);
        context.strokeStyle = gradient;
        context.lineWidth = index % 5 === 0 ? 1.35 : 0.7;
        context.beginPath();
        context.moveTo(centerX + inner.x, centerY + inner.y);
        context.lineTo(centerX + outer.x, centerY + outer.y);
        context.stroke();

        context.save();
        context.translate(centerX + outer.x, centerY + outer.y);
        context.rotate(time * 0.0015 + angle);
        context.fillStyle = color;
        context.shadowColor = color;
        context.shadowBlur = 12;
        context.font = `${index % 4 === 0 ? 14 : 9}px serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(index % 4 === 0 ? "✦" : "·", 0, 0);
        context.restore();
      }

      const pulse = 1 + Math.sin(time * 0.004) * 0.05;
      context.save();
      context.translate(centerX, centerY + unit * 1.4);
      context.scale(pulse, pulse);
      context.fillStyle = "rgba(255, 246, 249, .96)";
      context.shadowColor = "#ff5da2";
      context.shadowBlur = 22;
      roundedRect(context, -42, -13, 84, 26, 13);
      context.fillStyle = "#6f214f";
      context.shadowBlur = 0;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "600 11px Manrope, sans-serif";
      context.fillText("V  ♥  A", 0, 0);
      context.restore();
    }

    function render(time) {
      const duration = mode === "words" ? 4300 : 3200;
      const progress = reduceMotion ? 1 : Math.min(1, (time - startedAt) / duration);
      background();
      if (mode === "words") drawWords(progress);
      else drawRays(progress, time);
      if (progress < 1 || mode === "rays") frameRef.current = requestAnimationFrame(render);
    }

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frameRef.current = requestAnimationFrame(render);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [mode, replay]);

  return (
    <section className="coded-love" data-reveal aria-labelledby="codedLoveTitle">
      <div className="coded-love__copy">
        <p>Любовь в каждой точке</p>
        <h2 id="codedLoveTitle">Сердце, написанное для тебя</h2>
        <span>Математика может нарисовать форму сердца. Но только ты наполнила моё сердце настоящей жизнью.</span>
      </div>
      <div className="coded-love__stage">
        <canvas ref={canvasRef} aria-label={mode === "words" ? "Сердце из слов I love you" : "Сияющее разноцветное сердце"} />
        <div className="coded-love__controls" role="group" aria-label="Выбор анимации сердца">
          <button className={mode === "words" ? "active" : ""} onClick={() => restart("words")} aria-pressed={mode === "words"}>Слова любви</button>
          <button className={mode === "rays" ? "active" : ""} onClick={() => restart("rays")} aria-pressed={mode === "rays"}>Сияние сердца</button>
          <button className="replay" onClick={() => restart()} aria-label="Повторить анимацию">↻</button>
        </div>
      </div>
    </section>
  );
}
