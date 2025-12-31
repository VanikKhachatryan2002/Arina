/* =========================================================
   0) LITE detector — turns on lighter visuals on phones
   ========================================================= */
(function(){
  const lite =
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 3) ||
    innerWidth <= 420;
  if (lite) document.documentElement.classList.add('lite');
  window.__LITE__ = lite;
})();

/* =========================================================
   1) Greeting + date (RU)
   ========================================================= */
(function(){
  const h = new Date().getHours();
  const map = h < 6  ? 'Ночное чудо, Арина'
           : h < 12 ? 'Доброе утро, Арина'
           : h < 18 ? 'Добрый день, Арина'
                    : 'Добрый вечер, Арина';
  document.getElementById('greet').textContent = map;
  document.getElementById('date').textContent =
    new Date().toLocaleString('ru-RU', { dateStyle:'long', timeStyle:'short' });
})();

/* =========================================================
   2) Quotes rotator
   ========================================================= */
(function(){
  const quotes = [
    'Твои любимые цветы — <em>розы</em>.',
    'Расстояние лишь усиливает аромат, когда я о тебе думаю.',
    'Когда ты пишешь, мой день расцветает.',
    'Наш разговор — как мурлыканье котёнка: успокаивает.',
    'Любовь — это путь: иногда в розах, иногда по следам — домой.'
  ];
  let q = 0;
  const qEl = document.getElementById('quotes');
  function nextQ(){ qEl.innerHTML = quotes[q++ % quotes.length]; }
  nextQ(); setInterval(nextQ, 3800);
})();

/* =========================================================
   3) Letter reveal (typewriter)
   ========================================================= */
(function(){
  const letter = document.getElementById('letter');
  document.getElementById('reveal').addEventListener('click', ()=>{
    if(!letter.classList.contains('open')){
      letter.classList.add('open');
      const txt = letter.innerHTML; letter.innerHTML = '';
      let i = 0, speed = 12;
      (function type(){
        if(i < txt.length){
          letter.innerHTML += txt[i++];
          setTimeout(type, txt[i-1] === '\n' ? 80 : speed);
        }
      })();
    }else{
      letter.classList.toggle('open');
    }
  });
})();

/* =========================================================
   4) Music play/pause
   ========================================================= */
(function(){
  const audio = document.getElementById('bgm');
  document.getElementById('play').addEventListener('click', async(e)=>{
    try{
      if(audio.paused){ await audio.play(); e.target.textContent = '⏸️ Пауза'; }
      else { audio.pause(); e.target.textContent = '▶️ Музыка'; }
    }catch{ alert('Добавь audio/song.mp3 ♫'); }
  });
})();

/* =========================================================
   5) Canvas FX: hearts / petals / kitten paws (optimized)
   ========================================================= */
