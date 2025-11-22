(async function(){
  const bookEl=document.getElementById("book");
  if(!bookEl) return;
  const noteTitle=document.getElementById("noteTitle");
  const noteDate=document.getElementById("noteDate");
  const noteText=document.getElementById("noteText");
  const pageIndicator=document.getElementById("pageIndicator");
  const autoPlayBtn=document.getElementById("autoPlay");
  const prevBtn=document.getElementById("prevPage");
  const nextBtn=document.getElementById("nextPage");
  const headerMeta=document.getElementById("headerMeta");
  const viewer=document.getElementById("bookViewer");
  const viewerImg=viewer?.querySelector("img");
  const viewerClose=viewer?.querySelector(".close");

  const pages=[];
  const metaList=[];
  let autoTimer=null;

  const formatDateRU=(iso)=>{
    if(!iso) return "";
    try{
      const d=new Date(iso+"T12:00:00");
      return d.toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"});
    }catch{return iso;}
  };

  async function loadAlbumData(){
    const inline=document.getElementById("albumData");
    if(inline){
      const txt=inline.textContent.trim();
       if(txt && txt.startsWith("{")) try{return JSON.parse(txt);}catch{}
    }
    if(window.__ALBUM_DATA__) return window.__ALBUM_DATA__;
    if(location.protocol==="http:"||location.protocol==="https:"){
      const res=await fetch(new URL("./album-data.json",document.baseURI).toString(),{cache:"no-store"});
      if(!res.ok) throw new Error("HTTP "+res.status);
      return await res.json();
    }
    throw new Error("No album data available. On file://, include album-data.js or inline JSON.");
  }

  function pushPage(meta, html){
    const el=document.createElement("article");
    /* PageFlip expects elements with class "page" */
    el.className="page page-sheet";
    el.innerHTML=html;
    pages.push(el);
    metaList.push(meta);
  }

  function mediaHTML(side,label){
    if(!side) return "";
    if(side.video){
      const posterAttr=side.poster?` poster="${side.poster}"`:(side.src?` poster="${side.src}"`:"");
      return `<video src="${side.video}"${posterAttr} controls preload="metadata"></video>`;
    }
    return `<img src="${side.src||""}" alt="${label||""}" loading="lazy" decoding="async">`;
  }

  function buildPages(data){
    const coverImg=data.cover?.image||"";
    pushPage(
      {type:"cover",chapter:data.cover?.title||"Cover",date:"",note:data.cover?.subtitle||""},
      `<div class="page-inner cover">
        <div class="page-bg" style="background-image:url('${coverImg}')"></div>
        <div class="cover-copy">
          <p class="eyebrow">Keepsake</p>
          <p class="title">${data.cover?.title||"Our Story"}</p>
          <p class="subtitle">${data.cover?.subtitle||"Flip to begin the journey."}</p>
        </div>
      </div>`
    );

    (data.spreads||[]).forEach((spread)=>{
      const chapter=spread.chapter||"";
      const dateRaw=spread.date||"";
      const note=spread.note||"";
      const niceDate=formatDateRU(dateRaw);
      const addSide=(side,labelFallback)=>{
        if(!side) return;
        const label=side.label||labelFallback;
        pushPage(
          {type:"spread",chapter,date:dateRaw,note,label},
          `<div class="page-inner photo">
            <div class="page-tag">${label}</div>
            <div class="page-figure">${mediaHTML(side,label)}</div>
            <div class="page-footer">
              <div class="meta">${niceDate}${chapter?` - ${chapter}`:""}</div>
              <div class="caption">${label}</div>
            </div>
          </div>`
        );
      };
      addSide(spread.left,"Left page");
      addSide(spread.right,"Right page");
    });

    pushPage(
      {type:"end",chapter:"The End",date:"",note:data.end?.text||""},
      `<div class="page-inner cover">
        <div class="page-bg" style="background-image:url('${data.end?.image||data.cover?.image||""}'); opacity:.28"></div>
        <div class="cover-copy">
          <p class="title">The end.</p>
          <p class="subtitle">${data.end?.text||"Thanks for reading."}</p>
        </div>
      </div>`
    );
  }

  function updateUI(pageIdx=0){
    const total=metaList.length;
    pageIndicator.textContent=`${pageIdx+1} / ${total}`;
    const meta=metaList[pageIdx]||{};
    noteTitle.textContent=meta.chapter||meta.label||"Page";
    noteDate.textContent=formatDateRU(meta.date||"");
    noteText.textContent=(meta.note&&meta.note.trim())?meta.note.trim():"This spread has no note yet.";
  }

  function startAutoplay(flip){
    stopAutoplay();
    if(!flip) return;
    autoPlayBtn.setAttribute("aria-pressed","true");
    autoPlayBtn.textContent="Stop autoplay";
    autoTimer=setInterval(()=>{
      const idx=flip.getCurrentPageIndex();
      const last=flip.getPageCount()-1;
      if(idx>=last) flip.turnToPage(0);
      else flip.flipNext();
    },3600);
  }
  function stopAutoplay(){
    if(autoTimer){ clearInterval(autoTimer); autoTimer=null; }
    autoPlayBtn.setAttribute("aria-pressed","false");
    autoPlayBtn.textContent="Autoplay";
  }

  function wireViewer(){
    function close(){ if(!viewer) return; viewer.hidden=true; viewerImg.src=""; document.body.style.overflow=""; }
    viewerClose?.addEventListener("click",close,{passive:true});
    viewer?.addEventListener("click",e=>{ if(e.target===viewer) close(); },{passive:true});
    addEventListener("keydown",e=>{ if(!viewer?.hidden && (e.key==="Escape"||e.key==="Backspace")) close(); },{passive:true});
    return function open(src,alt=""){ if(!viewer||!viewerImg) return; viewerImg.src=src; viewerImg.alt=alt; viewer.hidden=false; viewer.classList.add("open"); document.body.style.overflow="hidden"; };
  }

  const openViewer=wireViewer();

  bookEl.addEventListener("click",e=>{
    const img=e.target.closest("img");
    if(img){ e.stopPropagation(); openViewer(img.currentSrc||img.src,img.alt||""); }
  },{passive:true});

  let album;
  try{ album=await loadAlbumData(); }
  catch(err){
    console.error(err);
    bookEl.innerHTML='<p style="padding:20px;text-align:center">Could not load album-data.json</p>';
    return;
  }

  headerMeta.textContent=`${album.spreads?.length||0} spreads`;
  buildPages(album);
  if(!pages.length){
    bookEl.innerHTML='<p style="padding:20px;text-align:center">No pages were built. Check album-data.json paths.</p>';
    return;
  }

  function resolveFlipCtor(){
    if(window.St?.PageFlip) return window.St.PageFlip;
    if(window.PageFlip) return window.PageFlip;
    return null;
  }

  const FlipCtor=resolveFlipCtor();
  if(!FlipCtor){
    bookEl.innerHTML='<p style="padding:20px;text-align:center">Flip library did not load.</p>';
    return;
  }

  const tmp=document.createElement("div");
  pages.forEach(p=>tmp.appendChild(p));

  const flip=new FlipCtor(bookEl,{
    width:520,
    height:720,
    size:"stretch",
    minWidth:320,
    maxWidth:1400,
    minHeight:420,
    maxHeight:1800,
    showCover:true,
    maxShadowOpacity:0.25,
    drawShadow:true,
    flippingTime:820,
    useMouseEvents:true,
    mobileScrollSupport:true
  });

  flip.loadFromHTML(Array.from(tmp.children));
  updateUI(0);

  flip.on("flip",e=>{ updateUI(e.data); stopAutoplay(); });
  flip.on("init",()=>updateUI(flip.getCurrentPageIndex()));

  prevBtn?.addEventListener("click",()=>{ stopAutoplay(); flip.flipPrev(); },{passive:true});
  nextBtn?.addEventListener("click",()=>{ stopAutoplay(); flip.flipNext(); },{passive:true});
  autoPlayBtn?.addEventListener("click",()=>{
    const pressed=autoPlayBtn.getAttribute("aria-pressed")==="true";
    if(pressed) stopAutoplay(); else startAutoplay(flip);
  },{passive:true});

  addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"){ stopAutoplay(); flip.flipPrev(); }
    else if(e.key==="ArrowRight"){ stopAutoplay(); flip.flipNext(); }
  },{passive:true});
})();
