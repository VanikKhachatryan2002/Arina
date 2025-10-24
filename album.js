/* =========================
   1) SOFT-GATE (NEW HASH)
   ========================= */
(async function(){
  const target="660a2b5d71278c47e7e54b0d24964ad62d05d62ccd4a8b947ec19c4f9edd6dad";
  const okKey="book_ok_v2";
  const root=document.documentElement;

  async function sha256hex(s){
    const buf=new TextEncoder().encode(s);
    const dig=await crypto.subtle.digest("SHA-256",buf);
    return Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  try{
    if(sessionStorage.getItem(okKey)==="1"){ root.classList.remove("locked"); return; }
  }catch{}

  let granted=false;
  for(let i=0;i<3;i++){
    const code=prompt("Страница для нас двоих.\nВведите код доступа:");
    if(code===null) break;
    try{
      const h=await sha256hex(code.trim());
      if(h===target){ granted=true; break; }
    }catch{}
    alert("Неверный код. Попробуйте ещё раз.");
  }

  if(granted){
    try{ sessionStorage.setItem(okKey,"1"); }catch{}
    root.classList.remove("locked");
  }else{
    document.title="Доступ закрыт";
    document.body.innerHTML='<main style="display:grid;place-items:center;min-height:60vh;font:16px system-ui;color:#111"><div><h1 style="margin:0 0 8px">Доступ закрыт</h1><p style="margin:0;color:#475569">Нужен правильный код.</p></div></main>';
  }
})();

/* =========================
   2) DATA LOADER
   ========================= */
async function loadAlbumData(){
  const inline=document.getElementById("albumData");
  if(inline){
    const txt=inline.textContent.trim();
    if(txt && txt.startsWith("{")){ try{ return JSON.parse(txt); }catch{} }
  }
  if(window.__ALBUM_DATA__) return window.__ALBUM_DATA__;
  if(location.protocol==="http:"||location.protocol==="https:"){
    const url=new URL("./album-data.json",document.baseURI);
    const res=await fetch(url.toString(),{cache:"no-store"});
    if(!res.ok) throw new Error("HTTP "+res.status);
    return await res.json();
  }
  throw new Error("No album data source available. For file:// add inline JSON or album-data.js");
}

/* =========================
   3) SMALL UTILITIES
   ========================= */
const throttle=(fn,ms)=>{let t=0;return function(...a){const now=performance.now();if(now-t>=ms){t=now;fn.apply(this,a);}}};
const rafThrottle=fn=>{let lock=false;return function(...a){ if(lock) return; lock=true; requestAnimationFrame(()=>{ lock=false; fn.apply(this,a); }); }};
const idle=cb=>{ if("requestIdleCallback" in window) requestIdleCallback(()=>cb(),{timeout:200}); else setTimeout(cb,0); };

/* Preload queue with small concurrency for smoother memory/CPU */
function createPreloader(concurrency=2){
  const q=[]; let running=0;
  function run(){
    if(!q.length || running>=concurrency) return;
    const src=q.shift(); running++;
    idle(()=>{
      const im=new Image();
      im.loading="eager"; im.decoding="async";
      im.onload=im.onerror=()=>{ running--; run(); };
      im.src=src;
    });
  }
  return function enqueue(src){ if(!src) return; q.push(src); run(); };
}
const enqueuePreload=createPreloader(2);

/* Memoized date → RU string */
const dateCache=new Map();
function formatDateRU(iso){
  if(!iso) return "";
  if(dateCache.has(iso)) return dateCache.get(iso);
  try{
    const d=new Date(iso+"T12:00:00");
    const s=d.toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"});
    dateCache.set(iso,s);
    return s;
  }catch{ return iso; }
}

/* Media queries cached */
const mqMobilePortrait=matchMedia("(max-width:560px) and (orientation:portrait)");
const mqHoverNone=matchMedia("(hover: none)");
const isMobilePortrait=()=>mqMobilePortrait.matches;
const isTouchLike=()=>mqHoverNone.matches;

/* =========================
   4) APP
   ========================= */
(async function(){
  const AUTHOR_NAME="Vanik";
  const stage=document.getElementById("stage");
  const toc=document.getElementById("toc");
  const metaSpreads=document.getElementById("metaSpreads");
  const metaPage=document.getElementById("metaPage");
  const indexInfo=document.getElementById("indexInfo");
  const prevBtn=document.getElementById("prev");
  const nextBtn=document.getElementById("next");
  const shareBtn=document.getElementById("share");
  const autoplayBtn=document.getElementById("autoplay");
  const viewer=document.getElementById("viewer");
  const viewerImg=viewer?.querySelector("img");
  const viewerClose=viewer?.querySelector(".close");
  const scroller=document.getElementById("turnScroller");
  const hintDots=document.getElementById("turnHint");
  const notesBtn=document.getElementById("notesBtn");
  const notesModal=document.getElementById("notesModal");
  const notesBody=document.getElementById("notesBody");
  const notesTitle=document.getElementById("notesTitle");
  const notesClose=document.getElementById("notesClose");

  /* Chapters modal controls (from earlier step) — if not in HTML, code is harmless */
  const chaptersBtn=document.getElementById("chaptersBtn");
  const chaptersModal=document.getElementById("chaptersModal");
  const chaptersBody=document.getElementById("chaptersBody");
  const chaptersClose=document.getElementById("chaptersClose");

  let BOOK;
  try{ BOOK=await loadAlbumData(); }
  catch(err){
    console.error(err);
    alert("Не удалось загрузить данные альбома. Если вы открываете файл локально (file://), вставьте JSON в <script id=\"albumData\"> или подключите album-data.js. На GitHub Pages всё будет работать автоматически.");
    return;
  }

  try{ BOOK.spreads.sort((a,b)=>(a.date||"").localeCompare(b.date||"")); }catch{}

  const TOTAL=(BOOK.spreads?.length||0)+2;
  metaSpreads.textContent=(BOOK.spreads?.length||0);

  /* Chapters mapping */
  const chapters=[];
  const firstIndexByChapter={};
  (BOOK.spreads||[]).forEach((s,idx)=>{
    const ch=s.chapter||"Без главы";
    if(!chapters.includes(ch)){ chapters.push(ch); firstIndexByChapter[ch]=idx+1; }
  });

  const CHIPS_WINDOW=3;
  toc.classList.add("toc-nav");

  function getCurrentChapter(pageIndex,TOTAL){
    if(pageIndex===0) return BOOK.spreads?.[0]?.chapter||"";
    if(pageIndex===TOTAL-1) return BOOK.spreads?.[BOOK.spreads.length-1]?.chapter||"";
    return BOOK.spreads?.[pageIndex-1]?.chapter||"";
  }
  function getCurrentChapterIndex(){
    const ch=getCurrentChapter(pageIndex,TOTAL);
    const i=chapters.findIndex(c=>c===ch);
    return i>=0?i:0;
  }

  function renderChapterBar(centerIdx){
    const n=chapters.length;
    if(n===0){ toc.innerHTML=""; return; }
    let start=Math.max(0,centerIdx-Math.floor(CHIPS_WINDOW/2));
    let end=Math.min(n,start+CHIPS_WINDOW);
    if(end-start<CHIPS_WINDOW) start=Math.max(0,end-CHIPS_WINDOW);
    const leftDisabled=start===0;
    const rightDisabled=end===n;
    let html=`<button class="toc-arrow" data-role="prevCh" ${leftDisabled?"disabled":""}>‹</button>`;
    html+=chapters.slice(start,end).map((c,i)=>{
      const idx=start+i;
      const active=idx===centerIdx?" active":"";
      return `<button class="chip${active}" data-idx="${idx}" data-ch="${encodeURIComponent(c)}">${c}</button>`;
    }).join("");
    html+=`<button class="toc-arrow" data-role="nextCh" ${rightDisabled?"disabled":""}>›</button>`;
    toc.innerHTML=html;
  }
  const updateChapterUI=()=>renderChapterBar(getCurrentChapterIndex());

  toc.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn) return;
    if(btn.dataset.role==="prevCh"){ const ci=getCurrentChapterIndex(); renderChapterBar(Math.max(0,ci-CHIPS_WINDOW)); return; }
    if(btn.dataset.role==="nextCh"){ const ci=getCurrentChapterIndex(); renderChapterBar(Math.min(chapters.length-1,ci+CHIPS_WINDOW)); return; }
    const chip=btn.closest(".chip"); if(!chip) return;
    const idx=Number(chip.dataset.idx);
    const ch=chapters[idx];
    const i=firstIndexByChapter[ch]??1;
    open(i,"right");
    renderChapterBar(idx);
  },{passive:true});

  /* NAV STATE */
  let pageIndex=0;
  let lastRendered=-1; /* skip re-render if same (micro-guard) */
  let autoTimer=null;
  let playing=false;

  function setHash(){
    let h="";
    if(pageIndex===0) h="cover";
    else if(pageIndex===TOTAL-1) h="end";
    else h=BOOK.spreads[pageIndex-1]?.id||("spread-"+pageIndex);
    history.replaceState(null,"","#"+encodeURIComponent(h));
    localStorage.setItem("bookPage",String(pageIndex));
  }
  function readHash(){
    const h=decodeURIComponent(location.hash.replace("#","").trim());
    if(!h) return null;
    if(h==="cover") return 0;
    if(h==="end") return TOTAL-1;
    const i=(BOOK.spreads||[]).findIndex(x=>x.id===h);
    return i>=0?(i+1):null;
  }

  /* FX */
  function loveSparks(dir="right"){
    const box=document.createElement("div"); box.className="spark";
    for(let i=0;i<8;i++){
      const s=document.createElement("i");
      s.textContent=["❤️","💖","💕","💞","🌹"][Math.floor(Math.random()*5)];
      const dx=(dir==="right"?50+Math.random()*70:-50-Math.random()*70)+"px";
      const dy=(-20+Math.random()*40)+"px";
      s.style.setProperty("--dx",dx); s.style.setProperty("--dy",dy);
      s.style.left=(Math.random()*40-20)+"px"; s.style.top=(Math.random()*16-8)+"px";
      box.appendChild(s);
    }
    stage.appendChild(box); setTimeout(()=>box.remove(),1500);
  }
  function curlFX(dir){
    const fx=document.createElement("div"); fx.className="turnfx "+(dir==="right"?"right":"left");
    stage.appendChild(fx); setTimeout(()=>fx.remove(),520);
  }
  function applyKen(){
    stage.querySelectorAll("img").forEach(i=>i.classList.remove("ken"));
    const targets=stage.querySelectorAll(".spread .page img, .single-page img");
    targets.forEach(img=>requestAnimationFrame(()=>img.classList.add("ken")));
  }

  /* Viewer */
  function openImage(src,alt){
    if(!viewer||!viewerImg) return;
    viewerImg.src=src;
    viewerImg.alt=alt||"";
    viewer.hidden=false;
    viewer.classList.add("open");
    document.body.style.overflow="hidden";
  }
  function closeImage(){
    if(!viewer||!viewerImg) return;
    viewer.classList.remove("open");
    viewer.hidden=true;
    viewerImg.src="";
    viewerImg.alt="";
    document.body.style.overflow="";
  }
  viewerClose?.addEventListener("click",closeImage,{passive:true});
  viewer?.addEventListener("click",e=>{ if(e.target===viewer) closeImage(); },{passive:true});
  addEventListener("keydown",e=>{ if(!viewer.hidden && (e.key==="Escape"||e.key==="Backspace")) closeImage(); },{passive:true});
  function enableImageClicks(){
    stage.querySelectorAll(".page img, .single-page img").forEach(img=>{
      img.style.cursor="zoom-in";
      img.addEventListener("click",function(ev){
        ev.stopPropagation();
        openImage(this.currentSrc||this.src,this.alt||"");
      },{passive:true});
    });
  }

  /* Notes modal */
  function buildNotesForChapter(ch){
    const items=(BOOK.spreads||[]).filter(s=>(s.chapter||"")===ch && s.note && s.note.trim());
    if(!items.length) return "<p>Пока без заметок для этой главы.</p>";
    return items.map(s=>`<div class="note-item"><div class="note-date">${formatDateRU(s.date)}</div><div>${s.note}</div></div>`).join("");
  }
  if(notesBtn){
    notesBtn.addEventListener("click",()=>{
      const ch=getCurrentChapter(pageIndex,TOTAL);
      notesTitle.textContent="Заметки: "+(ch||"Без главы");
      notesBody.innerHTML=buildNotesForChapter(ch);
      notesModal.hidden=false;
      notesModal.classList.add("open");
      document.body.style.overflow="hidden";
    },{passive:true});
  }
  function closeNotes(){
    notesModal.classList.remove("open");
    notesModal.hidden=true;
    document.body.style.overflow="";
  }
  notesClose?.addEventListener("click",closeNotes,{passive:true});
  notesModal?.addEventListener("click",e=>{ if(e.target.classList.contains("modal__backdrop")) closeNotes(); },{passive:true});
  addEventListener("keydown",e=>{ if(!notesModal.hidden && e.key==="Escape") closeNotes(); },{passive:true});

  /* Chapters modal (pretty grid) */
  function buildChaptersGridHTML(){
    if(!BOOK.spreads?.length) return "<p>Пока нет глав.</p>";
    const items=BOOK.spreads.map((s,idx)=>{
      const i=idx+1;
      const thumb=s.left?.src||s.right?.src||BOOK.cover?.image||"";
      const title=s.chapter||"Глава";
      const date=formatDateRU(s.date||"");
      return `<button class="chapter-card" data-open="${i}">
        <img class="chapter-thumb" src="${thumb}" loading="lazy" decoding="async" alt="${title}">
        <div class="chapter-meta">
          <div class="chapter-title">${title}</div>
          <div class="chapter-date">${date}</div>
        </div>
      </button>`;
    }).join("");
    return `<div class="chapters-grid">${items}</div>`;
  }
  function openChaptersModal(){
    if(!chaptersModal||!chaptersBody) return;
    chaptersBody.innerHTML=buildChaptersGridHTML();
    chaptersModal.hidden=false;
    chaptersModal.classList.add("open");
    document.body.style.overflow="hidden";
  }
  function closeChaptersModal(){
    if(!chaptersModal) return;
    chaptersModal.classList.remove("open");
    chaptersModal.hidden=true;
    if(chaptersBody) chaptersBody.innerHTML="";
    document.body.style.overflow="";
  }
  chaptersBtn?.addEventListener("click",openChaptersModal,{passive:true});
  chaptersClose?.addEventListener("click",closeChaptersModal,{passive:true});
  chaptersModal?.addEventListener("click",e=>{ if(e.target.classList.contains("modal__backdrop")) closeChaptersModal(); },{passive:true});
  chaptersBody?.addEventListener("click",e=>{
    const btn=e.target.closest(".chapter-card");
    if(!btn) return;
    const idx=Number(btn.dataset.open||"1");
    closeChaptersModal();
    stopAuto();
    curlFX("right");
    loveSparks("right");
    open(idx,"right");
  },{passive:true});

  /* Render */
  function render(dir="right"){
    if(pageIndex===lastRendered) return; /* tiny guard */
    lastRendered=pageIndex;

    stage.innerHTML="";
    if(pageIndex===0){
      const wrap=document.createElement("div");
      wrap.className="single-frame "+(dir==="right"?"page-enter-right":"page-enter-left");
      wrap.innerHTML=`
        <div class="single-page">
          <img src="${BOOK.cover.image}" alt="Обложка — ${BOOK.cover.title||""}" loading="eager" decoding="async" height="600" width="510">
          <div style="position:absolute;z-index:1000;left:10px;right:10px;bottom:10px;background:linear-gradient(180deg,#ffffffcc,#ffffffa0);border:var(--border);border-radius:12px;padding:10px;text-align:center;color:#111827;font-weight:700">
            <strong>${BOOK.cover.title||""}</strong>
            <small style="display:block;color:#475569;font-weight:600;margin-top:4px">${BOOK.cover.subtitle||""}</small>
          </div>
        </div>`;
      stage.appendChild(wrap);
      metaPage.textContent="Обложка";
      indexInfo.textContent=`Стр. 1 из ${TOTAL}`;
      if(BOOK.spreads?.[0]){ enqueuePreload(BOOK.spreads[0].left.src); enqueuePreload(BOOK.spreads[0].right.src); }
      applyKen(); enableImageClicks(); updateChapterUI(); return;
    }

    if(pageIndex===TOTAL-1){
      const txt=(BOOK.end.text&&BOOK.end.text.trim())?BOOK.end.text:`Конец первой главы. С любовью, ${AUTHOR_NAME}.`;
      const wrap=document.createElement("div");
      wrap.className="single-frame "+(dir==="right"?"page-enter-right":"page-enter-left");
      wrap.innerHTML=`
        <div class="single-page">
          <img src="${BOOK.end.image}" alt="Финал — ${txt}" loading="eager" decoding="async">
          <div style="position:absolute;z-index:1000;left:10px;right:10px;bottom:10px;background:linear-gradient(180deg,#ffffffcc,#ffffffa0);border:var(--border);border-radius:12px;padding:10px;text-align:center;color:#111827;font-weight:700">
            <strong>${txt}</strong>
          </div>
        </div>`;
      stage.appendChild(wrap);
      metaPage.textContent="Финал";
      indexInfo.textContent=`Стр. ${TOTAL} из ${TOTAL}`;
      applyKen(); enableImageClicks(); updateChapterUI(); return;
    }

    const s=BOOK.spreads[pageIndex-1];
    const sp=document.createElement("div");
    sp.className="spread "+(dir==="right"?"page-enter-right":"page-enter-left");
    sp.innerHTML=`
      <div class="page left">
        <span class="label">${s.left.label||"Левая"}</span>
        <img src="${s.left.src}" alt="${s.left.label||"Левая страница"} — ${formatDateRU(s.date)}" loading="eager" decoding="async">
      </div>
      <div class="page right">
        <span class="label">${s.right.label||"Правая"}</span>
        <img src="${s.right.src}" alt="${s.right.label||"Правая страница"} — ${formatDateRU(s.date)}" loading="eager" decoding="async">
      </div>
      <div class="ribbon">${formatDateRU(s.date)} · ${s.chapter||""}</div>`;
    // Upgrade media to <video> if video is provided in data
    try{
      if(s.left && s.left.video){
        const leftEl=sp.querySelector('.page.left');
        const img=leftEl?.querySelector('img');
        const v=document.createElement('video');
        v.src=s.left.video; v.controls=true; v.playsInline=true;
        if(s.left.poster) v.poster=s.left.poster;
        v.setAttribute('aria-label', `${s.left.label||''} - ${formatDateRU(s.date)}`);
        if(img) img.replaceWith(v); else leftEl?.appendChild(v);
      }
      if(s.right && s.right.video){
        const rightEl=sp.querySelector('.page.right');
        const img=rightEl?.querySelector('img');
        const v=document.createElement('video');
        v.src=s.right.video; v.controls=true; v.playsInline=true;
        if(s.right.poster) v.poster=s.right.poster;
        v.setAttribute('aria-label', `${s.right.label||''} - ${formatDateRU(s.date)}`);
        if(img) img.replaceWith(v); else rightEl?.appendChild(v);
      }
    }catch{}
    stage.appendChild(sp);
    metaPage.textContent=`Разворот ${pageIndex} / ${(BOOK.spreads||[]).length}`;
    indexInfo.textContent=`Стр. ${pageIndex+1} из ${TOTAL}`;

    /* Preload next spread lightly */
    const nextSpread=BOOK.spreads?.[pageIndex]||null;
    if(nextSpread){ enqueuePreload(nextSpread.left.src); enqueuePreload(nextSpread.right.src); }

    applyKen(); enableImageClicks(); updateChapterUI();
  }

  function open(i,dir="right"){
    const total=TOTAL;
    pageIndex=(i+total)%total;
    render(dir);
    setHash();
  }
  const next=(dir="right")=>open(pageIndex+1,dir);
  const prev=(dir="left")=>open(pageIndex-1,dir);

  nextBtn.addEventListener("click",()=>{ stopAuto(); curlFX("right"); loveSparks("right"); next("right"); },{passive:true});
  prevBtn.addEventListener("click",()=>{ stopAuto(); curlFX("left");  loveSparks("left");  prev("left");  },{passive:true});

  autoplayBtn.addEventListener("click",()=>{
    playing=!playing;
    autoplayBtn.setAttribute("aria-pressed",playing?"true":"false");
    if(playing){ autoTimer=setInterval(()=>{ curlFX("right"); loveSparks("right"); next("right"); },3600); }
    else{ stopAuto(); }
  },{passive:true});
  function stopAuto(){ playing=false; clearInterval(autoTimer); autoplayBtn.setAttribute("aria-pressed","false"); }

  shareBtn.addEventListener("click",async()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      shareBtn.textContent="✅ Ссылка скопирована";
      setTimeout(()=>shareBtn.textContent="🔗 Поделиться",1200);
    }catch{ prompt("Скопируй ссылку:",location.href); }
  });

  /* Desktop click to paginate only when background is clicked (not the image) */
  stage.addEventListener("click",e=>{
    if(isMobilePortrait()) return;
    if(e.target && e.target.tagName==="IMG") return;
    const r=stage.getBoundingClientRect(); const x=e.clientX-r.left;
    if(x<r.width*0.3){ stopAuto(); curlFX("left"); loveSparks("left"); prev("left"); }
    else if(x>r.width*0.7){ stopAuto(); curlFX("right"); loveSparks("right"); next("right"); }
  },{passive:true});

  /* Touch-only swipe (skip mouse) */
  (function(){
    let sx=0,sy=0,dx=0,dy=0,active=false,id=null,ptype="";
    stage.addEventListener("pointerdown",e=>{
      ptype=e.pointerType||"mouse";
      if(ptype==="mouse") return;
      active=true; sx=e.clientX; sy=e.clientY; dx=0; dy=0; id=e.pointerId; stage.setPointerCapture(id);
    },{passive:true});
    stage.addEventListener("pointermove",e=>{
      if(!active) return;
      if((e.pointerType||ptype)==="mouse") return;
      dx=e.clientX-sx; dy=e.clientY-sy;
    },{passive:true});
    stage.addEventListener("pointerup",()=>{
      if(!active) return;
      active=false;
      if(ptype!=="mouse" && Math.abs(dx)>Math.max(40,Math.abs(dy)*1.2)){
        if(dx>0){ stopAuto(); curlFX("left"); loveSparks("left"); prev("left"); }
        else    { stopAuto(); curlFX("right"); loveSparks("right"); next("right"); }
      }
      dx=0; dy=0; ptype="";
    },{passive:true});
    stage.addEventListener("pointercancel",()=>{ active=false; dx=0; dy=0; ptype=""; },{passive:true});
  })();

  /* Wheel for horizontal trackpads only; skip if touch-like device */
  const onWheel=throttle(e=>{
    if(isTouchLike()) return;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY) && Math.abs(e.deltaX)>10){
      e.preventDefault();
      if(e.deltaX>0){ stopAuto(); curlFX("right"); loveSparks("right"); next("right"); }
      else          { stopAuto(); curlFX("left");  loveSparks("left");  prev("left"); }
    }
  },180);
  stage.addEventListener("wheel",onWheel,{passive:false});

  /* Mobile bottom scroller */
  function centerScroller(){
    if(!isMobilePortrait()) return;
    scroller._lock=true;
    scroller.scrollLeft=scroller.clientWidth;
    setTimeout(()=>scroller._lock=false,60);
  }
  function updateScrollerVisibility(){
    const show=isMobilePortrait();
    scroller.style.display=show?"block":"none";
    hintDots.style.display=show?"flex":"none";
    if(show) centerScroller();
  }
  updateScrollerVisibility();
  addEventListener("resize",rafThrottle(updateScrollerVisibility),{passive:true});
  mqMobilePortrait.addEventListener?.("change",rafThrottle(updateScrollerVisibility),{passive:true});

  scroller.addEventListener("scroll",()=>{
    if(scroller._lock || !isMobilePortrait()) return;
    const w=scroller.clientWidth, x=scroller.scrollLeft;
    if(x<0.35*w){ scroller._lock=true; stopAuto(); curlFX("left"); loveSparks("left"); prev("left"); setTimeout(centerScroller,10); }
    else if(x>1.65*w){ scroller._lock=true; stopAuto(); curlFX("right"); loveSparks("right"); next("right"); setTimeout(centerScroller,10); }
  },{passive:true});

  function hideHint(){ hintDots.style.display="none"; }
  ["touchstart","pointerdown","wheel","click","scroll"].forEach(ev=>addEventListener(ev,hideHint,{once:true,passive:true}));

  /* INIT */
  function init(){
    const fromHash=readHash();
    if(fromHash!==null){ open(fromHash,"right"); }
    else{
      const saved=Number(localStorage.getItem("bookPage"));
      if(!Number.isNaN(saved)&&saved>=0&&saved<TOTAL) open(saved,"right");
      else open(0,"right");
    }
    centerScroller();
  }
  init();
})();
