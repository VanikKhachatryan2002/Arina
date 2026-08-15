import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ACCESS_HASH = "660a2b5d71278c47e7e54b0d24964ad62d05d62ccd4a8b947ec19c4f9edd6dad";
const ACCESS_KEY = "book_ok_v2";

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
}

async function hash(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function AccessGate({ onUnlock }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setChecking(true);
    const valid = await hash(code.trim()) === ACCESS_HASH;
    setChecking(false);
    if (!valid) {
      setError("Код не подошёл. Попробуй ещё раз.");
      setCode("");
      return;
    }
    try { sessionStorage.setItem(ACCESS_KEY, "1"); } catch {}
    onUnlock();
  }

  return <main className="na-gate">
    <div className="na-gate__glow" />
    <form className="na-gate__card" onSubmit={submit}>
      <span className="na-gate__seal">♥</span>
      <p className="na-eyebrow">Только для нас двоих</p>
      <h1>Наша история ждёт</h1>
      <p>Введи наш код, чтобы открыть альбом воспоминаний.</p>
      <label>
        <span>Код доступа</span>
        <input autoFocus type="password" value={code} onChange={(e) => { setCode(e.target.value); setError(""); }} />
      </label>
      {error && <p className="na-gate__error" role="alert">{error}</p>}
      <button disabled={!code || checking}>{checking ? "Проверяем…" : "Открыть альбом"}</button>
      <a href="index.html">← Вернуться на главную</a>
    </form>
  </main>;
}

const ornaments = ["✿", "❀", "✦", "·", "✽", "✧", "❁", "·", "✦", "❀", "✿", "✧", "·", "❁", "✽", "✦"];

