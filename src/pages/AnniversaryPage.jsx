import { useEffect, useMemo, useRef, useState } from "react";
import { ParametricLoveHeart } from "../components/ParametricLoveHeart.jsx";

const LETTER = [
  "Арина, любовь моя, мой воздух…",
  "Сегодня исполняется ровно один год нашей любви. Год назад, в этот день, я принял самое правильное решение в своей жизни — решил, что именно ты являешься моим будущим. Я предложил тебе быть вместе и начать наш общий путь любви.",
  "За этот год мы прошли через многое. Были счастливые моменты, были трудности и испытания, но наша любовь каждый раз оказывалась сильнее всего. Я благодарен тебе за эту сильную, искреннюю и неповторимую любовь. За то, что ты появилась в моей жизни, стала её важнейшей частью и наполнила её особенным смыслом.",
  "Я знаю, что впереди у нас ещё много испытаний, которые мы должны пройти вместе. Мы поднимаемся на вершину нашей любви, а дорога к вершине не может быть абсолютно ровной и лёгкой. Но пока мы рядом, пока держим друг друга за руки, мы сможем преодолеть любые трудности и достичь нашей общей мечты — быть вместе, создать нашу семью и наполнить её теплом, заботой и настоящей любовью.",
  "Я люблю тебя всем сердцем. Пожалуйста, всегда держи меня за руку.",
  "И пусть однажды мы отметим не только первую годовщину нашей любви, но и её шестидесятилетие… Хотя я немного поскромничаю — пусть впереди у нас будет ещё намного больше счастливых лет.",
  "С нашей первой годовщиной, любовь моя. Спасибо тебе за этот год. Это только начало нашей долгой и прекрасной истории.",
];

const MILESTONES = [
  ["20 апреля 2025", "Первый привет", "Два незнакомых мира нашли общий язык — и началась наша история."],
  ["30 июля 2025", "Слова сердца", "Мы перестали прятать чувства и признались, что это уже настоящая любовь."],
  ["4 августа 2025", "Рождение нашего «мы»", "Ты сказала: «Давай попробуем». В этот день начался путь нашей пары."],
  ["4 августа 2026", "Один год любви", "365 дней, в которых наша любовь снова и снова выбирала остаться сильнее испытаний."],
];

function useRevealOnScroll() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll("[data-reveal]")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

