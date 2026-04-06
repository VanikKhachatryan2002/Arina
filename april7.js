const page = document.querySelector('.page');
const petalsRoot = document.getElementById('petals');
const glitterRoot = document.getElementById('glitter');
const openLetterBtn = document.getElementById('openLetter');
const closeLetterBtn = document.getElementById('closeLetter');
const letterModal = document.getElementById('letterModal');
const letterBackdrop = document.getElementById('letterBackdrop');
const petalBurstBtn = document.getElementById('petalBurst');
const roseBurstBtn = document.getElementById('roseBurst');
const blessingBtn = document.getElementById('blessingBtn');
const blessings = document.getElementById('blessings');
const blessingNote = document.getElementById('blessingNote');
const pageDate = document.getElementById('pageDate');
const revealNodes = document.querySelectorAll('.reveal');
const musicToggle = document.getElementById('musicToggle');
const bgm = document.getElementById('bgm');

const spawnGlitter = () => {
  if (!glitterRoot) return;

  for (let i = 0; i < 24; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'glitter-dot';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 4}s`;
    dot.style.animationDuration = `${3 + Math.random() * 4}s`;
    glitterRoot.appendChild(dot);
  }
};

const spawnPetal = () => {
  if (!petalsRoot) return;

  const petal = document.createElement('span');
  petal.className = 'falling-petal';
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${6 + Math.random() * 4}s`;
  petal.style.setProperty('--drift', `${-100 + Math.random() * 200}px`);
  petalsRoot.appendChild(petal);
  petal.addEventListener('animationend', () => petal.remove());
};

const burstPetals = (count = 18) => {
  for (let i = 0; i < count; i += 1) {
    window.setTimeout(spawnPetal, i * 80);
  }
};

const spawnRose = () => {
  if (!petalsRoot) return;

  const rose = document.createElement('span');
  rose.className = 'rose-float';
  const flowers = ['💐', '🌷', '🌹', '🌸', '🌺'];
  rose.textContent = flowers[Math.floor(Math.random() * flowers.length)];
  rose.style.left = `${Math.random() * 100}%`;
  rose.style.setProperty('--size', `${20 + Math.random() * 18}px`);
  rose.style.setProperty('--dur', `${9 + Math.random() * 4}s`);
  rose.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
  petalsRoot.appendChild(rose);
  rose.addEventListener('animationend', () => rose.remove());
};

const burstRoses = (count = 10) => {
  for (let i = 0; i < count; i += 1) {
    window.setTimeout(spawnRose, i * 120);
  }
};

const sparkleRoses = (count = 12) => {
  if (!petalsRoot) return;

  for (let i = 0; i < count; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'rose-spark';
    spark.style.left = `${42 + Math.random() * 16}%`;
    spark.style.top = `${30 + Math.random() * 28}%`;
    spark.style.setProperty('--driftX', `${-90 + Math.random() * 180}px`);
    spark.style.setProperty('--driftY', `${-110 + Math.random() * 120}px`);
    spark.style.setProperty('--dur', `${2.2 + Math.random() * 1.4}s`);
    petalsRoot.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove());
  }
};

const openLetter = () => {
  if (!letterModal) return;
  letterModal.hidden = false;
  document.body.style.overflow = 'hidden';
  burstPetals(12);
};

const closeLetter = () => {
  if (!letterModal) return;
  letterModal.hidden = true;
  document.body.style.overflow = '';
};

if (openLetterBtn) {
  openLetterBtn.addEventListener('click', openLetter);
}

if (closeLetterBtn) {
  closeLetterBtn.addEventListener('click', closeLetter);
}

if (letterBackdrop) {
  letterBackdrop.addEventListener('click', closeLetter);
}

if (petalBurstBtn) {
  petalBurstBtn.addEventListener('click', () => {
    burstPetals(24);
    burstRoses(8);
  });
}

if (roseBurstBtn) {
  roseBurstBtn.addEventListener('click', () => {
    burstRoses(14);
    sparkleRoses(14);
  });
}

if (blessingBtn) {
  blessingBtn.addEventListener('click', () => {
    blessingNote.textContent =
      'Пусть ты будешь окружена любовью, мягкостью, здоровьем и тем будущим светом, которого достойно твоё сердце.';
    burstPetals(14);
    burstRoses(8);
    sparkleRoses(12);
    blessingBtn.disabled = true;
  });
}

if (blessings) {
  blessings.addEventListener('click', (event) => {
    const button = event.target.closest('.petal-card');
    if (!button) return;

    blessings.querySelectorAll('.petal-card').forEach((item) => {
      if (item !== button) item.classList.remove('is-open');
    });

    const isOpen = button.classList.toggle('is-open');
    blessingNote.textContent = isOpen
      ? button.getAttribute('data-text')
      : 'Здесь будут появляться мои самые тихие слова для тебя.';
  });
}

if (pageDate) {
  pageDate.textContent = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const setMusicState = (playing) => {
  if (!musicToggle) return;
  musicToggle.classList.toggle('is-playing', playing);
  musicToggle.textContent = playing ? '♫ Музыка' : '▷ Музыка';
  musicToggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
};

const tryPlayMusic = async () => {
  if (!bgm) return false;

  try {
    bgm.volume = 0.72;
    await bgm.play();
    setMusicState(true);
    return true;
  } catch {
    setMusicState(false);
    return false;
  }
};

const stopMusic = () => {
  if (!bgm) return;
  bgm.pause();
  setMusicState(false);
};

if (musicToggle && bgm) {
  tryPlayMusic();

  musicToggle.addEventListener('click', async () => {
    if (bgm.paused) {
      await tryPlayMusic();
      return;
    }

    stopMusic();
  });

  const unlockMusic = async () => {
    if (!bgm.paused) return;
    const ok = await tryPlayMusic();
    if (ok) {
      document.removeEventListener('pointerdown', unlockMusic);
      document.removeEventListener('keydown', unlockMusic);
    }
  };

  document.addEventListener('pointerdown', unlockMusic, { passive: true });
  document.addEventListener('keydown', unlockMusic, { passive: true });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal--active');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

revealNodes.forEach((node) => {
  if (!node.classList.contains('reveal--active')) {
    revealObserver.observe(node);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && letterModal && !letterModal.hidden) {
    closeLetter();
  }
});

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (bgm && !bgm.paused) {
      bgm.pause();
      setMusicState(false);
    }
    return;
  }

  if (bgm && bgm.paused) {
    tryPlayMusic();
  }
});

spawnGlitter();
burstPetals(10);
burstRoses(6);
sparkleRoses(8);
page?.classList.add('is-loaded');
