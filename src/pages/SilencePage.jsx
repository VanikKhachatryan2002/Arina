import { useEffect, useMemo, useState } from "react";

function RoseBloom() {
  return (
<svg className="natural-rose" viewBox="0 0 320 380" aria-hidden="true" width="100%" height="100%">
  <defs>
    <radialGradient id="roseBack" cx="43%" cy="18%" r="88%">
      <stop offset="0" stopColor="#d92f48"/>
      <stop offset=".42" stopColor="#ad0829"/>
      <stop offset="1" stopColor="#3d000a"/>
    </radialGradient>

    <radialGradient id="roseMid" cx="42%" cy="14%" r="90%">
      <stop offset="0" stopColor="#ed3c56"/>
      <stop offset=".38" stopColor="#bd092f"/>
      <stop offset=".76" stopColor="#730019"/>
      <stop offset="1" stopColor="#300007"/>
    </radialGradient>

    <radialGradient id="roseMidInner" cx="40%" cy="12%" r="90%">
      <stop offset="0" stopColor="#f74863"/>
      <stop offset=".40" stopColor="#c70c32"/>
      <stop offset=".80" stopColor="#690015"/>
      <stop offset="1" stopColor="#2e0007"/>
    </radialGradient>

    <radialGradient id="roseInner" cx="38%" cy="12%" r="92%">
      <stop offset="0" stopColor="#ff6b83"/>
      <stop offset=".45" stopColor="#d11337"/>
      <stop offset="1" stopColor="#43000d"/>
    </radialGradient>

    <linearGradient id="roseFront" x1=".5" y1="0" x2=".5" y2="1">
      <stop offset="0" stopColor="#e62e4a"/>
      <stop offset=".5" stopColor="#980422"/>
      <stop offset="1" stopColor="#38000a"/>
    </linearGradient>

    <linearGradient id="roseStem" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#1e3b14"/>
      <stop offset=".5" stopColor="#386b29"/>
      <stop offset="1" stopColor="#11240b"/>
    </linearGradient>

    <linearGradient id="roseLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#427d30"/>
      <stop offset=".5" stopColor="#254d1b"/>
      <stop offset="1" stopColor="#0f240a"/>
    </linearGradient>

    <filter id="rosePetalShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#1a0005" floodOpacity=".7"/>
    </filter>
  </defs>

  <g className="rose-bloom" filter="url(#rosePetalShadow)">
    
    <g className="rose-layer rose-layer--back" fill="url(#roseBack)">
      <path d="M160 205 C80 220 20 160 35 90 C75 135 120 175 160 205Z"/>
      <path d="M160 205 C240 220 300 160 285 90 C245 135 200 175 160 205Z"/>
      <path d="M160 195 C90 145 75 60 160 20 C245 60 230 145 160 195Z"/>
      <path d="M100 160 C50 110 90 45 150 40 C120 80 105 120 100 160Z"/>
      <path d="M220 160 C270 110 230 45 170 40 C200 80 215 120 220 160Z"/>
    </g>

    <g className="rose-layer rose-layer--outer-mid" fill="url(#roseMid)">
      <path d="M160 198 C95 195 55 145 80 90 C115 115 135 150 160 198Z"/>
      <path d="M160 198 C225 195 265 145 240 90 C205 115 185 150 160 198Z"/>
      <path d="M95 135 C70 70 160 35 205 65 C150 75 120 100 95 135Z"/>
      <path d="M225 135 C250 70 160 35 115 65 C170 75 200 100 225 135Z"/>
      <path d="M160 202 C120 202 85 175 110 140 C140 165 150 185 160 202Z"/>
      <path d="M160 202 C200 202 235 175 210 140 C180 165 170 185 160 202Z"/>
    </g>

    <g className="rose-layer rose-layer--middle" fill="url(#roseMidInner)">
      <path d="M160 180 C118 175 90 135 105 100 C130 120 145 145 160 180Z"/>
      <path d="M160 180 C202 175 230 135 215 100 C190 120 175 145 160 180Z"/>
      <path d="M120 110 C105 75 155 60 185 80 C155 88 135 100 120 110Z"/>
      <path d="M200 110 C215 75 165 60 135 80 C165 88 185 100 200 110Z"/>
      <path d="M135 155 C105 130 125 95 155 100 C140 120 135 140 135 155Z"/>
      <path d="M185 155 C215 130 195 95 165 100 C180 120 185 140 185 155Z"/>
    </g>

    <ellipse cx="160" cy="118" rx="28" ry="20" fill="#1f0005"/>

    <g className="rose-layer rose-layer--inner" fill="url(#roseInner)">
      <path d="M160 155 C132 145 125 118 142 98 C155 112 152 132 160 155Z"/>
      <path d="M160 155 C188 145 195 118 178 98 C165 112 168 132 160 155Z"/>
      <path d="M138 118 C128 95 158 82 172 94 C182 106 165 126 138 118Z"/>
      <path d="M182 118 C192 95 162 82 148 94 C138 106 155 126 182 118Z"/>

      <path d="M148 110 C142 98 165 92 172 102 C162 110 150 116 148 110Z" fill="#ff7a93"/>
      <path d="M172 108 C178 96 155 90 148 100 C158 108 170 114 172 108Z" fill="#ff5271"/>
      <path d="M152 104 C148 96 168 94 166 102 C158 105 152 106 152 104Z" fill="#ffa8b8"/>
    </g>

    <g className="rose-layer rose-layer--front" fill="url(#roseFront)">
      <path d="M160 192 C110 192 85 150 120 130 C135 155 145 175 160 192Z"/>
      <path d="M160 192 C210 192 235 150 200 130 C185 155 175 175 160 192Z"/>
      <path d="M160 206 C112 206 92 170 125 152 C155 180 158 182 160 206Z"/>
      <path d="M160 206 C208 206 228 170 195 152 C165 180 162 182 160 206Z"/>
    </g>

    <g stroke="#ffc2d1" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5">
      <path d="M120 132 Q140 162 160 190"/>
      <path d="M200 132 Q180 162 160 190"/>
      <path d="M125 153 Q145 180 160 204"/>
      <path d="M195 153 Q175 180 160 204"/>
      <path d="M138 119 Q155 138 160 153"/>
      <path d="M182 119 Q165 138 160 153"/>
      <path d="M82 92 Q120 118 160 196"/>
      <path d="M238 92 Q200 118 160 196"/>
    </g>
  </g>
</svg>
  );
}

