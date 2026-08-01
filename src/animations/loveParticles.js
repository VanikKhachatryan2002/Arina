const COLORS = {
  heart: ["#ff4d6d", "#ff8fab", "#ffb3c1", "#f783ac"],
  petal: ["#e11d48", "#fb7185", "#fda4af", "#fecdd3", "#ffffff"],
};

const random = (min, max) => min + Math.random() * (max - min);
const sample = (values) => values[Math.floor(Math.random() * values.length)];

export function setupLoveParticles() {
  const canvas = document.getElementById("fx");
  const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
  if (!canvas || !context) return () => {};

  const controller = new AbortController();
  const options = { passive: true, signal: controller.signal };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const lite = Boolean(window.__LITE__) || reducedMotion.matches;
  const state = {
    width: 0,
    height: 0,
    ratio: 1,
    particles: [],
    mode: null,
    paws: false,
    frame: 0,
    previousTime: 0,
    lastPaw: 0,
    burstUntil: 0,
  };

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(state.width * state.ratio);
    canvas.height = Math.round(state.height * state.ratio);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
  }

  function capacity(type) {
    const base = state.width < 520 ? 70 : 110;
    const adjusted = lite ? Math.round(base * 0.55) : base;
    return type === "petal" ? Math.round(adjusted * 0.9) : adjusted;
  }

  function falling(type) {
    const isHeart = type === "heart";
    return {
      type,
      x: random(0, state.width),
      y: random(-50, -10),
      size: random(10, isHeart ? 18 : 22),
      velocityY: random(isHeart ? 36 : 30, isHeart ? 78 : 66),
      velocityX: random(isHeart ? -30 : -21, isHeart ? 30 : 21),
      rotation: random(0, Math.PI),
      rotationSpeed: random(-0.5, 0.7),
      color: sample(COLORS[type]),
    };
  }

  function paw(x, y) {
    return { type: "paw", x, y, size: random(0.7, 1.1), age: 0, opacity: 1 };
  }

  function drawHeart(item) {
    context.save();
    context.translate(item.x, item.y);
    context.rotate(item.rotation);
    context.scale(item.size / 20, item.size / 20);
    context.fillStyle = item.color;
    context.beginPath();
    context.moveTo(0, 6);
    context.bezierCurveTo(0, 3, -6, 0, -10, 0);
    context.bezierCurveTo(-18, 0, -18, 10, -18, 10);
    context.bezierCurveTo(-18, 18, -8, 23, 0, 28);
    context.bezierCurveTo(8, 23, 18, 18, 18, 10);
    context.bezierCurveTo(18, 10, 18, 0, 10, 0);
    context.bezierCurveTo(6, 0, 0, 3, 0, 6);
    context.fill();
    context.restore();
  }

  function drawPetal(item) {
    context.save();
    context.translate(item.x, item.y);
    context.rotate(item.rotation);
    context.scale(item.size / 20, item.size / 20);
    context.fillStyle = item.color;
    context.beginPath();
    context.moveTo(0, -12);
    context.bezierCurveTo(10, -12, 12, 0, 0, 14);
    context.bezierCurveTo(-12, 0, -10, -12, 0, -12);
    context.fill();
    context.restore();
  }

  function drawPaw(item) {
    context.save();
    context.translate(item.x, item.y);
    context.scale(12 * item.size, 12 * item.size);
    context.globalAlpha = item.opacity;
    context.fillStyle = "rgba(51,51,51,.85)";
    context.beginPath();
    context.arc(0, 0, 1.2, 0, Math.PI * 2);
    context.fill();
    for (const [x, y] of [[-1.2, -1.2], [0, -1.6], [1.2, -1.2], [-0.2, -0.2]]) {
      context.beginPath();
      context.arc(x, y, 0.5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  function animate(time) {
    const elapsed = Math.min((time - state.previousTime) / 1000 || 0, 0.034);
    state.previousTime = time;
    context.clearRect(0, 0, state.width, state.height);
    const activeMode = time < state.burstUntil ? "heart" : state.mode;
    if (activeMode) {
      let count = 0;
      for (const item of state.particles) if (item.type === activeMode) count += 1;
      const target = capacity(activeMode);
      const additions = Math.min(target - count, lite ? 1 : 2);
      for (let index = 0; index < additions; index += 1) state.particles.push(falling(activeMode));
    }

    state.particles = state.particles.filter((item) => {
      if (item.type === "paw") {
        item.age += elapsed;
        item.opacity = Math.max(0, 1 - item.age / 2.7);
        if (item.opacity <= 0.02) return false;
        drawPaw(item);
        return true;
      }
      item.x += item.velocityX * elapsed;
      item.y += item.velocityY * elapsed;
      item.rotation += item.rotationSpeed * elapsed;
      if (item.y >= state.height + 60) return false;
      item.type === "heart" ? drawHeart(item) : drawPetal(item);
      return true;
    });

    if (state.mode || state.paws || state.particles.length || time < state.burstUntil) {
      state.frame = requestAnimationFrame(animate);
    } else {
      state.frame = 0;
      context.clearRect(0, 0, state.width, state.height);
    }
  }

  function start() {
    if (!state.frame && !document.hidden) {
      state.previousTime = performance.now();
      state.frame = requestAnimationFrame(animate);
    }
  }

  function setMode(nextMode) {
    state.mode = state.mode === nextMode ? null : nextMode;
    state.particles = state.particles.filter((item) => item.type === "paw" || item.type === state.mode);
    document.getElementById("hearts")?.setAttribute("aria-pressed", String(state.mode === "heart"));
    document.getElementById("petals")?.setAttribute("aria-pressed", String(state.mode === "petal"));
    start();
  }

  function burst(duration = 2500) {
    state.burstUntil = performance.now() + duration;
    start();
  }

  resize();
  document.getElementById("hearts")?.addEventListener("click", () => setMode("heart"), options);
  document.getElementById("petals")?.addEventListener("click", () => setMode("petal"), options);
  document.getElementById("paws")?.addEventListener("click", () => {
    state.paws = !state.paws;
    document.getElementById("paws")?.setAttribute("aria-pressed", String(state.paws));
    start();
  }, options);
  addEventListener("resize", resize, options);
  addEventListener("pointermove", (event) => {
    if (!state.paws || performance.now() - state.lastPaw < (lite ? 90 : 50)) return;
    state.particles.push(paw(event.clientX, event.clientY));
    state.lastPaw = performance.now();
    start();
  }, options);
  addEventListener("pointerdown", (event) => {
    if (!state.paws) return;
    for (let index = 0; index < 3; index += 1) {
      state.particles.push(paw(event.clientX + random(-14, 14), event.clientY + random(-14, 14)));
    }
    start();
  }, options);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.frame) {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
    } else start();
  }, { signal: controller.signal });

  window.__loveParticles = { burst };
  return () => {
    controller.abort();
    cancelAnimationFrame(state.frame);
    context.clearRect(0, 0, state.width, state.height);
    delete window.__loveParticles;
  };
}
