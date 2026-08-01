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

/* Canvas particles are initialized and cleaned up by the React page runtime. */

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
        window.__loveParticles?.burst(3000);
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
          window.__loveParticles?.burst(2000);
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