const cv = document.getElementById('fx');
const cx = cv.getContext('2d', { alpha:true });
let W, H; function size(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', size, { passive:true }); size();

let items = [], mode = null, rafId = null, pawsOn = false, lastPaw = 0;

function rnd(a,b){ return a + Math.random() * (b - a); }

function maxCount(){
  const base = innerWidth < 520 ? 70 : 110;
  const tuned = window.__LITE__ ? Math.round(base * 0.6) : base;
  return mode === 'petals' ? Math.round(tuned * 0.9) : tuned;
}

function spawnHeart(){
  const s = rnd(10,18);
  items.push({ t:'heart', x:rnd(0,W), y:rnd(-40,-10), s,
    vy:rnd(.6,1.3), vx:rnd(-.5,.5), rot:rnd(0,Math.PI),
    c:['#ff4d6d','#ff8fab','#ffb3c1','#f783ac'][Math.floor(Math.random()*4)] });
}
function drawHeart(h){
  cx.save(); cx.translate(h.x,h.y); cx.rotate(h.rot); cx.scale(h.s/20,h.s/20);
  cx.fillStyle = h.c;
  cx.beginPath(); cx.moveTo(0,6);
  cx.bezierCurveTo(0,3,-6,0,-10,0);
  cx.bezierCurveTo(-18,0,-18,10,-18,10);
  cx.bezierCurveTo(-18,18,-8,23,0,28);
  cx.bezierCurveTo(8,23,18,18,18,10);
  cx.bezierCurveTo(18,10,18,0,10,0);
  cx.bezierCurveTo(6,0,0,3,0,6);
  cx.closePath(); cx.fill(); cx.restore();
}
function spawnPetal(){
  const s = rnd(10,22);
  items.push({ t:'petal', x:rnd(0,W), y:rnd(-50,-10), s,
    vy:rnd(.5,1.1), vx:rnd(-.35,.35), rot:rnd(0,Math.PI),
    c:['#e11d48','#fb7185','#fda4af','#fecdd3','#ffffff'][Math.floor(Math.random()*5)] });
}
function drawPetal(p){
  cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.scale(p.s/20,p.s/20);
  cx.fillStyle = p.c;
  cx.beginPath(); cx.moveTo(0,-12);
  cx.bezierCurveTo(10,-12,12,0,0,14);
  cx.bezierCurveTo(-12,0,-10,-12,0,-12);
  cx.closePath(); cx.fill(); cx.restore();
}
function spawnPaw(x,y){ const s = rnd(0.7,1.1); items.push({ t:'paw', x, y, s, life:0, alpha:1 }); }
function drawPaw(p){
  cx.save(); cx.translate(p.x,p.y); cx.scale(12*p.s,12*p.s); cx.globalAlpha = p.alpha;
  cx.fillStyle='rgba(51,51,51,0.85)';
  cx.beginPath(); cx.arc(0,0,1.2,0,Math.PI*2); cx.fill();
  [[-1.2,-1.2],[0,-1.6],[1.2,-1.2],[-0.2,-0.2]].forEach(([dx,dy])=>{
    cx.beginPath(); cx.arc(dx,dy,0.5,0,Math.PI*2); cx.fill();
  });
  cx.restore();
}

let lastTs = 0;
function loop(ts=0){
  // cap ~30fps in lite mode
  if (window.__LITE__ && ts - lastTs < 33) { rafId = requestAnimationFrame(loop); return; }
  lastTs = ts;

  cx.clearRect(0,0,W,H);
  const cap = maxCount();
  if (mode==='hearts' && items.filter(i=>i.t==='heart').length < cap) spawnHeart();
  if (mode==='petals' && items.filter(i=>i.t==='petal').length < cap) spawnPetal();

  items.forEach(o=>{
    if(o.t==='heart' || o.t==='petal'){ o.x+=o.vx; o.y+=o.vy; o.rot+=0.01; }
    if(o.t==='paw'){ o.life+=1; o.alpha=Math.max(0,1-o.life/160); }
  });
  items = items.filter(o=>{
    if(o.t==='heart' || o.t==='petal') return o.y < H+60;
    if(o.t==='paw') return o.alpha > 0.02;
  });
  items.forEach(o=> o.t==='heart' ? drawHeart(o) : o.t==='petal' ? drawPetal(o) : drawPaw(o));

  rafId = requestAnimationFrame(loop);
}
function ensureLoop(){ if(!rafId) rafId = requestAnimationFrame(loop); }

/* Toggles */
document.getElementById('hearts').addEventListener('click', ()=>{
  mode = (mode==='hearts' ? null : 'hearts');
  if(!mode){ cancelAnimationFrame(rafId); rafId=null; items=[]; }
  else ensureLoop();
});
document.getElementById('petals').addEventListener('click', ()=>{
  mode = (mode==='petals' ? null : 'petals');
  if(!mode){ cancelAnimationFrame(rafId); rafId=null; items=[]; }
  else ensureLoop();
});
document.getElementById('paws').addEventListener('click', ()=>{
  pawsOn = !pawsOn; if(pawsOn) ensureLoop();
});
addEventListener('pointermove', e=>{
  if(!pawsOn) return;
  const now = performance.now();
  if(now - lastPaw > 50){ spawnPaw(e.clientX, e.clientY); lastPaw = now; }
});
addEventListener('pointerdown', e=>{
  if(!pawsOn) return;
  for(let i=0;i<3;i++) spawnPaw(e.clientX + (Math.random()*28-14), e.clientY + (Math.random()*28-14));
});
// pause when tab hidden
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){ cancelAnimationFrame(rafId); rafId=null; }
  else if(mode || pawsOn) ensureLoop();
});