function AmbientRose({ x, bottom, scale, delay, opacity, blur = 0, stemHeight, tone = "crimson", distant = false }) {
  const style = {
    "--ambient-x": `${x}%`,
    "--ambient-bottom": `${bottom}px`,
    "--ambient-scale": scale,
    "--ambient-delay": `${delay}s`,
    "--ambient-opacity": opacity,
    "--ambient-blur": `${blur}px`,
    "--ambient-stem-height": `${stemHeight}px`,
  };

  return (
    <div className={`ambient-rose ambient-rose--${tone}${distant ? " ambient-rose--distant" : ""}`} style={style} aria-hidden="true">
      <span className="ambient-rose__aura" />
      <span className="ambient-rose__stem">
        <i className="ambient-rose__leaf ambient-rose__leaf--left" />
        <i className="ambient-rose__leaf ambient-rose__leaf--right" />
      </span>
      <svg className="ambient-rose__bloom" viewBox="0 0 100 84">
        <g className="ambient-rose__petals ambient-rose__petals--outer">
          <path d="M50 75C29 80 8 66 7 45c12 3 24 9 33 18C28 49 29 28 48 14c4 13 5 27 2 41 4-22 19-38 39-42 3 21-8 39-26 49 10-8 22-13 34-13-4 20-23 32-47 26Z" />
        </g>
        <g className="ambient-rose__petals ambient-rose__petals--middle">
          <path d="M50 69C34 68 21 57 23 42c10 3 18 9 24 18-6-13-2-29 11-38 5 10 5 22 1 33 7-12 18-19 31-18-1 16-15 29-40 32Z" />
          <path d="M49 68C39 60 36 47 43 37c7 5 11 12 11 21 2-11 10-19 21-21 3 13-5 25-26 31Z" />
        </g>
        <g className="ambient-rose__petals ambient-rose__petals--inner">
          <path d="M49 61c-8-8-7-19 1-25 5 5 7 11 5 17 3-7 9-11 16-10 0 10-8 18-22 18Z" />
          <path d="M52 54c-5-5-3-12 3-15 5 5 4 11-3 15Z" />
        </g>
      </svg>
    </div>
  );
}

