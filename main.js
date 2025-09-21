 (function(){const h=new Date().getHours();const map=h<6?"Ночное чудо, Арина":h<12?"Доброе утро, Арина":h<18?"Добрый день, Арина":"Добрый вечер, Арина";document.getElementById('greet').textContent=map;document.getElementById('date').textContent=new Date().toLocaleString('ru-RU',{dateStyle:'long',timeStyle:'short'});})();
    const quotes=['Твои любимые цветы — <em>розы</em>.','Расстояние лишь усиливает аромат, когда я о тебе думаю.','Когда ты пишешь, мой день расцветает.','Наш разговор — как мурлыканье котёнка: успокаивает.','Любовь — это путь: иногда в розах, иногда по следам — домой.'];
    let q=0; const qEl=document.getElementById('quotes'); function nextQ(){ qEl.innerHTML=quotes[q%quotes.length]; q++; } nextQ(); setInterval(nextQ,3800);
    const letter=document.getElementById('letter'); document.getElementById('reveal').addEventListener('click',()=>{ if(!letter.classList.contains('open')){ letter.classList.add('open'); const txt=letter.innerHTML; letter.innerHTML=''; let i=0; const speed=12; (function type(){ if(i<txt.length){ letter.innerHTML+=txt[i++]; setTimeout(type, txt[i-1]=='\n'?80:speed);} })(); } else { letter.classList.toggle('open'); }});
    const audio=document.getElementById('bgm'); document.getElementById('play').addEventListener('click',async(e)=>{ try{ if(audio.paused){ await audio.play(); e.target.textContent='⏸️ Пауза'; } else { audio.pause(); e.target.textContent='▶️ Музыка'; } }catch{ alert('Добавь audio/song.mp3 ♫'); } });
    const cv=document.getElementById('fx'); const cx=cv.getContext('2d',{alpha:true}); let W,H; function size(){ W=cv.width=innerWidth; H=cv.height=innerHeight } addEventListener('resize',size,{passive:true}); size();
    let items=[],mode=null,rafId=null,pawsOn=false,lastPaw=0; function rnd(a,b){return a+Math.random()*(b-a)} function maxCount(){return innerWidth<520?(mode==='petals'?90:70):(mode==='petals'?140:110)}
    function spawnHeart(){ const s=rnd(10,18); items.push({t:'heart',x:rnd(0,W),y:rnd(-40,-10),s,vy:rnd(.6,1.3),vx:rnd(-.5,.5),rot:rnd(0,Math.PI),c:['#ff4d6d','#ff8fab','#ffb3c1','#f783ac'][Math.floor(Math.random()*4)]}); }
    function drawHeart(h){ cx.save(); cx.translate(h.x,h.y); cx.rotate(h.rot); cx.scale(h.s/20,h.s/20); cx.fillStyle=h.c; cx.beginPath(); cx.moveTo(0,6); cx.bezierCurveTo(0,3,-6,0,-10,0); cx.bezierCurveTo(-18,0,-18,10,-18,10); cx.bezierCurveTo(-18,18,-8,23,0,28); cx.bezierCurveTo(8,23,18,18,18,10); cx.bezierCurveTo(18,10,18,0,10,0); cx.bezierCurveTo(6,0,0,3,0,6); cx.closePath(); cx.fill(); cx.restore(); }
    function spawnPetal(){ const s=rnd(10,22); items.push({t:'petal',x:rnd(0,W),y:rnd(-50,-10),s,vy:rnd(.5,1.1),vx:rnd(-.35,.35),rot:rnd(0,Math.PI),c:['#e11d48','#fb7185','#fda4af','#fecdd3','#ffffff'][Math.floor(Math.random()*5)]}); }
    function drawPetal(p){ cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.scale(p.s/20,p.s/20); cx.fillStyle=p.c; cx.beginPath(); cx.moveTo(0,-12); cx.bezierCurveTo(10,-12,12,0,0,14); cx.bezierCurveTo(-12,0,-10,-12,0,-12); cx.closePath(); cx.fill(); cx.restore(); }
    function spawnPaw(x,y){ const s=rnd(0.7,1.1); items.push({t:'paw',x,y,s,life:0,alpha:1}); }
    function drawPaw(p){ cx.save(); cx.translate(p.x,p.y); cx.scale(12*p.s,12*p.s); cx.globalAlpha=p.alpha; cx.fillStyle='rgba(51,51,51,0.85)'; cx.beginPath(); cx.arc(0,0,1.2,0,Math.PI*2); cx.fill(); [[-1.2,-1.2],[0,-1.6],[1.2,-1.2],[-0.2,-0.2]].forEach(([dx,dy])=>{ cx.beginPath(); cx.arc(dx,dy,0.5,0,Math.PI*2); cx.fill(); }); cx.restore(); }
    function loop(){ cx.clearRect(0,0,W,H); const cap=maxCount(); if(mode==='hearts'&&items.filter(i=>i.t==='heart').length<cap)spawnHeart(); if(mode==='petals'&&items.filter(i=>i.t==='petal').length<cap)spawnPetal();
      items.forEach(o=>{ if(o.t==='heart'||o.t==='petal'){o.x+=o.vx;o.y+=o.vy;o.rot+=0.01;} if(o.t==='paw'){o.life+=1;o.alpha=Math.max(0,1-o.life/160);} });
      items=items.filter(o=>{ if(o.t==='heart'||o.t==='petal')return o.y<H+60; if(o.t==='paw')return o.alpha>0.02; });
      items.forEach(o=> o.t==='heart'?drawHeart(o): o.t==='petal'?drawPetal(o): drawPaw(o)); rafId=requestAnimationFrame(loop); }
    function ensureLoop(){ if(!rafId) loop(); }
    document.getElementById('hearts').addEventListener('click',()=>{ mode=(mode==='hearts'?null:'hearts'); if(!mode){ cancelAnimationFrame(rafId); rafId=null; items=[];} else ensureLoop(); });
    document.getElementById('petals').addEventListener('click',()=>{ mode=(mode==='petals'?null:'petals'); if(!mode){ cancelAnimationFrame(rafId); rafId=null; items=[];} else ensureLoop(); });
    document.getElementById('paws').addEventListener('click',()=>{ pawsOn=!pawsOn; if(pawsOn) ensureLoop(); });
    addEventListener('pointermove', e=>{ if(!pawsOn) return; const now=performance.now(); if(now-lastPaw>50){ spawnPaw(e.clientX,e.clientY); lastPaw=now; }});
    addEventListener('pointerdown', e=>{ if(!pawsOn) return; for(let i=0;i<3;i++) spawnPaw(e.clientX+(Math.random()*28-14), e.clientY+(Math.random()*28-14)); });

