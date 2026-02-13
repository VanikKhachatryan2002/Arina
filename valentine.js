const toggleLetter = document.getElementById('toggleLetter');
const hearts = document.getElementById('hearts');
const petals = document.getElementById('petals');
const bloom = document.getElementById('bloom');
const sparkleBtn = document.getElementById('sparkleBtn');
const vows = document.getElementById('vows');
const vowNote = document.getElementById('vowNote');
const dateEl = document.getElementById('date');
const heartShow = document.getElementById('heartShow');
const heartModal = document.getElementById('heartModal');
const heartClose = document.getElementById('heartClose');
const heartBackdrop = document.querySelector('[data-close="heart"]');
const pinkboard = document.getElementById('pinkboard');
const valentineCard = document.getElementById('valentineCard');
const valentineInner = valentineCard?.querySelector('.valentines');
const musicToggle = document.getElementById('musicToggle');
const bgm = document.getElementById('bgm');

toggleLetter.addEventListener('click', () => {
  if (valentineInner) {
    valentineInner.classList.add('open');
    valentineInner.setAttribute('aria-expanded', 'true');
    valentineInner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

const spawnHeart = () => {
  const heart = document.createElement('div');
  heart.className = 'heart-float';
  heart.textContent = Math.random() > 0.5 ? '❤' : '💗';
  const size = 14 + Math.random() * 22;
  heart.style.setProperty('--size', `${size}px`);
  heart.style.setProperty('--dur', `${6 + Math.random() * 6}s`);
  heart.style.setProperty('--drift', `${-120 + Math.random() * 240}px`);
  heart.style.left = `${Math.random() * 100}%`;
  hearts.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
};

const spawnPetal = () => {
  const petal = document.createElement('div');
  petal.className = 'petal-float';
  petal.style.setProperty('--dur', `${5 + Math.random() * 4}s`);
  petal.style.setProperty('--drift', `${-140 + Math.random() * 280}px`);
  petal.style.left = `${Math.random() * 100}%`;
  petals.appendChild(petal);
  petal.addEventListener('animationend', () => petal.remove());
};

let heartTimer = window.setInterval(spawnHeart, 900);

bloom.addEventListener('click', () => {
  for (let i = 0; i < 18; i += 1) {
    setTimeout(spawnPetal, i * 80);
  }
});

sparkleBtn.addEventListener('click', () => {
  for (let i = 0; i < 10; i += 1) {
    setTimeout(spawnHeart, i * 120);
  }
});

vows.addEventListener('click', (event) => {
  const button = event.target.closest('.vow');
  if (!button) return;
  const open = button.classList.toggle('open');
  const text = button.getAttribute('data-text');
  vowNote.textContent = open ? text : 'Нажми на символ — и я прошепчу обещание.';
});

if (valentineInner) {
  const setCardOpen = (open) => {
    valentineInner.classList.toggle('open', open);
    valentineInner.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  valentineInner.addEventListener('mouseenter', () => setCardOpen(true));
  valentineInner.addEventListener('mouseleave', () => setCardOpen(false));
  valentineInner.addEventListener('click', () => {
    const isOpen = valentineInner.classList.contains('open');
    setCardOpen(!isOpen);
  });
  valentineInner.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const isOpen = valentineInner.classList.contains('open');
      setCardOpen(!isOpen);
    }
  });
}

const setMusicPlaying = async (playing) => {
  if (!bgm || !musicToggle) return;
  if (playing) {
    try {
      await bgm.play();
      musicToggle.textContent = '🎵 Мелодия';
      musicToggle.setAttribute('aria-pressed', 'true');
    } catch (err) {
      musicToggle.textContent = '▶️ Мелодия';
      musicToggle.setAttribute('aria-pressed', 'false');
    }
  } else {
    bgm.pause();
    musicToggle.textContent = '▶️ Мелодия';
    musicToggle.setAttribute('aria-pressed', 'false');
  }
};

if (musicToggle && bgm) {
  setMusicPlaying(true);
  musicToggle.addEventListener('click', () => {
    const playing = !bgm.paused;
    setMusicPlaying(!playing);
  });
}

if (valentineInner) {
  const setCardOpen = (open) => {
    valentineInner.classList.toggle('open', open);
    valentineInner.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  valentineInner.addEventListener('mouseenter', () => setCardOpen(true));
  valentineInner.addEventListener('mouseleave', () => setCardOpen(false));
  valentineInner.addEventListener('click', () => {
    const isOpen = valentineInner.classList.contains('open');
    setCardOpen(!isOpen);
  });
  valentineInner.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const isOpen = valentineInner.classList.contains('open');
      setCardOpen(!isOpen);
    }
  });
}

const now = new Date();
if (dateEl) {
  dateEl.textContent = now.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.clearInterval(heartTimer);
  } else {
    heartTimer = window.setInterval(spawnHeart, 900);
  }
});