/* =========================================================
   6) Angel tab: petals + whisper + soft chime
   ========================================================= */
(function(){
  const btn = document.getElementById('angelTab');
  const panel = document.getElementById('angelTabPanel');
  if(!btn || !panel) return;

  function startAngelMoment(){
    const box = document.getElementById('angelPetals');
    const whisperEl = document.getElementById('angelWhisper');
    if (box){
      box.innerHTML = '';
      const n = 12;
      for(let i=0;i<n;i++){
        const s = document.createElement('span');
        s.className = 'petal';
        s.style.setProperty('--x', (Math.random()*180 - 90).toFixed(0));
        s.style.setProperty('--s', (0.85 + Math.random()*0.5).toFixed(2));
        s.style.setProperty('--dur', (7 + Math.random()*3).toFixed(2)+'s');
        s.style.setProperty('--delay', (i*0.15).toFixed(2)+'s');
        box.appendChild(s);
      }
      setTimeout(()=>{ if(box) box.innerHTML=''; }, 14000);
    }
    if (whisperEl && !whisperEl.dataset.active){
      const lines = [
        'Спасибо за её свет.',
        'Пусть будет спокойно твоему сердцу.',
        'Мы бережно храним добро.',
        'Она рядом — в твоей нежности.'
      ];
      whisperEl.dataset.active = '1';
      let i = 0;
      function type(line, cb){
        whisperEl.textContent=''; let j=0;
        const t = setInterval(()=>{
          whisperEl.textContent += line[j++]; 
          if(j>=line.length){ clearInterval(t); setTimeout(cb, 1800); }
        }, 32);
      }
      (function loop(){ type(lines[i%lines.length], ()=>{ i++; loop(); }); })();
    }
  }

  function softChime(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC(); const t = ctx.currentTime;
      function tone(freq, when=0, gain=0.08, dur=2.0){
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t+when);
        g.gain.linearRampToValueAtTime(gain, t+when+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t+when+dur);
        o.start(t+when); o.stop(t+when+dur+0.1);
      }
      tone(659.25, 0.00);  // E5
      tone(987.77, 0.04);  // B5
    }catch{}
  }

  function openPanel(){
    panel.hidden = false;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    startAngelMoment(); softChime();
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  function closePanel(){
    panel.hidden = true;
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
  }

  btn.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());
})();

/* =========================================================
   7) Hearts burst (overlay) — robust init
   ========================================================= */
(function initHearts(){
  const trigger = document.getElementById('loveHeart');
  const layer   = document.getElementById('pageHearts');
  if(!trigger || !layer) return;

  const COUNT = window.__LITE__ ? 8 : 12;

  trigger.addEventListener('click', ()=>{
    const r = trigger.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;

    for(let i=0;i<COUNT;i++){
      const el = document.createElement('div');
      el.className = 'love-floating';
      el.textContent = ['❤️','💖','💕','💞','🌹'][Math.floor(Math.random()*5)];
      el.style.left = (cx + (Math.random()*30 - 15)) + 'px';
      el.style.top  = (cy + (Math.random()*10 - 5)) + 'px';
      el.style.setProperty('--randX', Math.random().toFixed(3));
      layer.appendChild(el);
      setTimeout(()=> el.remove(), 6000);
    }
  });
})();

