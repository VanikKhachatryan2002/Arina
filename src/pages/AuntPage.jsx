import { useMemo, useState } from "react";

const LETTER = [
  "Я никогда не был знаком с Вами лично, но благодаря Арине я понял, насколько важным человеком Вы были в её жизни. В её воспоминаниях о Вас живут любовь, забота, защита и тепло. Вы были рядом с ней в детстве, дарили ей радость и помогали ей чувствовать себя в безопасности.",
  "Спасибо Вам за всё добро, которое Вы оставили в её сердце. Частица Вашего света продолжает жить в ней — в её нежности, доброте, силе и способности любить.",
  "Сейчас наши с Ариной дороги разошлись. Мне очень больно оттого, что я больше не могу быть рядом и заботиться о ней так, как хотел. Но больше всего на свете я по-прежнему желаю ей здоровья, спокойствия и безопасной жизни.",
  "Поэтому я прошу Вас: если Вы можете видеть её с небес, пожалуйста, оставайтесь рядом. Оберегайте Арину, когда ей страшно. Дайте ей силы, когда она устанет. Напомните ей о свете, когда вокруг станет темно. Помогите ей беречь себя, своё здоровье и своё доброе сердце.",
  "Я не прошу вернуть прошлое и не хочу мешать её пути. Я прошу только об одном — пусть она будет жива, здорова и в безопасности. Пусть однажды она снова сможет улыбаться спокойно и искренне.",
  "Спасибо, что когда-то берегли её на земле. Пожалуйста, продолжайте беречь её с небес.",
];

export function AuntPage() {
  const [candleLit, setCandleLit] = useState(false);
  const feathers = useMemo(() => Array.from({ length: 15 }, (_, index) => ({
    id: index,
    left: `${4 + ((index * 31) % 92)}%`,
    delay: `${-((index * 1.7) % 13)}s`,
    duration: `${11 + (index % 6)}s`,
    drift: `${-38 + ((index * 23) % 76)}px`,
    size: `${10 + (index % 4) * 3}px`,
  })), []);

  return (
    <main className="memorial-page">
      <div className="memorial-sky" aria-hidden="true" />
      <div className="memorial-feathers" aria-hidden="true">
        {feathers.map((feather) => (
          <i key={feather.id} style={{
            left: feather.left,
            animationDelay: feather.delay,
            animationDuration: feather.duration,
            "--drift": feather.drift,
            "--size": feather.size,
          }} />
        ))}
      </div>

      <nav className="memorial-nav" aria-label="Навигация">
        <a href="index.html">← На главную</a>
        <span>Светлая память</span>
      </nav>

      <header className="memorial-hero">
        <p className="memorial-kicker">Тому свету, который остаётся с нами</p>
        <h1>Береги её с небес</h1>
        <div className="memorial-portrait">
          <span className="memorial-halo" aria-hidden="true" />
          <img src="photos/aunt.webp" alt="Светлая память тёте Арины" />
        </div>
        <p className="memorial-intro">Любовь не исчезает. Она остаётся в памяти, в доброте и в тихом свете, который помогает идти дальше.</p>
      </header>

      <article className="memorial-letter" aria-labelledby="letter-title">
        <p className="memorial-overline">Тихое обращение</p>
        <h2 id="letter-title">Дорогая тётя Арины,</h2>
        {LETTER.map((paragraph, index) => (
          <p key={paragraph} className="memorial-paragraph" style={{ "--reveal-delay": `${index * 90}ms` }}>{paragraph}</p>
        ))}
        <p className="memorial-signature">С уважением и благодарностью,<br /><strong>Ваник</strong></p>
      </article>

      <section className="memorial-vigil" aria-label="Свеча памяти">
        <button
          className={`memorial-candle${candleLit ? " is-lit" : ""}`}
          type="button"
          aria-pressed={candleLit}
          onClick={() => setCandleLit((value) => !value)}
        >
          <span className="candle-flame" aria-hidden="true" />
          <span className="candle-wick" aria-hidden="true" />
          <span className="candle-body" aria-hidden="true" />
          <span className="sr-only">{candleLit ? "Погасить свечу" : "Зажечь свечу памяти"}</span>
        </button>
        <p aria-live="polite">{candleLit ? "Свет любви не гаснет" : "Коснитесь свечи, чтобы зажечь свет памяти"}</p>
      </section>

      <footer className="memorial-final">
        <span className="memorial-star" aria-hidden="true">✦</span>
        <p>Пусть она будет жива, здорова и в безопасности.</p>
        <a href="index.html">Вернуться к Арине</a>
      </footer>
    </main>
  );
}