export function SilencePage() {
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    window.__LOCATION_ENDPOINT = "https://arina.vanikkhachatryan2002.workers.dev";
    import("../../geo-track.js").catch((error) => {
      console.warn("Silence page email notification failed", error);
    });
  }, []);

  const sparks = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    id: index, left: `${5 + ((index * 37) % 91)}%`, delay: `${(index % 8) * -1.1}s`,
    duration: `${7 + (index % 6)}s`, size: `${2 + (index % 3)}px`,
  })), []);
  const falling = useMemo(() => Array.from({ length: 9 }, (_, index) => ({
    id: index, left: `${10 + ((index * 29) % 80)}%`, delay: `${5.1 + (index % 5) * .85}s`,
    drift: `${-45 + ((index * 31) % 90)}px`,
  })), []);
  const ambientRoses = useMemo(() => [
    { x: 8, bottom: 70, scale: .64, delay: .45, opacity: .38, blur: .2, stemHeight: 250, tone: "wine" },
    { x: 22, bottom: 22, scale: .43, delay: 1.2, opacity: .25, blur: 1.1, stemHeight: 205, tone: "pink", distant: true },
    { x: 35, bottom: 245, scale: .32, delay: .82, opacity: .19, blur: 1.8, stemHeight: 130, tone: "crimson", distant: true },
    { x: 65, bottom: 255, scale: .3, delay: 1.45, opacity: .18, blur: 2.2, stemHeight: 125, tone: "pink", distant: true },
    { x: 78, bottom: 35, scale: .5, delay: .95, opacity: .3, blur: .6, stemHeight: 225, tone: "wine" },
    { x: 92, bottom: 92, scale: .69, delay: .62, opacity: .35, blur: .4, stemHeight: 275, tone: "crimson" },
    { x: 52, bottom: 330, scale: .25, delay: 1.7, opacity: .15, blur: 2.8, stemHeight: 105, tone: "wine", distant: true },
  ], []);

  return (
    <main className="silence-page" key={replay}>
      <div className="silence-glow" aria-hidden="true" />
      <div className="ambient-garden" aria-hidden="true">
        {ambientRoses.map((rose, index) => <AmbientRose key={index} {...rose} />)}
      </div>
      <div className="silence-stars" aria-hidden="true">
        {sparks.map((spark) => <i key={spark.id} style={{ left: spark.left, animationDelay: spark.delay, animationDuration: spark.duration, width: spark.size, height: spark.size }} />)}
      </div>
      <nav className="silence-nav" aria-label="Навигация">
        <a href="index.html">← На главную</a><span>Vanik <b>♥</b> Arina</span>
      </nav>
      <section className="silence-scene" aria-labelledby="silence-title">
        <p className="silence-kicker">Есть чувства, которым не нужны слова</p>
        <div className="rose" role="img" aria-label="Распускающаяся красная роза">
          <RoseBloom />
          <i className="rose-sepal rose-sepal--left" /><i className="rose-sepal rose-sepal--right" />
          <div className="rose-stem"><i className="rose-leaf rose-leaf--left" /><i className="rose-leaf rose-leaf--right" /></div>
        </div>
        <div className="falling-petals" aria-hidden="true">
          {falling.map((petal) => <i key={petal.id} style={{ left: petal.left, animationDelay: petal.delay, "--drift": petal.drift }} />)}
        </div>
        <article className="silence-letter">
          <span className="silence-letter__mark">“</span>
          <h1 id="silence-title">Даже когда ты молчишь…</h1>
          <p className="message-lines">
            <span>Может быть, ты молчишь и не говоришь со мной, но я думаю о тебе каждую секунду.</span>
            <span>И если ты сейчас видишь эту страницу, значит, где-то глубоко внутри ты тоже не перестаёшь думать обо мне.</span>
            <span>Потому что иногда даже молчание не способно разорвать связь между двумя сердцами.</span>
          </p>
          <div className="heartbeat" aria-label="Два связанных сердца"><span>♥</span><i /><span>♥</span></div>
          <small>Я всё ещё здесь. И моё сердце всё ещё выбирает тебя.</small>
        </article>
        <button className="replay-bloom" onClick={() => setReplay((value) => value + 1)}>↻ Распустить розу снова</button>
      </section>
    </main>
  );
}
