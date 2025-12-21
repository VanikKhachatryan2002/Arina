/* Romantic birthday page (standalone, no tracking, no album-data dependency) */
(function(){
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite =
    prefersReduced ||
    (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 3) ||
    innerWidth <= 420;

  const gate = document.getElementById("gate");
  const content = document.getElementById("content");
  const startBtn = document.getElementById("start");
  const musicBtn = document.getElementById("musicBtn");
  const wishBtn = document.getElementById("wishBtn");
  const videoBtn = document.getElementById("videoBtn");
  const openLetterBtn = document.getElementById("openLetter");
  const closeLetterBtn = document.getElementById("closeLetter");
  const letterCard = document.getElementById("letterCard");
  const letterEl = document.getElementById("letter");
  const letterTpl = document.getElementById("letterTpl");
  const toast = document.getElementById("toast");
  const dateEl = document.getElementById("date");
  const audio = document.getElementById("bgm");

  const videoModal = document.getElementById("videoModal");
  const videoClose = document.getElementById("videoClose");
  const videoEl = document.getElementById("birthdayVideo");
  const videoHint = document.getElementById("videoHint");

  const wishCountEl = document.getElementById("wishCount");
  const finalEl = document.getElementById("final");
  const wishes = Array.from(document.querySelectorAll(".wish"));

  let started = false;
  let typedOnce = false;
  let typingTimer = null;
  const openedOnce = new Set();
  let resumeMusicAfterVideo = false;

  if (dateEl) {
    try {
      dateEl.textContent = new Date().toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" });
    } catch {
      dateEl.textContent = new Date().toString();
    }
  }

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
    }, lite ? 1800 : 2200);
  }

  async function toggleMusic(force){
    if(!audio || !musicBtn) return;
    const wantOn = typeof force === "boolean" ? force : audio.paused;
    try{
      if(wantOn){
        await audio.play();
        musicBtn.setAttribute("aria-pressed","true");
        musicBtn.textContent = "Пауза";
      }else{
        audio.pause();
        musicBtn.setAttribute("aria-pressed","false");
        musicBtn.textContent = "Музыка";
      }
    }catch{
      showToast("Музыка недоступна в этом браузере.");
    }
  }

  musicBtn?.addEventListener("click", () => { toggleMusic(); }, { passive: true });

  function pauseMusicForVideo(){
    if(audio){
      try{ audio.pause(); }catch{}
    }
    if(musicBtn){
      musicBtn.setAttribute("aria-pressed","false");
      musicBtn.textContent = "Музыка";
    }
  }

  function openVideoModal(){
    if(!videoModal) return;
    if(videoHint) videoHint.hidden = true;
    videoModal.hidden = false;
    requestAnimationFrame(() => videoModal.classList.add("open"));
    document.body.style.overflow = "hidden";

    if(videoEl){
      resumeMusicAfterVideo = !!(audio && !audio.paused);
      pauseMusicForVideo();
      try{ videoEl.currentTime = 0; }catch{}
      const p = videoEl.play();
      if(p && typeof p.catch === "function") p.catch(()=>{});
    }

    requestAnimationFrame(() => videoClose?.focus());
  }

  function closeVideoModal(){
    if(!videoModal) return;
    videoModal.classList.remove("open");
    document.body.style.overflow = "";
    if(videoEl){
      try{ videoEl.pause(); }catch{}
      try{ videoEl.currentTime = 0; }catch{}
    }
    if(resumeMusicAfterVideo){
      resumeMusicAfterVideo = false;
      toggleMusic(true);
    }
    setTimeout(() => { videoModal.hidden = true; }, 180);
  }

  function burstAt(x, y){
    const host = document.createElement("span");
    host.className = "burst";
    host.style.left = x + "px";
    host.style.top = y + "px";
    document.body.appendChild(host);

    const glyphs = ["\u2665", "\u2736", "\u273f", "\u2726"]; // ♥ ✶ ✿ ✦
    const count = lite ? 10 : 14;
    for(let i=0;i<count;i++){
      const el = document.createElement("i");
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.fontSize = (12 + Math.random() * 14) + "px";
      el.style.color = Math.random() < 0.55 ? "#ff4d6d" : "#a586ff";

      const dx = (Math.random() * 160 - 80);
      const dy = (-60 - Math.random() * 140);
      const rot = (Math.random() * 60 - 30);
      const dur = 900 + Math.random() * 500;

      el.animate(
        [
          { transform: "translate(-50%,-50%) scale(.85) rotate(0deg)", opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.35}px)) scale(1.1) rotate(${rot * 0.35}deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.0) rotate(${rot}deg)`, opacity: 0 }
        ],
        { duration: dur, easing: "cubic-bezier(.2,.8,.2,1)" }
      );

      host.appendChild(el);
      setTimeout(() => el.remove(), dur + 20);
    }
    setTimeout(() => host.remove(), 1600);
  }

  function scrollToEl(el){
    if(!el) return;
    try{
      el.scrollIntoView({ behavior: lite ? "auto" : "smooth", block: "start" });
    }catch{
      location.hash = "#" + el.id;
    }
  }

  function updateWishesUI(){
    if(wishCountEl) wishCountEl.textContent = String(openedOnce.size);
    if(finalEl && openedOnce.size >= wishes.length) finalEl.hidden = false;
  }

  wishes.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id") || "";
      const open = !btn.classList.contains("open");
      btn.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if(open && id) openedOnce.add(id);
      updateWishesUI();

      const rect = btn.getBoundingClientRect();
      burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

      if(openedOnce.size === wishes.length){
        showToast("Все желания раскрылись. Загадай своё — и береги себя.");
      }
    }, { passive: true });
  });
  updateWishesUI();

  function typeLetter(){
    if(!letterEl || !letterTpl) return;
    clearTimeout(typingTimer);
    const full = (letterTpl.textContent || "").replace(/\r/g, "").trim();
    if(!full) return;

    letterEl.classList.add("open");
    letterEl.textContent = "";

    const speed = lite ? 10 : 8;
    let i = 0;
    (function tick(){
      const ch = full[i++];
      if(ch === undefined) return;
      letterEl.textContent += ch;
      typingTimer = setTimeout(tick, ch === "\n" ? 90 : speed);
    })();
  }

  function openLetter(){
    if(!letterCard || !letterEl) return;
    letterCard.hidden = false;
    scrollToEl(letterCard);
    if(!typedOnce){
      typedOnce = true;
      typeLetter();
    }else{
      letterEl.classList.toggle("open");
      if(letterEl.classList.contains("open") && !letterEl.textContent.trim()){
        typeLetter();
      }
    }
  }

  openLetterBtn?.addEventListener("click", () => {
    const r = openLetterBtn.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2);
    openLetter();
  }, { passive: true });

  closeLetterBtn?.addEventListener("click", () => {
    if(!letterCard) return;
    letterCard.hidden = true;
  }, { passive: true });

  wishBtn?.addEventListener("click", () => {
    const el = document.getElementById("wishes");
    const r = wishBtn.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2);
    showToast("Загадай желание. Открывай лепестки.");
    scrollToEl(el);
  }, { passive: true });

  videoBtn?.addEventListener("click", () => {
    const r = videoBtn.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2);
    openVideoModal();
  }, { passive: true });

  videoClose?.addEventListener("click", closeVideoModal, { passive: true });
  videoModal?.addEventListener("click", (e) => {
    if(e.target.closest('[data-close="video"]')) closeVideoModal();
  }, { passive: true });
  videoEl?.addEventListener("play", () => {
    if(audio && !audio.paused) resumeMusicAfterVideo = true;
    pauseMusicForVideo();
  }, { passive: true });
  addEventListener("keydown", (e) => {
    if(e.key === "Escape" && videoModal && !videoModal.hidden) closeVideoModal();
  }, { passive: true });
  videoEl?.addEventListener("error", () => {
    if(videoHint) videoHint.hidden = false;
    showToast("Добавь видео: videos/birthday.mp4");
  }, { passive: true });

  function start(){
    if(started) return;
    started = true;
    gate.hidden = true;
    content.hidden = false;
    showToast("С днём рождения, Арина. Я рядом.");
    toggleMusic(true);
    startFX();
  }
  startBtn?.addEventListener("click", () => {
    const r = startBtn.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2);
    start();
  }, { passive: true });

  // Allow tapping the gift card background to start (but not when clicking a link/button).
  gate?.addEventListener("click", (e) => {
    const card = e.target.closest(".gate__card");
    const clickOnBtn = e.target.closest("button, a");
    if(card && !clickOnBtn) start();
  }, { passive: true });

  /* ========= Canvas FX: stars + petals (lightweight) ========= */
  const cv = document.getElementById("fx");
  const ctx = cv?.getContext("2d", { alpha: true });
  let W = 0, H = 0, raf = 0;
  const stars = [];
  const petals = [];
  let last = 0, petalTimer = 0;

  function rnd(a,b){ return a + Math.random() * (b - a); }
  function resize(){
    if(!cv) return;
    W = cv.width = Math.floor(innerWidth * devicePixelRatio);
    H = cv.height = Math.floor(innerHeight * devicePixelRatio);
    cv.style.width = innerWidth + "px";
    cv.style.height = innerHeight + "px";
  }

  function initStars(){
    stars.length = 0;
    const count = lite ? 70 : 110;
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: rnd(0.6, 1.7),
        tw: rnd(0.6, 1.6),
        ph: rnd(0, Math.PI * 2),
        a: rnd(0.25, 0.9),
      });
    }
  }

  function spawnPetal(){
    const s = rnd(6, 14);
    petals.push({
      x: rnd(0, innerWidth),
      y: rnd(-40, -10),
      s,
      vy: rnd(20, 50) * (lite ? 0.9 : 1.0),
      vx: rnd(-10, 10),
      rot: rnd(0, Math.PI),
      vr: rnd(-1.2, 1.2),
      hue: Math.random() < 0.55 ? "rose" : "lav",
      wob: rnd(0.8, 1.6),
      ph: rnd(0, Math.PI * 2),
    });
    if(petals.length > (lite ? 36 : 58)) petals.shift();
  }

  function drawPetal(p, dt){
    p.y += (p.vy * dt);
    p.x += (p.vx * dt) + Math.sin(p.ph + p.y * 0.012) * p.wob;
    p.rot += p.vr * dt;

    const x = p.x * devicePixelRatio;
    const y = p.y * devicePixelRatio;
    const s = p.s * devicePixelRatio;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = (p.hue === "rose") ? "rgba(255,77,109,.78)" : "rgba(165,134,255,.70)";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.65, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick(t){
    if(!ctx) return;
    const now = t || performance.now();
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;

    ctx.clearRect(0, 0, W, H);

    // Stars (normalized positions so resize is stable)
    for(const s of stars){
      const tw = (Math.sin(now * 0.001 * s.tw + s.ph) + 1) * 0.5; // 0..1
      const a = (0.18 + tw * 0.70) * s.a;
      ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(255,255,255,1)";
      const x = (s.x * innerWidth) * devicePixelRatio;
      const y = (s.y * innerHeight) * devicePixelRatio;
      ctx.beginPath();
      ctx.arc(x, y, s.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    // Petals
    ctx.globalAlpha = 1;
    for(let i=petals.length-1;i>=0;i--){
      const p = petals[i];
      drawPetal(p, dt);
      if(p.y > innerHeight + 60) petals.splice(i, 1);
    }

    // Spawn cadence
    petalTimer += dt;
    const every = lite ? 0.26 : 0.20;
    if(petalTimer >= every){
      petalTimer = 0;
      if(!prefersReduced) spawnPetal();
    }

    raf = requestAnimationFrame(tick);
  }

  function startFX(){
    if(!cv || !ctx) return;
    cancelAnimationFrame(raf);
    resize();
    initStars();
    petals.length = 0;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  addEventListener("resize", () => {
    if(!started) return;
    resize();
    initStars();
  }, { passive: true });
})();
