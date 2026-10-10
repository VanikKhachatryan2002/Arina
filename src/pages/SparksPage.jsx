import { useCallback, useEffect, useRef, useState } from "react";
import { KissParticles } from "../components/KissParticles.jsx";

export function SparksPage() {
  const audioRef = useRef(null);
  const letterRef = useRef(null);
  const headingRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [finished, setFinished] = useState(false);
  const [replay, setReplay] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const complete = useCallback(() => setFinished(true), []);
  async function playMusic() {
    try { await audioRef.current.play(); setAudioError(false); }
    catch { setAudioError(true); }
  }
  function enter() { setEntered(true); playMusic(); }
  function restart() { setFinished(false); setReplay(value => value + 1); }
  useEffect(() => { if (entered) headingRef.current?.focus({ preventScroll: true }); }, [entered]);
  useEffect(() => {
    if (!letterOpen) return;
    letterRef.current?.focus({ preventScroll: true });
    letterRef.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [letterOpen]);

  return <main className={`sparks-page ${entered ? "is-entered" : ""}`}>
    <audio ref={audioRef} src="audio/solamente-tu.mp3" preload="none" loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setAudioError(true); setPlaying(false); }} />
    <div className="sparks-sky" aria-hidden="true"><div className="sparks-halo" />{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ left: `${(i * 31.7) % 100}%`, top: `${(i * 17.1) % 100}%`, "--delay": `${-i * .4}s`, "--size": `${i % 8 === 0 ? 3 : 1}px` }} />)}</div>
    {!entered ? <section className="sparks-invitation" aria-labelledby="sparks-invite-title">
      <span className="sparks-seal" aria-hidden="true">✧</span>
      <p className="sparks-eyebrow">для Арины · от того, кто всегда выбирает тебя</p>
      <h1 id="sparks-invite-title">У каждой искры<br />есть путь.<br /><em>Мой — к тебе.</em></h1>
      <p className="sparks-invite-copy">Одно прикосновение —<br />и наша маленькая вселенная оживёт.</p>
      <button className="sparks-primary" onClick={enter}>Зажечь нашу любовь <span aria-hidden="true">✧</span></button>
      <span className="sparks-music-note">под нашу мелодию · Solamente Tú</span>
      <a className="sparks-back" href="index.html">← В наш маленький мир</a>
    </section> : <>
      <nav className="sparks-nav" aria-label="Навигация"><a href="index.html">← Наш маленький мир</a><span>V <i>&</i> A</span><button onClick={() => playing ? audioRef.current.pause() : playMusic()} aria-pressed={playing} aria-label={playing ? "Приостановить Solamente Tú" : "Включить Solamente Tú"}><span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span> Solamente Tú</button></nav>
      {audioError && <p className="sparks-audio-error" role="status">Музыка пока не включилась. Нажми на Solamente Tú, чтобы попробовать ещё раз.</p>}
      <section className="sparks-scene" aria-labelledby="sparks-title">
        <header className="sparks-scene-heading"><p className="sparks-eyebrow">две души. одна маленькая вселенная.</p><h1 id="sparks-title" ref={headingRef} tabIndex={-1}>Из тысячи искр — <em>мы.</em></h1><p>Даже через расстояние всё во мне тянется к тебе.</p></header>
        <div className={`sparks-art ${finished ? "is-formed" : ""}`}><span className="sparks-orbit sparks-orbit-one" aria-hidden="true" /><span className="sparks-orbit sparks-orbit-two" aria-hidden="true" /><KissParticles key={replay} onComplete={complete} />
          <div className="sparks-art-note" aria-live="polite">{finished ? "каждая искра нашла своё место" : "смотри, как наши искры находят друг друга"}</div>
        </div>
        <div className={`sparks-promise ${finished ? "is-visible" : ""}`} aria-hidden={!finished}><span aria-hidden="true">♡</span><p>Из тысячи дорог я снова выберу ту,<br /><em>что ведёт к тебе.</em></p><small>Ваник — своей Арине</small></div>
        <div className="sparks-actions"><button className="sparks-replay" onClick={restart}><span aria-hidden="true">↻</span> Прожить этот момент снова</button><button className="sparks-primary" onClick={() => setLetterOpen(true)} aria-expanded={letterOpen} aria-controls="sparks-letter">Мои слова для тебя <span aria-hidden="true">↗</span></button></div>
      </section>
      {letterOpen && <section className="sparks-letter" id="sparks-letter" ref={letterRef} tabIndex={-1} aria-labelledby="sparks-letter-title">
        <p className="sparks-eyebrow">письмо, которое хочется прошептать</p><h2 id="sparks-letter-title">Только <em>ты.</em></h2>
        <div className="sparks-letter-copy"><p>Моя Арина,</p><p>Если бы можно было собрать всё, что я чувствую к тебе, из маленьких искр, ими можно было бы осветить целое небо. Но я бы всё равно собрал их здесь — в одном тихом моменте, где я рядом и нежно целую тебя в лоб.</p><p>Помнишь, как всё началось с простого приветствия? Тогда между нами были незнакомые миры. А потом появились наши разговоры, твои розы, наши признания, музыка и мечты. Шаг за шагом ты стала человеком, к которому тянется всё моё сердце.</p><p>Я мечтаю о том дне, когда для объятия больше не понадобится воображение. Когда смогу притянуть тебя к себе и просто побыть рядом. Без спешки. Слушая нашу песню и твой голос совсем близко.</p><p>Среди всех людей, дорог и случайностей — я снова выбрал бы тебя. Твою душу. Твоё тепло. Нашу любовь.</p><p className="sparks-signature">Только ты. Всегда ты.<br /><em>Твой Ваник</em></p></div>
      </section>}
      <footer className="sparks-footer"><span>Наше небо начинается с тебя.</span><a href="new-album.html">Книга нашей любви ↗</a><small>Vanik & Arina · любовь, которая находит путь</small></footer>
    </>}
  </main>;
}