export function AnniversaryPage() {
  const [connected, setConnected] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const letterRef = useRef(null);
  const audioRef = useRef(null);
  const lights = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    id: index,
    x: `${(index * 37) % 101}%`,
    delay: `${(index % 9) * -0.7}s`,
    duration: `${7 + (index % 6)}s`,
    size: `${2 + (index % 3)}px`,
  })), []);
  const celebration = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    id: index,
    symbol: index % 5 === 0 ? "🌹" : index % 3 === 0 ? "💕" : "♥",
    x: `${8 + ((index * 31) % 84)}%`,
    drift: `${-90 + ((index * 47) % 180)}px`,
    delay: `${(index % 10) * 70}ms`,
    duration: `${1900 + (index % 7) * 180}ms`,
  })), []);

  useRevealOnScroll();

  useEffect(() => {
    if (!connected) return undefined;
    const openTimer = window.setTimeout(() => setLetterOpen(true), 80);
    const scrollTimer = window.setTimeout(() => letterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(scrollTimer);
    };
  }, [connected]);

  function connectHands() {
    setConnected(true);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setMusicPlaying(true);
      } else {
        audio.pause();
        setMusicPlaying(false);
      }
    } catch (error) {
      console.error("Music playback was blocked", error);
    }
  }

  return (
    <main className="anniversary-page">
      <audio ref={audioRef} src="audio/song.mp3" preload="metadata" loop onPause={() => setMusicPlaying(false)} onPlay={() => setMusicPlaying(true)} />
      <div className="aurora" aria-hidden="true" />
      <div className="love-lights" aria-hidden="true">
        {lights.map((light) => <i key={light.id} style={{ left: light.x, animationDelay: light.delay, animationDuration: light.duration, width: light.size, height: light.size }} />)}
      </div>
      {connected && <div className="connection-celebration connection-celebration--viewport" aria-hidden="true">
        {celebration.map((item) => <i key={item.id} style={{ left: item.x, "--drift": item.drift, animationDelay: item.delay, animationDuration: item.duration }}>{item.symbol}</i>)}
      </div>}

      <nav className="anniversary-nav" aria-label="Навигация">
        <a href="index.html">← На главную</a>
        <span>Vanik <b>∞</b> Arina</span>
        <div className="nav-actions">
          <button className={`music-button ${musicPlaying ? "is-playing" : ""}`} onClick={toggleMusic} aria-pressed={musicPlaying}>
            <i aria-hidden="true">{musicPlaying ? "❚❚" : "♪"}</i>
            {musicPlaying ? "Музыка звучит" : "Наша музыка"}
          </button>
          <a href="album.html#2026-08-04-one-year-love">Наша книга →</a>
        </div>
      </nav>

      <header className="anniversary-hero">
        <div className="orbit" aria-hidden="true">
          <span className="orbit__year">1</span>
          <span className="orbit__label">год</span>
          <i className="orbit__heart">♥</i>
        </div>
        <p className="hero-kicker">4 августа 2025 — 4 августа 2026</p>
        <h1>Год, в котором<br /><em>мы выбрали любовь</em></h1>
        <p className="hero-copy">Не идеальный путь — настоящий. С радостью и испытаниями, расстоянием и надеждой. Но на каждом повороте наши сердца снова находили друг друга.</p>
        <a className="hero-scroll" href="#our-year">Пройти наш путь <span>↓</span></a>
      </header>

      <section className="anniversary-gallery" data-reveal aria-label="Наши воспоминания">
        <figure className="memory memory--tall">
          <img src="photos/album/2026/04/one-year-love.webp" alt="Год нашей истории" />
          <figcaption>Из одного сообщения — в целую вселенную</figcaption>
        </figure>
        <figure className="memory">
          <img src="photos/album/2026/10/holding-hands.webp" alt="Руки, которые держат друг друга" />
          <figcaption>Я всё ещё держу тебя за руку</figcaption>
        </figure>
        <figure className="memory">
          <img src="photos/album/2026/10/together-forever.webp" alt="Вместе навсегда" />
          <figcaption>Иду с тобой к нашему будущему</figcaption>
        </figure>
      </section>

      <section className="year-path" id="our-year">
        <div className="section-heading" data-reveal>
          <p>Четыре точки одной судьбы</p>
          <h2>Дорога к нашей вершине</h2>
        </div>
        <div className="timeline">
          {MILESTONES.map(([date, title, copy], index) => (
            <article className="milestone" data-reveal key={date} style={{ "--delay": `${index * 90}ms` }}>
              <span className="milestone__number">0{index + 1}</span>
              <time>{date}</time>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <ParametricLoveHeart />

      <section className={`promise-scene ${connected ? "is-connected" : ""}`} data-reveal>
        <div className="mountains" aria-hidden="true"><i /><i /><i /></div>
        <p className="promise-kicker">Одно обещание на все наши годы</p>
        <h2>Пожалуйста,<br />всегда держи меня за руку</h2>
        <div className="hands" aria-hidden="true">
          <span className="hand hand--left">🤝</span>
          <span className="hand hand--right">🤝</span>
          <i className="heart-line">♥</i>
        </div>
        {!connected ? (
          <button className="connect-button" onClick={connectHands}>Соединить наши сердца</button>
        ) : <p className="connected-message">Рядом. Через всё. Навсегда.</p>}
      </section>

      <section ref={letterRef} className={`anniversary-letter ${letterOpen ? "is-open" : ""}`} aria-hidden={!letterOpen}>
        <div className="letter-seal" aria-hidden="true">V <span>♥</span> A</div>
        <p className="letter-overline">Письмо в нашу первую годовщину</p>
        <div className="letter-body">
          {LETTER.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          <p className="letter-signature">Твой Ваник<br /><span>4 августа 2026</span></p>
        </div>
      </section>

      <footer className="anniversary-footer">
        <span>365 дней позади</span><i>♥</i><span>вечность впереди</span>
      </footer>
    </main>
  );
}