(function(){
  const btn = document.getElementById('angelTab');
  const panel = document.getElementById('angelTabPanel');
  if(!btn || !panel) return;

  function openPanel(){
    panel.hidden = false;
    btn.classList.add('active');
    btn.setAttribute('aria-expanded','true');
    panel.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  function closePanel(){
    panel.hidden = true;
    btn.classList.remove('active'); 
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click', ()=> panel.hidden ? openPanel() : closePanel());

    function openPanel(){
        panel.hidden = false;
        btn.classList.add('active');
        btn.setAttribute('aria-expanded','true');
        startAngelMoment();  
        softChime();          
        panel.scrollIntoView({behavior:'smooth', block:'nearest'});
    }

  function startAngelMoment(){
    const box = document.getElementById('angelPetals');
    const whisperEl = document.getElementById('angelWhisper');
    if (box){
      box.innerHTML = '';
      const n = 12;
      for (let i=0;i<n;i++){
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
      whisperEl.textContent = '';
      let j = 0;
      const timer = setInterval(()=>{
        whisperEl.textContent += line[j++];
        if (j >= line.length){ clearInterval(timer); setTimeout(cb, 1800); }
      }, 32);
    }
    (function loop(){ type(lines[i % lines.length], ()=>{ i++; loop(); }); })();
  }
}

    function softChime(){
        try{
            const AC = window.AudioContext || window.webkitAudioContext;
            const ctx = new AC();
            const t = ctx.currentTime;
            function tone(freq, when=0, gain=0.08, dur=2.0){
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine'; o.frequency.value = freq;
            o.connect(g); g.connect(ctx.destination);
            g.gain.setValueAtTime(0, t+when);
            g.gain.linearRampToValueAtTime(gain, t+when+0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, t+when+dur);
            o.start(t+when); o.stop(t+when+dur+0.1);
            }
            tone(659.25, 0.00);  // E5
            tone(987.77, 0.04);  // B5
        } catch(e){  }
    }
})();
  
heart()

function heart() {
    const heart = document.getElementById("loveHeart");
    const heart_container = document.getElementById("pageHearts");
    
    heart.addEventListener("click", () => {
      for (let i = 0; i < 12; i++) {
        const smallHeart = document.createElement("div");
        smallHeart.classList.add("love-floating");
        smallHeart.innerHTML = ["❤️","💖","💕","💞","🌹"][Math.floor(Math.random()*5)];
        
        smallHeart.style.left = Math.random() * window.innerWidth + "px";
        smallHeart.style.top = Math.random() * window.innerHeight + "px";
        smallHeart.style.setProperty("--randX", Math.random());

        heart_container.appendChild(smallHeart);

        setTimeout(() => smallHeart.remove(), 6000);
      }
    });
}

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

    if (!animatedOnce && stitch){
      stitch.classList.add('sew');
      animatedOnce = true;
    }
    if (promisesBox){
      const items = [...promisesBox.querySelectorAll('.promise')];
      items.slice(0,3).forEach((el, i)=> setTimeout(()=> el.classList.add('open'), 500 + i*450));
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
    const p = e.target.closest('.promise');
    if(!p) return;
    p.classList.toggle('open');
  });
})();

(function(){
  const card = document.getElementById('flipCard');
  if(!card) return;
  const toggle = () => {
    const on = card.classList.toggle('flipped');
    card.setAttribute('aria-expanded', on ? 'true' : 'false');
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e=>{
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
  });
})();


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
      try {
        if (typeof mode !== 'undefined' && typeof ensureLoop === 'function') {
          const prev = mode; mode = 'hearts'; ensureLoop();
          setTimeout(()=>{ mode = prev; }, 3000);
        }
      } catch {}
    }
  }

  buds.forEach(b=>{
    b.addEventListener('click', ()=>{
      if(!b.classList.contains('open')){
        b.classList.add('open');
        opened++; update();
        note.textContent = 'Ещё немножко — букет распускается…';
      } else {
        b.classList.toggle('open');
      }
    }, { passive:true });
  });

  update();
})();
