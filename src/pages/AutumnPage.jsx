import { useEffect, useRef, useState } from "react";
import album from "../../album-data.json";

const memories = [
  { id: "2025-04-20", title: "Одно приветствие. Целый мир.", caption: "Тогда мы ещё не знали, сколько тепла может поместиться в одном сообщении." },
  { id: "2025-08-23", title: "Мелодия, в которой живём мы", caption: "Наша песня. Наш маленький уголок счастья. И твоя улыбка — моё вдохновение." },
  { id: "2026-10-04", title: "Совсем скоро — рядом", caption: "Четырнадцать месяцев любви. И мечта впервые обнять тебя по-настоящему." },
].map(memory => ({ ...memory, spread: album.spreads.find(spread => spread.id === memory.id) })).filter(memory => memory.spread);

function Leaf({ className = "", style }) {
  return <svg className={className} style={style} viewBox="0 0 80 90" fill="none" aria-hidden="true"><path d="m40 3 9 22 17-8-4 23 15 7-23 18-14 15-14-15L3 47l15-7-4-23 17 8Z" fill="currentColor" /><path d="M40 17v69M40 50 23 35m17 27 20-18" stroke="#422718" strokeWidth="1.5" opacity=".5" /></svg>;
}

function CrystalHeart({ onReveal, opened }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let size = 480;
    const resize = () => {
      size = canvas.getBoundingClientRect().width;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * ratio;
      canvas.height = size * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const render = (timestamp = 0) => {
      const time = motion.matches ? 0 : timestamp / 1000;
      context.clearRect(0, 0, size, size);
      const pulse = 1 + Math.sin(time * 1.6) * .025;
      for (let i = 0; i < 780; i++) {
        const angle = i / 780 * Math.PI * 2;
        const depth = Math.sin(i * 17.31);
        const scale = size / 43 * pulse;
        const x = size / 2 + 16 * Math.sin(angle) ** 3 * scale + Math.sin(time * .7 + i) * depth * 5;
        const y = size * .43 - (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * scale + Math.cos(time + i) * depth * 5;
        const shimmer = .25 + (Math.sin(time * 2 + i * 2.7) + 1) * .35;
        context.fillStyle = i % 4 === 0 ? `rgba(255,235,195,${shimmer})` : `rgba(239,156,138,${shimmer})`;
        context.shadowColor = "#ffae86";
        context.shadowBlur = i % 7 === 0 ? 8 : 0;
        context.beginPath();
        context.arc(x, y, (i % 5 === 0 ? 1.6 : .65) * size / 480, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      for (let i = 0; i < 46; i++) {
        const x = ((i * 79.3 + Math.sin(time * .3 + i) * 15) % 480) / 480 * size;
        const y = ((i * 47.7 - time * (3 + i % 3)) % 480 + 480) % 480 / 480 * size;
        context.fillStyle = `rgba(255,219,165,${.12 + (Math.sin(time + i) + 1) * .2})`;
        context.fillRect(x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1);
      }
      if (!motion.matches && visible && !document.hidden) frame = requestAnimationFrame(render);
    };
    const restart = () => { cancelAnimationFrame(frame); render(performance.now()); };
    const observer = new ResizeObserver(() => { resize(); restart(); });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) restart(); else cancelAnimationFrame(frame); });
    observer.observe(canvas);
    intersection.observe(canvas);
    motion.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    resize();
    restart();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); motion.removeEventListener("change", restart); document.removeEventListener("visibilitychange", restart); };
  }, []);

  return <button className={`autumn-heart ${opened ? "is-open" : ""}`} onClick={onReveal} aria-label="Открыть письмо от Ваника" aria-expanded={opened} aria-controls="autumn-letter">
    <canvas ref={canvasRef} aria-hidden="true" />
    <svg className="autumn-crystal" viewBox="0 0 180 180" aria-hidden="true">
      <defs><linearGradient id="crystal-color" x2="1" y2="1"><stop stopColor="#ffe2c3" /><stop offset=".45" stopColor="#d98b83" /><stop offset="1" stopColor="#6a293b" /></linearGradient></defs>
      <path d="M90 148 28 85 22 53 43 29 68 27 90 48 112 27 137 29 158 53 152 85Z" fill="url(#crystal-color)" stroke="#ffd4b1" strokeWidth="1" />
      <path d="m22 53 46-26-15 48Zm46-26 22 21-37 27Zm22 21 22-21 15 48Zm22-21 46 26-31 22ZM28 85l25-10 37 73Zm25-10 37-27v100Zm37-27 37 27-37 73Zm37 27 25 10-62 63Z" fill="none" stroke="#ffe5ce" strokeWidth=".8" opacity=".6" />
      <path d="m22 53 31 22-25 10Zm68-5 37 27H53Zm37 27 31-22-6 32Z" fill="#ffe9cf" opacity=".22" />
    </svg>
    <span className="autumn-heart-hint">коснись сердца</span>
  </button>;
}