function Intro({ album, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <section className="na-intro" aria-label="Анимация открытия альбома">
    <div className="na-intro__dust" />
    {ornaments.map((item, index) => <i key={index} style={{ "--i": index }}>{item}</i>)}
    <div className="na-heart-wrap" aria-hidden="true">
      <span className="na-heart-orbit na-heart-orbit--one" />
      <span className="na-heart-orbit na-heart-orbit--two" />
      <div className="na-heart"><span>♥</span><b>В И А</b></div>
      <span className="na-heart-star na-heart-star--one">✦</span>
      <span className="na-heart-star na-heart-star--two">✧</span>
      <span className="na-heart-star na-heart-star--three">✦</span>
    </div>
    <div className="na-intro__copy">
      <p>С любовью для тебя</p>
      <h1>{album.cover?.title || "Наша история"}</h1>
    </div>
    <button onClick={onComplete}>Открыть сейчас</button>
  </section>;
}

function Media({ side, onView }) {
  if (!side) return <div className="na-empty"><span>♥</span></div>;
  const source = side.video || side.src;
  if (side.video) {
    return <video controls playsInline preload="metadata" poster={side.poster || ""} aria-label={side.label || "Видео воспоминание"}>
      <source src={side.video} />
    </video>;
  }
  return <button className="na-photo" onClick={() => onView(side)} aria-label={`Открыть фото: ${side.label || "воспоминание"}`}>
    <img src={source} alt={side.label || "Наше воспоминание"} draggable="false" decoding="async" />
  </button>;
}

function PaperPage({ side, position, spread, onView }) {
  return <article className={`na-paper na-paper--${position}`}>
    <span className="na-tape" />
    <div className="na-paper__date">{formatDate(spread.date)}</div>
    <div className="na-paper__media"><Media side={side} onView={onView} /></div>
    <p className="na-paper__caption">{side?.label || "Воспоминание, которое останется с нами"}</p>
    <span className="na-paper__flower">{position === "left" ? "❀" : "✿"}</span>
  </article>;
}

function FlipMedia({ side }) {
  const source = side?.poster || side?.src;
  return <div className="na-flip-media">
    {source ? <img src={source} alt="" decoding="async" /> : <span>♥</span>}
  </div>;
}

function FlipBloom({ direction }) {
  if (!direction) return null;
  return <div className={`na-flip-bloom na-flip-bloom--${direction}`} aria-hidden="true">
    {["✿", "❀", "✦", "❁", "✽", "✧", "❀", "✿", "✦"].map((petal, petalIndex) => (
      <i key={petalIndex} style={{ "--petal": petalIndex }}>{petal}</i>
    ))}
  </div>;
}

function TurningPage({ turn, current, target, onComplete }) {
  if (!turn) return null;
  const forward = turn.direction === "next";
  const front = forward ? current.right : current.left;
  const back = forward ? target.left : target.right;
  return <div
    className={`na-turning-page na-turning-page--${turn.direction}`}
    aria-hidden="true"
    onAnimationEnd={(event) => {
      if (event.target === event.currentTarget) onComplete(turn.target);
    }}
  >
    <div className="na-turning-page__face na-turning-page__front">
      <span className="na-tape" />
      <small>{formatDate(current.date)}</small>
      <FlipMedia side={front} />
      <p>{front?.label || "Наше воспоминание"}</p>
    </div>
    <div className="na-turning-page__face na-turning-page__back">
      <span className="na-tape" />
      <small>{formatDate(target.date)}</small>
      <FlipMedia side={back} />
      <p>{back?.label || "Наше воспоминание"}</p>
    </div>
  </div>;
}

export default function NewAlbumPage({ album }) {
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(ACCESS_KEY) === "1"; } catch { return false; }
  });
  const [intro, setIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const touchStart = useRef(null);
  const turnTimer = useRef(null);
  const midpointTimer = useRef(null);
  const spreads = album.spreads || [];
  const spread = spreads[index];

  const finishIntro = useCallback(() => setIntro(false), []);
  const go = useCallback((nextIndex) => {
    const target = Math.max(0, Math.min(spreads.length - 1, nextIndex));
    if (target === index || turn) return;
    const direction = target > index ? "next" : "previous";
    setTurn({ direction, source: index, target });
    setShowNote(false);
    midpointTimer.current = window.setTimeout(() => {
      setIndex(target);
    }, 540);
    // Safety fallback only; the normal swap is synchronized to animationend.
    turnTimer.current = window.setTimeout(() => {
      setIndex(target);
      setTurn(null);
    }, 1450);
  }, [index, spreads.length, turn]);

  useEffect(() => () => {
    window.clearTimeout(midpointTimer.current);
    window.clearTimeout(turnTimer.current);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (viewer || showNote || showChapters) {
        if (event.key === "Escape") { setViewer(null); setShowNote(false); setShowChapters(false); }
        return;
      }
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, index, viewer, showNote, showChapters]);

  useEffect(() => {
    [index - 1, index + 1].forEach((position) => {
      const item = spreads[position];
      [item?.left, item?.right].forEach((side) => {
        if (side?.src) { const image = new Image(); image.src = side.src; }
      });
    });
  }, [index, spreads]);

  const chapterGroups = useMemo(() => spreads.map((item, itemIndex) => ({
    title: item.chapter || `Глава ${itemIndex + 1}`,
    date: formatDate(item.date),
    index: itemIndex,
    thumb: item.left?.src || item.right?.src || album.cover?.image,
  })), [album.cover?.image, spreads]);

  const targetSpread = spreads[turn?.target] || spread;
  const sourceSpread = spreads[turn?.source] || spread;
  const stagedLeft = turn?.direction === "previous" ? targetSpread : spread;
  const stagedRight = turn?.direction === "next" ? targetSpread : spread;

  const finishTurn = useCallback((target) => {
    window.clearTimeout(midpointTimer.current);
    window.clearTimeout(turnTimer.current);
    setIndex(target);
    setTurn(null);
  }, []);

  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;
  if (intro) return <Intro album={album} onComplete={finishIntro} />;

  return <main className="na-app">
    <div className="na-ambient" aria-hidden="true"><span>✿</span><span>❀</span><span>✦</span><span>❁</span></div>
    <header className="na-header">
      <a href="index.html" className="na-back" aria-label="На главную">←</a>
      <div><p>Ваник и Арина</p><h1>Наша живая история</h1></div>
      <button className="na-icon-btn" onClick={() => setShowChapters(true)} aria-label="Открыть главы">☷</button>
    </header>

    <section className="na-scene" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
      if (touchStart.current == null) return;
      const distance = event.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(distance) > 55) go(index + (distance < 0 ? 1 : -1));
      touchStart.current = null;
    }}>
      <div className="na-polaroid na-polaroid--one"><img src={album.cover?.image} alt="" /></div>
      <div className="na-envelope"><span>для тебя</span></div>
      <div className="na-book">
        <div className="na-book__pages">
          <PaperPage side={stagedLeft.left} position="left" spread={stagedLeft} onView={setViewer} />
          <PaperPage side={stagedRight.right} position="right" spread={stagedRight} onView={setViewer} />
        </div>
        <TurningPage turn={turn} current={sourceSpread} target={targetSpread} onComplete={finishTurn} />
        <FlipBloom direction={turn?.direction} />
      </div>
    </section>

    <section className="na-story-meta">
      <p className="na-eyebrow">Воспоминание {index + 1} из {spreads.length}</p>
      <h2>{spread.chapter}</h2>
      <div className="na-controls">
        <button onClick={() => go(index - 1)} disabled={index === 0 || turn}>← <span>Назад</span></button>
        <button className="na-note-btn" onClick={() => setShowNote(true)} disabled={!spread.note}>Прочитать историю ♡</button>
        <button onClick={() => go(index + 1)} disabled={index === spreads.length - 1 || turn}><span>Дальше</span> →</button>
      </div>
      <div className="na-progress"><span style={{ width: `${((index + 1) / spreads.length) * 100}%` }} /></div>
    </section>

    {showNote && <div className="na-modal" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowNote(false); }}>
      <article className="na-letter">
        <button onClick={() => setShowNote(false)} aria-label="Закрыть">×</button>
        <p className="na-eyebrow">{formatDate(spread.date)}</p>
        <h2>{spread.chapter}</h2>
        <div>{spread.note.split("\n").map((line, lineIndex) => <p key={lineIndex}>{line || " "}</p>)}</div>
        <span className="na-signature">С любовью, Ваник</span>
      </article>
    </div>}

    {showChapters && <div className="na-modal" role="dialog" aria-modal="true">
      <section className="na-chapters">
        <header><div><p className="na-eyebrow">Все наши моменты</p><h2>Главы истории</h2></div><button onClick={() => setShowChapters(false)}>×</button></header>
        <div className="na-chapters__grid">{chapterGroups.map((chapter) => <button key={`${chapter.title}-${chapter.index}`} onClick={() => { go(chapter.index); setShowChapters(false); }}>
          <img src={chapter.thumb} alt="" loading="lazy" decoding="async" /><span><b>{chapter.title}</b><small>{chapter.date}</small></span>
        </button>)}</div>
      </section>
    </div>}

    {viewer && <div className="na-viewer" role="dialog" aria-modal="true" onClick={() => setViewer(null)}>
      <button aria-label="Закрыть">×</button><img src={viewer.src} alt={viewer.label || "Наше воспоминание"} />
    </div>}
  </main>;
}
