/* Elegant New Year page: snow + music */
(function(){
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite =
    prefersReduced ||
    (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 3) ||
    innerWidth <= 420;

  const musicBtn = document.getElementById("musicBtn");
  const snowBtn = document.getElementById("snowBtn");
  const fireworksBtn = document.getElementById("fireworksBtn");
  const fwCv = document.getElementById("fireworks");
  const fwCtx = fwCv?.getContext("2d", { alpha: true });

  const toast = document.getElementById("toast");
  const dateEl = document.getElementById("date");
  const audio = document.getElementById("bgm");
  const gate = document.getElementById("passwordGate");
  const passwordInput = document.getElementById("passwordInput");
  const passwordBtn = document.getElementById("passwordBtn");
  const passwordHint = document.getElementById("passwordHint");
  const TARGET_HASH = "96880e8f1efcf28f12d8a32f02b7823acba9103e5ee35e26f8ac53d8aa63f411";
  const OK_KEY = "new_year_ok";
  let resumeSnowOnUnlock = false;

  if (dateEl) {
    try {
      dateEl.textContent = new Date().toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" });
    } catch {
      dateEl.textContent = new Date().toString();
    }
  }


  async function sha256hex(s){
    const buf = new TextEncoder().encode(s);
    const dig = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(dig)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  function unlockGate(){
    if(!gate) return;
    gate.hidden = true;
    gate.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    resumeSnowOnUnlock = true;
    setTimeout(() => {
      if(resumeSnowOnUnlock && typeof snowOn !== "undefined" && snowOn && !raf && (!gate || gate.hidden)){
        resumeSnowOnUnlock = false;
        if(typeof startSnow === "function") startSnow();
      }
    }, 0);
  }

  async function checkPassword(){
    if(!gate || !passwordInput) return;
    const value = passwordInput.value.trim();
    if(!value){
      if(passwordHint) passwordHint.hidden = false;
      return;
    }
    try{
      const h = await sha256hex(value.toLocaleLowerCase("ru-RU"));
      if(h === TARGET_HASH){
        if(passwordHint) passwordHint.hidden = true;
        try{ sessionStorage.setItem(OK_KEY, "1"); }catch{}
        unlockGate();
      }else{
        if(passwordHint) passwordHint.hidden = false;
        passwordInput.select();
      }
    }catch{
      if(passwordHint) passwordHint.hidden = false;
    }
  }

  if(gate){
    let unlocked = false;
    try{
      if(sessionStorage.getItem(OK_KEY) === "1") unlocked = true;
    }catch{}
    if(unlocked){
      unlockGate();
    }else{
      document.body.classList.add("locked");
      gate.hidden = false;
      if(passwordInput) passwordInput.focus();
    }
  }

  passwordBtn?.addEventListener("click", checkPassword, { passive: true });
  passwordInput?.addEventListener("keydown", (e) => {
    if(e.key === "Enter") checkPassword();
  });
  passwordInput?.addEventListener("input", () => {
    if(passwordHint) passwordHint.hidden = true;
  }, { passive: true });

  function showToast(text){
    if(!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    toast.classList.remove("show");
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove("show");
    }, lite ? 1800 : 2300);
  }

  const MUSIC_VOL = lite ? 0.72 : 0.85;
  let autoMuted = false;

  function setMusicUI(on){
    if(!musicBtn) return;
    musicBtn.setAttribute("aria-pressed", on ? "true" : "false");
    musicBtn.textContent = on ? "Пауза" : "Музыка";
  }

  function fadeInVolume(to){
    if(!audio) return;
    const from = audio.volume || 0;
    const start = performance.now();
    const dur = lite ? 650 : 1100;
    function step(now){
      const t = Math.min(1, (now - start) / dur);
      const e = t * t * (3 - 2 * t); // smoothstep
      audio.volume = from + (to - from) * e;
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function startMusic({ silent = false, allowMutedTrick = true } = {}){
    if(!audio) return false;
    try{ audio.loop = true; }catch{}
    try{ audio.muted = false; }catch{}
    try{ audio.volume = MUSIC_VOL; }catch{}
    try{
      await audio.play();
      autoMuted = false;
      setMusicUI(true);
      return true;
    }catch(err){
      if(!allowMutedTrick){
        if(!silent) showToast('Нажми "Музыка", чтобы включить звук.');
        setMusicUI(false);
        return false;
      }
      // Some browsers allow autoplay only if muted. We start muted, then fade in.
      try{
        try{ audio.muted = true; }catch{}
        try{ audio.volume = 0; }catch{}
        await audio.play();
        autoMuted = true;
        try{ audio.muted = false; }catch{}
        fadeInVolume(MUSIC_VOL);
        setMusicUI(true);
        return true;
      }catch{
        if(!silent){
          const msg = (err && err.name === "NotAllowedError")
            ? 'Нажми "Музыка", чтобы включить звук.'
            : "Музыка не загрузилась. Проверь audio/new-year.mp3";
          showToast(msg);
        }
        setMusicUI(false);
        return false;
      }
    }
  }

  function stopMusic(){
    if(!audio) return;
    try{ audio.pause(); }catch{}
    autoMuted = false;
    setMusicUI(false);
  }

  async function toggleMusic(force, opts){
    if(!audio || !musicBtn) return;
    const isMuted = !!audio.muted || (audio.volume === 0);
    const wantOn = typeof force === "boolean" ? force : (audio.paused || isMuted);
    if(wantOn){
      if(!audio.paused){
        attemptUnmute();
      }else{
        await startMusic(opts);
      }
    }else{
      stopMusic();
    }
  }

  musicBtn?.addEventListener("click", () => { toggleMusic(); }, { passive: true });
  if(audio){
    audio.addEventListener("play", () => setMusicUI(true), { passive: true });
    audio.addEventListener("pause", () => setMusicUI(false), { passive: true });
  }
  setMusicUI(audio && !audio.paused);

  // Auto music on open (best-effort; browsers may block until first gesture).
  async function attemptUnmute(){
    if(!audio) return;
    try{ audio.muted = false; }catch{}
    try{ if(audio.volume < MUSIC_VOL) audio.volume = 0; }catch{}
    if(audio.paused){
      try{ await audio.play(); }catch{}
    }
    if(!audio.paused) fadeInVolume(MUSIC_VOL);
    autoMuted = false;
  }

  async function requestAutoMusic({ silent = true, allowMutedTrick = true } = {}){
    if(!audio || !audio.paused) return;
    await startMusic({ silent, allowMutedTrick });
  }

  // 1) try immediately, 2) retry after a short delay, 3) retry on first interaction.
  requestAutoMusic({ silent: true, allowMutedTrick: true });
  setTimeout(() => { requestAutoMusic({ silent: false, allowMutedTrick: true }); }, 520);
  addEventListener("pageshow", () => { requestAutoMusic({ silent: false, allowMutedTrick: true }); }, { passive: true, once: true });
  addEventListener("load", () => { requestAutoMusic({ silent: false, allowMutedTrick: true }); }, { passive: true, once: true });
  audio?.addEventListener("canplay", () => { requestAutoMusic({ silent: true, allowMutedTrick: true }); }, { passive: true, once: true });
  audio?.addEventListener("loadedmetadata", () => { requestAutoMusic({ silent: true, allowMutedTrick: true }); }, { passive: true, once: true });
  addEventListener("pointerdown", () => { attemptUnmute(); requestAutoMusic({ silent: true, allowMutedTrick: false }); }, { passive: true, once: true });
  addEventListener("keydown", () => { attemptUnmute(); requestAutoMusic({ silent: true, allowMutedTrick: false }); }, { passive: true, once: true });
  addEventListener("touchstart", () => { attemptUnmute(); requestAutoMusic({ silent: true, allowMutedTrick: false }); }, { passive: true, once: true });
  addEventListener("click", () => { attemptUnmute(); requestAutoMusic({ silent: true, allowMutedTrick: false }); }, { passive: true, once: true });

  /* -------- Snow (canvas) -------- */
  const cv = document.getElementById("fx");
  const ctx = cv?.getContext("2d", { alpha: true });
  let W = 0, H = 0, dpr = 1, raf = 0, last = 0;
  let snowOn = !prefersReduced;
  const flakes = [];
  let snowBankPx = 0;
  const snowBankMaxPx = lite ? 44 : 68;
  let snowBankNextCss = 0;
  let flakeTarget = 0;

  function rnd(a,b){ return a + Math.random() * (b - a); }

  const flakePath = typeof Path2D === "function" ? new Path2D() : null;
  if(flakePath){
    const endY = -1;
    const branchY = -0.58;
    const branchX = 0.22;
    const branchEndY = -0.78;
    for(let i=0;i<6;i++){
      const a = i * (Math.PI / 3);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const x2 = 0 * ca - endY * sa;
      const y2 = 0 * sa + endY * ca;
      flakePath.moveTo(0, 0);
      flakePath.lineTo(x2, y2);

      const bx = 0 * ca - branchY * sa;
      const by = 0 * sa + branchY * ca;
      const lx = (-branchX) * ca - branchEndY * sa;
      const ly = (-branchX) * sa + branchEndY * ca;
      const rx = branchX * ca - branchEndY * sa;
      const ry = branchX * sa + branchEndY * ca;
      flakePath.moveTo(bx, by);
      flakePath.lineTo(lx, ly);
      flakePath.moveTo(bx, by);
      flakePath.lineTo(rx, ry);
    }
  }

  function resize(){
    if(!cv || !ctx) return;
    const maxDpr = lite ? 1.25 : 1.5;
    dpr = Math.max(1, Math.min(maxDpr, devicePixelRatio || 1));
    W = innerWidth;
    H = innerHeight;
    const area = Math.max(1, W * H);
    const density = lite ? 19000 : 17500;
    const maxCount = lite ? 85 : 120;
    flakeTarget = Math.max(48, Math.min(maxCount, Math.round(area / density)));
    cv.width = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if(fwCv && fwCtx){
      fwCv.width = cv.width;
      fwCv.height = cv.height;
      fwCv.style.width = cv.style.width;
      fwCv.style.height = cv.style.height;
      fwCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function makeFlake(){
    const z = rnd(0.25, 1.0);
    const big = Math.random() < 0.16;
    const isFlake = z > 0.72 && Math.random() < (lite ? 0.22 : 0.42);
    const r = (big ? rnd(2.0, 4.4) : rnd(0.7, 2.8)) * (0.35 + z);
    return {
      x: rnd(0, W),
      y: rnd(-H, H),
      z,
      kind: isFlake ? "flake" : "dot",
      rot: rnd(0, Math.PI * 2),
      spin: rnd(-2.2, 2.2) * (0.12 + z),
      r,
      vy: rnd(18, 62) * (0.25 + z) * (big ? 0.88 : 1.0),
      vx: rnd(-14, 14) * (0.18 + z),
      wob: rnd(0.55, 1.85) * (0.35 + z),
      ph: rnd(0, Math.PI * 2),
      amp: rnd(0.25, 0.95) * (0.30 + z),
      a: rnd(0.18, 0.72) * (0.22 + 0.78 * z),
    };
  }

  function initSnow(){
    flakes.length = 0;
    if(!snowOn) return;
    const count = flakeTarget || (lite ? 80 : 145);
    for(let i=0;i<count;i++) flakes.push(makeFlake());
  }

  function draw(now){
    if(!ctx) return;
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;

    ctx.clearRect(0, 0, W, H);
    if(!snowOn){
      raf = 0;
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = lite ? "source-over" : "lighter";
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(255,255,255,0.35)";
    const wind = (Math.sin(now * 0.00012) + Math.sin(now * 0.00006) * 0.7) * (lite ? 10 : 16);
    const groundBase = Math.min(150, Math.max(105, H * 0.22));
    const groundLine = H - (groundBase + (snowBankPx * 0.55));
    for(const f of flakes){
      f.y += f.vy * dt;
      f.x += ((f.vx + wind * (0.25 + (f.z || 0))) * dt) + Math.sin(f.ph + now * 0.0012 * f.wob) * (f.amp || 0.35);
      if(f.kind === "flake") f.rot += f.spin * dt;

      if(f.y > groundLine){
        snowBankPx = Math.min(
          snowBankMaxPx,
          snowBankPx + (lite ? 0.060 : 0.048) * (0.35 + (f.z || 0)),
        );
        f.y = rnd(-H * 0.22, -12);
        f.x = rnd(0, W);
        f.ph = rnd(0, Math.PI * 2);
        f.vx = rnd(-14, 14) * (0.18 + (f.z || 0));
        f.vy = rnd(18, 62) * (0.25 + (f.z || 0));
        f.rot = rnd(0, Math.PI * 2);
        f.spin = rnd(-2.2, 2.2) * (0.12 + (f.z || 0));
        continue;
      }
      if(f.x < -20) f.x = W + 20;
      if(f.x > W + 20) f.x = -20;

      if(f.kind === "flake"){
        const len = f.r * 2.25;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot || 0);
        ctx.globalAlpha = f.a;
        ctx.shadowBlur = f.r * ((f.z || 0) > 0.7 ? 2.0 : 1.0);
        if(flakePath){
          ctx.scale(len, len);
          ctx.lineWidth = Math.max(0.85, f.r * 0.22) / len;
          ctx.stroke(flakePath);
        }else{
          ctx.lineWidth = Math.max(0.85, f.r * 0.22);
          ctx.beginPath();
          for(let i=0;i<6;i++){
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -len);
            ctx.rotate(Math.PI / 3);
          }
          ctx.stroke();
        }
        ctx.restore();
      }else{
        ctx.globalAlpha = f.a;
        ctx.shadowBlur = f.r * ((f.z || 0) > 0.7 ? 2.2 : 1.2);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    if(now >= snowBankNextCss){
      document.documentElement.style.setProperty("--snow-bank-px", snowBankPx.toFixed(1) + "px");
      snowBankNextCss = now + (lite ? 320 : 240);
    }
    raf = requestAnimationFrame(draw);
  }

  function startSnow(){
    if(!cv || !ctx) return;
    cancelAnimationFrame(raf);
    resize();
    initSnow();
    snowBankNextCss = 0;
    document.documentElement.style.setProperty("--snow-bank-px", snowBankPx.toFixed(1) + "px");
    last = performance.now();
    raf = requestAnimationFrame(draw);
  }

  function pauseSnow(){
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function stopSnow(){
    snowOn = false;
    pauseSnow();
    ctx?.clearRect(0, 0, W, H);
  }

  function resumeSnow(){
    if(!ctx || !snowOn) return;
    last = performance.now();
    raf = requestAnimationFrame(draw);
  }

  function setSnow(on){
    snowOn = !!on && !prefersReduced;
    snowBtn?.setAttribute("aria-pressed", snowOn ? "true" : "false");
    if(snowBtn) snowBtn.textContent = snowOn ? "Снег" : "Снег (выкл)";
    document.body.classList.toggle("snow-off", !snowOn);
    if(!snowOn){
      snowBankPx = 0;
      snowBankNextCss = 0;
      document.documentElement.style.setProperty("--snow-bank-px", "0px");
    }
    if(!ctx) return;
    if(snowOn){
      if(gate && !gate.hidden){
        pauseSnow();
        return;
      }
      startSnow();
    }else{
      stopSnow();
    }
  }

  snowBtn?.addEventListener("click", () => {
    setSnow(!snowOn);
  }, { passive: true });

  addEventListener("resize", () => {
    if(!ctx) return;
    resize();
    if(snowOn) initSnow();
  }, { passive: true });

  /* -------- Fireworks (canvas) -------- */
  const rockets = [];
  const sparks = [];
  let fwRaf = 0, fwLast = 0;
  let fireworksOn = !prefersReduced;

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function launchRocket(x, targetY){
    if(!fwCtx) return;
    if(!W || !H) resize();
    const hue = Math.floor(rnd(0, 360));
    const tx = clamp(typeof x === "number" ? x : rnd(W * 0.18, W * 0.82), 18, W - 18);
    const ty = clamp(typeof targetY === "number" ? targetY : rnd(H * 0.18, H * 0.46), 60, H * 0.62);

    rockets.push({
      x: tx,
      y: H + rnd(10, 60),
      vx: rnd(-28, 28),
      vy: rnd(lite ? -420 : -520, lite ? -320 : -400),
      targetY: ty,
      hue,
      trail: [],
    });
  }

  function explode(x, y, hue){
    const count = lite ? 46 : 72;
    for(let i=0;i<count;i++){
      const a = Math.random() * Math.PI * 2;
      const s = rnd(lite ? 90 : 120, lite ? 240 : 320);
      sparks.push({
        x, y, px: x, py: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        hue: (hue + rnd(-18, 18) + 360) % 360,
        life: rnd(0.90, 1.55),
        age: 0,
        drag: rnd(0.985, 0.995),
        w: rnd(1.0, 2.2),
        glitter: false,
      });
    }
    const glitter = lite ? 8 : 12;
    for(let i=0;i<glitter;i++){
      const a = Math.random() * Math.PI * 2;
      const s = rnd(40, 160);
      sparks.push({
        x, y, px: x, py: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        hue: (hue + rnd(-40, 40) + 360) % 360,
        life: rnd(0.45, 0.90),
        age: 0,
        drag: rnd(0.97, 0.985),
        w: rnd(0.8, 1.6),
        glitter: true,
      });
    }
  }

  function fwStep(now){
    if(!fwCtx) return;
    const dt = Math.min(0.033, (now - fwLast) / 1000 || 0.016);
    fwLast = now;

    fwCtx.clearRect(0, 0, W, H);
    if(!fireworksOn){
      fwRaf = 0;
      return;
    }

    for(let i=rockets.length-1;i>=0;i--){
      const r = rockets[i];
      r.vy += (lite ? 280 : 340) * dt;
      r.x += r.vx * dt;
      r.y += r.vy * dt;

      r.trail.push({ x: r.x, y: r.y, a: 1 });
      if(r.trail.length > (lite ? 8 : 12)) r.trail.shift();
      for(const t of r.trail) t.a *= 0.86;

      if(r.y <= r.targetY || r.vy >= 0){
        explode(r.x, r.y, r.hue);
        rockets.splice(i, 1);
      }
    }

    for(let i=sparks.length-1;i>=0;i--){
      const p = sparks[i];
      p.age += dt;
      if(p.age >= p.life || p.y > H + 30 || p.x < -30 || p.x > W + 30){
        sparks.splice(i, 1);
        continue;
      }

      p.px = p.x;
      p.py = p.y;

      const drag = Math.pow(p.drag, dt * 60);
      p.vx *= drag;
      p.vy *= drag;
      p.vy += (lite ? 220 : 300) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    fwCtx.save();
    fwCtx.globalCompositeOperation = "lighter";

    for(const r of rockets){
      for(let i=1;i<r.trail.length;i++){
        const a = r.trail[i].a * 0.38;
        fwCtx.strokeStyle = `hsla(${r.hue}, 100%, 70%, ${a})`;
        fwCtx.lineWidth = 2;
        fwCtx.beginPath();
        fwCtx.moveTo(r.trail[i-1].x, r.trail[i-1].y);
        fwCtx.lineTo(r.trail[i].x, r.trail[i].y);
        fwCtx.stroke();
      }
      fwCtx.fillStyle = `hsla(${r.hue}, 100%, 78%, .9)`;
      fwCtx.beginPath();
      fwCtx.arc(r.x, r.y, 1.6, 0, Math.PI*2);
      fwCtx.fill();
    }

    for(const p of sparks){
      const t = 1 - p.age / p.life;
      const a = (t * t) * (p.glitter ? 0.75 : 0.9);
      fwCtx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${a})`;
      fwCtx.lineWidth = p.w;
      fwCtx.beginPath();
      fwCtx.moveTo(p.px, p.py);
      fwCtx.lineTo(p.x, p.y);
      fwCtx.stroke();
    }

    fwCtx.restore();

    if(rockets.length === 0 && sparks.length === 0){
      fwRaf = 0;
      return;
    }
    fwRaf = requestAnimationFrame(fwStep);
  }

  function ensureFireworks(){
    if(!fwCv || !fwCtx || !fireworksOn) return false;
    if(fwRaf) return true;
    resize();
    fwLast = performance.now();
    fwRaf = requestAnimationFrame(fwStep);
    return true;
  }

  function pauseFireworks(){
    cancelAnimationFrame(fwRaf);
    fwRaf = 0;
  }

  function burstAt(x, y, times){
    if(!ensureFireworks()) return;
    const bx = clamp(x, 18, W - 18);
    const by = clamp(y, 18, H - 18);
    const n = clamp(typeof times === "number" ? times : 1, 1, 5);
    for(let i=0;i<n;i++){
      explode(
        bx + rnd(-24, 24),
        by + rnd(-18, 18),
        Math.floor(rnd(0, 360)),
      );
    }
  }

  fireworksBtn?.addEventListener("click", () => {
    if(!fireworksOn || !fwCtx) return;
    ensureFireworks();
    for(let i=0;i<(lite ? 2 : 3);i++) launchRocket();
    burstAt(W * 0.5, H * 0.28, lite ? 1 : 2);
  }, { passive: true });

  addEventListener("pointerdown", (e) => {
    if(!fireworksOn || !fwCtx) return;
    if(e.pointerType === "mouse" && e.button !== 0) return;
    burstAt(e.clientX, e.clientY, 1);
  }, { passive: true });

  document.querySelector('a[href="#wishes"]')?.addEventListener("click", () => {
    if(!fireworksOn || !fwCtx) return;
    setTimeout(() => {
      if(!ensureFireworks()) return;
      burstAt(W * 0.5, H * 0.24, lite ? 1 : 2);
    }, 160);
  }, { passive: true });


  if(resumeSnowOnUnlock && snowOn && !raf && (!gate || gate.hidden)){
    resumeSnowOnUnlock = false;
    startSnow();
  }
  // Init
  setSnow(snowOn);
  if(prefersReduced && fireworksBtn) fireworksBtn.setAttribute("disabled", "");

  document.addEventListener("visibilitychange", () => {
    if(document.hidden){
      if(snowOn) pauseSnow();
      pauseFireworks();
      return;
    }
    if(snowOn && !raf) resumeSnow();
    if((rockets.length || sparks.length) && !fwRaf) ensureFireworks();
    if(autoMuted && audio && !audio.paused) attemptUnmute();
  }, { passive: true });
})();















  /* -------- Greeting 2026 modal -------- */
  (function(){
    const btn = document.getElementById("newYearNoteBtn");
    const modal = document.getElementById("newYearNoteModal");
    if(!btn || !modal) return;

    function open(){
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      const closeBtn = modal.querySelector(".ny-modal__close");
      closeBtn && closeBtn.focus();
    }
    function close(){
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    btn.addEventListener("click", open, { passive: true });
    modal.addEventListener("click", (e)=>{
      if(e.target.closest('[data-close="ny"]')) close();
    }, { passive: true });
    addEventListener("keydown", (e)=>{
      if(e.key === "Escape" && !modal.hidden) close();
    }, { passive: true });
  })();