export function AutumnPage() {
  const audioRef = useRef(null);
  const letterRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const [audioError, setAudioError] = useState(false);

  async function playMusic() {
    try { await audioRef.current.play(); setAudioError(false); }
    catch { setAudioError(true); }
  }
  function enter() { setEntered(true); playMusic(); }
  function reveal() { setOpened(true); }
  useEffect(() => {
    if (!opened) return;
    letterRef.current?.focus({ preventScroll: true });
    letterRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [opened]);

  return <main className={`autumn-page ${entered ? "has-entered" : ""}`}>
    <audio ref={audioRef} src="audio/song.mp3" loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setAudioError(true); setPlaying(false); }} />
    <div className="autumn-atmosphere" aria-hidden="true">
      <div className="autumn-sun" />
      <svg className="autumn-forest" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMax slice"><g fill="none" stroke="currentColor" strokeLinecap="round"><path d="M-30 1100 85 450 46-50M83 474 233 199 291-40M78 362-58 115M96 697 291 457 405 357M1470 1100 1329 445 1385-50M1334 469 1193 188 1165-30M1340 349 1480 94M1367 715 1160 444 1051 359" strokeWidth="27" /><path d="m230 205 128-26 72-96m-193 467 18-173-53-91m934 142-29-158 27-67m69 115-123-33-70-82" strokeWidth="9" /></g></svg>
      {Array.from({ length: 22 }, (_, i) => <Leaf key={i} className="autumn-falling-leaf" style={{ "--x": `${(i * 37) % 100}%`, "--delay": `${-i * 1.7}s`, "--duration": `${14 + i % 8}s`, "--size": `${16 + i % 5 * 7}px`, "--drift": `${(i % 2 ? 1 : -1) * (45 + i * 4)}px`, color: ["#b86a37", "#d9a75c", "#923f35"][i % 3] }} />)}
    </div>

    {!entered && <div className="autumn-invitation">
      <Leaf className="invitation-leaf" />
      <p className="autumn-eyebrow">маленький подарок для моей любви</p>
      <h1>Арина,<br /><em>побудь со мной.</em></h1>
      <p>Оставим весь мир за дверью.<br />Здесь только осень, наша песня и мы.</p>
      <button className="autumn-primary" onClick={enter}>Открыть наш осенний вечер <span aria-hidden="true">↗</span></button>
      <span className="invitation-note">с музыкой · с любовью · от Ваника</span>
      <a className="invitation-back" href="index.html">← На главную</a>
    </div>}

    {entered && <>
      <nav className="autumn-nav" aria-label="Навигация"><a href="index.html">← Наш маленький мир</a><span>V <i>&</i> A</span><button onClick={() => playing ? audioRef.current.pause() : playMusic()} aria-pressed={playing} aria-label={playing ? "Приостановить нашу песню" : "Включить нашу песню"}><span className={`autumn-equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span>{playing ? "Наша песня" : "Включить песню"}</button></nav>
      {audioError && <p className="autumn-audio-error" role="status">Не удалось включить музыку. Попробуй нажать «Включить песню» ещё раз.</p>}
      <section className="autumn-hero" aria-labelledby="autumn-title">
        <p className="autumn-eyebrow">для Арины · с бесконечной любовью</p>
        <h1 id="autumn-title">Осень, в которой<br /><em>есть ты.</em></h1>
        <p className="autumn-intro">Мир становится тише. Листья — золотыми.<br />А ты всё так же — моё самое тёплое место.</p>
        <CrystalHeart onReveal={reveal} opened={opened} />
        <p className="autumn-heart-caption">Моё сердце. В твоих руках.</p>
        <a className="autumn-scroll" href="#our-autumn">Немного нашей истории <span aria-hidden="true">↓</span></a>
      </section>

      <section className="autumn-memories" id="our-autumn" aria-labelledby="autumn-memories-title">
        <p className="autumn-eyebrow">бережно, как листья между страницами</p>
        <h2 id="autumn-memories-title">То, что согревает <em>нас.</em></h2>
        <div className="autumn-memory-grid">{memories.map((memory, i) => <article className="autumn-memory" key={memory.id}>
          <div className="autumn-memory-photo"><img src={memory.spread.left.src} alt={memory.spread.left.label} loading="lazy" /><span>0{i + 1}</span></div>
          <time dateTime={memory.spread.date}>{new Intl.DateTimeFormat("ru", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${memory.spread.date}T12:00:00Z`))}</time>
          <h3>{memory.title}</h3><p>{memory.caption}</p>
          <details><summary>Вспомнить этот день <span aria-hidden="true">+</span></summary><p>{memory.spread.note}</p></details>
        </article>)}</div>
      </section>

      <section className={`autumn-letter ${opened ? "is-open" : ""}`} id="autumn-letter" aria-labelledby="autumn-letter-title">
        <Leaf className="letter-leaf" />
        <p className="autumn-eyebrow">одно письмо. только тебе.</p>
        <h2 id="autumn-letter-title">Если бы ты была <em>рядом…</em></h2>
        {!opened ? <><p>Я бы согрел твои руки в своих.<br />А пока — оставил здесь немного моего тепла.</p><button className="autumn-primary" onClick={reveal}>Прочитать моё письмо <span aria-hidden="true">♡</span></button></> : <div className="autumn-letter-text" ref={letterRef} tabIndex={-1}>
          <p>Моя Арина,</p>
          <p>Этой осенью я мечтаю о самом простом: идти рядом с тобой, слышать, как шуршат листья под нашими ногами, и держать твою руку в своей. Без экрана между нами. Без расстояния.</p>
          <p>Всё началось с одного приветствия. Потом были наши маленькие истории, твои розы, наши признания и песня, в которой мы нашли себя. Из простых сообщений вырос целый мир. Наш мир.</p>
          <p>Мы столько прошли, чтобы сохранить его. И теперь, когда наша первая встреча становится ближе, я думаю не о больших словах. Я думаю о том, как впервые обниму тебя. Как посмотрю в твои глаза и скажу то, что ты уже знаешь: я люблю тебя.</p>
          <p>Пусть за окном холодает. Я хочу быть для тебя теплом — в этой осени и во всех временах года, которые ждут нас впереди.</p>
          <p className="autumn-letter-signature">Всегда твой,<br /><em>Ваник</em></p>
        </div>}
      </section>
      <footer className="autumn-footer"><span>Листья падают. Любовь остаётся.</span><a href="new-album.html">Продолжить нашу историю ↗</a><small>Vanik & Arina · наш маленький мир</small></footer>
    </>}
  </main>;
}