const createHeartAnimation = (canvas) => {
  const settings = {
    particles: {
      length: 10000,
      duration: 4,
      velocity: 80,
      effect: -1.3,
      size: 8,
    },
  };

  (function ensureRAF() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for (let i = 0; i < vendors.length && !window.requestAnimationFrame; i += 1) {
      window.requestAnimationFrame = window[`${vendors[i]}RequestAnimationFrame`];
      window.cancelAnimationFrame =
        window[`${vendors[i]}CancelAnimationFrame`] ||
        window[`${vendors[i]}CancelRequestAnimationFrame`];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback) => {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = window.setTimeout(() => callback(currTime + timeToCall), timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id) => clearTimeout(id);
    }
  })();

  function Point(x, y) {
    this.x = typeof x !== 'undefined' ? x : 0;
    this.y = typeof y !== 'undefined' ? y : 0;
  }
  Point.prototype.clone = function clone() {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function length(len) {
    if (typeof len === 'undefined') {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.normalize();
    this.x *= len;
    this.y *= len;
    return this;
  };
  Point.prototype.normalize = function normalize() {
    const len = this.length();
    this.x /= len;
    this.y /= len;
    return this;
  };

  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function initialize(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function draw(context, image) {
    const ease = (t) => (--t) * t * t + 1;
    const size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };

  function ParticlePool(length) {
    this.particles = new Array(length);
    for (let i = 0; i < this.particles.length; i += 1) {
      this.particles[i] = new Particle();
    }
    this.firstActive = 0;
    this.firstFree = 0;
    this.duration = settings.particles.duration;
  }
  ParticlePool.prototype.add = function add(x, y, dx, dy) {
    this.particles[this.firstFree].initialize(x, y, dx, dy);
    this.firstFree += 1;
    if (this.firstFree === this.particles.length) this.firstFree = 0;
    if (this.firstActive === this.firstFree) this.firstActive += 1;
    if (this.firstActive === this.particles.length) this.firstActive = 0;
  };
  ParticlePool.prototype.update = function update(deltaTime) {
    let i;
    if (this.firstActive < this.firstFree) {
      for (i = this.firstActive; i < this.firstFree; i += 1) {
        this.particles[i].update(deltaTime);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (i = this.firstActive; i < this.particles.length; i += 1) {
        this.particles[i].update(deltaTime);
      }
      for (i = 0; i < this.firstFree; i += 1) {
        this.particles[i].update(deltaTime);
      }
    }
    while (
      this.particles[this.firstActive].age >= this.duration &&
      this.firstActive !== this.firstFree
    ) {
      this.firstActive += 1;
      if (this.firstActive === this.particles.length) this.firstActive = 0;
    }
  };
  ParticlePool.prototype.draw = function draw(context, image) {
    let i;
    if (this.firstActive < this.firstFree) {
      for (i = this.firstActive; i < this.firstFree; i += 1) {
        this.particles[i].draw(context, image);
      }
    }
    if (this.firstFree < this.firstActive) {
      for (i = this.firstActive; i < this.particles.length; i += 1) {
        this.particles[i].draw(context, image);
      }
      for (i = 0; i < this.firstFree; i += 1) {
        this.particles[i].draw(context, image);
      }
    }
  };

  const context = canvas.getContext('2d');
  const particles = new ParticlePool(settings.particles.length);
  const particleRate = settings.particles.length / settings.particles.duration;
  let time;
  let rafId;
  let running = false;

  const pointOnHeart = (t) =>
    new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );

  const image = (() => {
    const temp = document.createElement('canvas');
    const ctx = temp.getContext('2d');
    temp.width = settings.particles.size;
    temp.height = settings.particles.size;
    const to = (t) => {
      const point = pointOnHeart(t);
      point.x = settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
      point.y = settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
      return point;
    };
    ctx.beginPath();
    let t = -Math.PI;
    let point = to(t);
    ctx.moveTo(point.x, point.y);
    while (t < Math.PI) {
      t += 0.01;
      point = to(t);
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fillStyle = '#f50b02';
    ctx.fill();
    const img = new Image();
    img.src = temp.toDataURL();
    return img;
  })();

  const onResize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

  const render = () => {
    rafId = window.requestAnimationFrame(render);
    const newTime = new Date().getTime() / 1000;
    const deltaTime = newTime - (time || newTime);
    time = newTime;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const amount = particleRate * deltaTime;
    for (let i = 0; i < amount; i += 1) {
      const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      const dir = pos.clone().length(settings.particles.velocity);
      particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
    }
    particles.update(deltaTime);
    particles.draw(context, image);
  };

  return {
    start() {
      if (running) return;
      running = true;
      onResize();
      window.addEventListener('resize', onResize);
      render();
    },
    stop() {
      if (!running) return;
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    },
  };
};

const heartAnimation = createHeartAnimation(pinkboard);

const openHeartModal = () => {
  heartModal.hidden = false;
  heartAnimation.start();
};
const closeHeartModal = () => {
  heartModal.hidden = true;
  heartAnimation.stop();
};

heartShow.addEventListener('click', openHeartModal);
heartClose.addEventListener('click', closeHeartModal);
heartBackdrop.addEventListener('click', closeHeartModal);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !heartModal.hidden) {
    closeHeartModal();
  }
});