/* =========================================================
   8) Sorry tab: stitch once + blooming promises
   ========================================================= */
(function(){
  const btn = document.getElementById('sorryTab');
  const panel = document.getElementById('sorryPanel');
  if(!btn || !panel) return;

  const stitch = panel.querySelector('.stitch');
  const promisesBox = panel.querySelector('#promises');
  let animatedOnce = false;

  function openPanel(){
    panel.hidden = false;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');

    if (!animatedOnce && stitch){ stitch.classList.add('sew'); animatedOnce = true; }
    if (promisesBox){
      const items = [...promisesBox.querySelectorAll('.promise')];
      items.slice(0,3).forEach((el,i)=> setTimeout(()=> el.classList.add('open'), 500 + i*450));
    }
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }
  function closePanel(){
    panel.hidden = true;
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded','false');
  }

  btn.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());
  promisesBox?.addEventListener('click', (e)=>{
    const p = e.target.closest('.promise'); if(!p) return;
    p.classList.toggle('open');
  });
})();

/* =========================================================
   9) Flip card (front image / back text)
   ========================================================= */
(function(){
  const card = document.getElementById('flipCard');
  if(!card) return;
  const toggle = ()=> {
    const on = card.classList.toggle('flipped');
    card.setAttribute('aria-expanded', on ? 'true' : 'false');
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e=>{
    if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); }
  });
})();

/* =========================================================
   10) Bouquet mini-game
   ========================================================= */
(function(){
  const wrap = document.getElementById('bouquet');
  if(!wrap) return;
  const buds = [...wrap.querySelectorAll('.bud')];
  const counter = wrap.querySelector('#bqCount');
  const note = wrap.querySelector('#bqNote');
  const done = wrap.querySelector('#bqDone');
  let opened = 0;

  function update(){
    counter.textContent = opened;
    if(opened === buds.length){
      note.textContent = 'Букет готов — открой сюрприз ниже 💗';
      done.hidden = false;
      try{
        if (typeof mode !== 'undefined' && typeof ensureLoop === 'function'){
          const prev = mode; mode = 'hearts'; ensureLoop();
          setTimeout(()=>{ mode = prev; }, 3000);
        }
      }catch{}
    }
  }

  buds.forEach(b=>{
    b.addEventListener('click', ()=>{
      if(!b.classList.contains('open')){
        b.classList.add('open');
        opened++; update();
        note.textContent = 'Ещё немножко — букет распускается…';
      }else{
        b.classList.toggle('open');
      }
    }, { passive:true });
  });

  update();
})();

