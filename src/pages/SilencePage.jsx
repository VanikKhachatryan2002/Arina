import { useEffect, useMemo, useState } from "react";
import sourceRose from "../assets/source-rose.svg?raw";

function RoseBloom() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  const fasterRose = sourceRose.replaceAll("dur='12000ms'", "dur='4800ms'");
  return <div className="source-rose-wrap" dangerouslySetInnerHTML={{ __html: fasterRose }} />;
}

export function SilencePage() {
  const [replay, setReplay] = useState(0);
  const sparks = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    id: index, left: `${5 + ((index * 37) % 91)}%`, delay: `${(index % 8) * -1.1}s`,
    duration: `${7 + (index % 6)}s`, size: `${2 + (index % 3)}px`,
  })), []);
  const falling = useMemo(() => Array.from({ length: 9 }, (_, index) => ({
    id: index, left: `${10 + ((index * 29) % 80)}%`, delay: `${8.1 + (index % 5) * .85}s`,
    drift: `${-45 + ((index * 31) % 90)}px`,
  })), []);

  return (
    <main className="silence-page" key={replay}>
      <div className="silence-glow" aria-hidden="true" />
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