// —— Universe Poem ——
(function(){
  const display = document.getElementById('poemDisplay');
  const grid = document.getElementById('poemGrid');
  const playBtn = document.getElementById('poemPlay');
  const nextBtn = document.getElementById('poemNext');
  if(!display || !grid) return;

  // Соберём все строки из чипсов (порядок важен)
  const chips = [...grid.querySelectorAll('.chip')];
  const verses = chips.map(ch => ch.getAttribute('data-text'));
  // В конце добавим финальную строку:
  const finalLine = document.getElementById('poemFinal')?.textContent?.trim() || '';
  const all = [...verses, finalLine].filter(Boolean);

  let idx = -1, playing = false, typerTimer = null, autoTimer = null;

  function setActive(i){
    chips.forEach((c,k)=> c.classList.toggle('active', k===i));
  }

  function typeLine(text, cb){
    clearTimeout(typerTimer);
    display.classList.add('typing');
    // печатаем быстро, но мягко
    const speed = window.__LITE__ ? 12 : 9;
    display.textContent = '';
    let j=0;
    (function tick(){
      display.textContent += text[j++] || '';
      if (j <= text.length) { typerTimer = setTimeout(tick, speed); }
      else { setTimeout(()=> display.classList.remove('typing'), 160); cb && cb(); }
    })();
  }

  function show(i){
    idx = i;
    const isFinal = idx === all.length-1;
    typeLine(all[idx], ()=>{
      if(isFinal){
        // маленький бонус: включим сердечки ненадолго, если у тебя есть canvas
        try{
          if (typeof mode !== 'undefined' && typeof ensureLoop === 'function'){
            const prev = mode; mode = 'hearts'; ensureLoop();
            setTimeout(()=>{ mode = prev; }, 2000);
          }
        }catch{}
      }
    });
    if (idx < verses.length) setActive(idx); else setActive(-1);
  }

  function next(){
    const n = (idx + 1) % all.length;
    show(n);
  }

  // Клик по чипсам — ручной выбор
  grid.addEventListener('click', e=>{
    const b = e.target.closest('.chip'); if(!b) return;
    const i = chips.indexOf(b);
    playing = false; playBtn && playBtn.setAttribute('aria-pressed','false');
    clearInterval(autoTimer);
    show(i);
  }, { passive:true });

  // Кнопки управления
  nextBtn?.addEventListener('click', ()=>{ playing = false; clearInterval(autoTimer); show((idx+1)%all.length); });
  playBtn?.addEventListener('click', ()=>{
    playing = !playing;
    playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    clearInterval(autoTimer);
    if (playing){
      next(); // сразу показать первую/следующую
      const gap = window.__LITE__ ? 2600 : 2200; // пауза между строками
      autoTimer = setInterval(next, gap);
    }
  });

  // Инициализация дисплея
  display.textContent = 'Знаешь, как я тебя люблю?';
})();

// Милый эффект при нажатии на кнопку альбома
(function(){
  const el = document.querySelector('.album-cta');
  if(!el) return;

  el.addEventListener('click', (e)=>{
    // небольшая вспышка из сердечек (не мешает переходу по ссылке)
    const burst = document.createElement('span');
    burst.className = 'album-cta-burst';
    burst.style.position = 'absolute';
    const rect = el.getBoundingClientRect();
    burst.style.left = (rect.left + rect.width/2) + 'px';
    burst.style.top  = (rect.top + rect.height/2 + window.scrollY) + 'px';
    burst.style.pointerEvents = 'none';
    document.body.appendChild(burst);

    for(let i=0;i<12;i++){
      const s = document.createElement('i');
      s.textContent = ['❤️','💖','💕','💞','🌹'][Math.floor(Math.random()*5)];
      s.style.position='absolute';
      s.style.left='0'; s.style.top='0';
      s.style.opacity='0';
      s.style.transform='translate(-50%,-50%)';
      s.style.fontSize='18px';
      s.animate(
        [
          { transform:'translate(-50%,-50%) scale(.8)', opacity:0 },
          { transform:`translate(${(Math.random()*120-60)}px, ${(Math.random()*-80-30)}px) scale(1.25)`, opacity:1, offset:.5 },
          { transform:`translate(${(Math.random()*160-80)}px, ${(Math.random()*-140-60)}px) scale(1.1)`, opacity:0 }
        ],
        { duration: 1200 + Math.random()*400, easing:'ease-out' }
      );
      burst.appendChild(s);
      setTimeout(()=> s.remove(), 1700);
    }
    setTimeout(()=> burst.remove(), 1800);
  }, {passive:true});
})();


/* =========================================================
   11) New Year 2026 greeting modal
   ========================================================= */
(function(){
  const btn = document.getElementById('newYearNoteBtn');
  const modal = document.getElementById('newYearNoteModal');
  if(!btn || !modal) return;

  function open(){
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.ny-modal__close');
    closeBtn && closeBtn.focus();
  }
  function close(){
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', open, { passive: true });
  modal.addEventListener('click', (e)=>{
    if(e.target.closest('[data-close="ny"]')) close();
  }, { passive: true });
  addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !modal.hidden) close();
  }, { passive: true });
})();
