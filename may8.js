const shimmerBtn = document.getElementById('shimmer');
const promiseBtn = document.getElementById('promise');
const petals = document.querySelector('.petals');
const openMessageBtn = document.getElementById('openMessage');
const loveModal = document.getElementById('loveModal');
const closeMessageBtn = document.getElementById('closeMessage');
const closeMessageBackdrop = document.getElementById('closeMessageBackdrop');

const spawnPetal = () => {
  if (!petals) return;

  const petal = document.createElement('span');
  petal.className = 'petal';
  petal.style.left = `${Math.random() * 100}%`;
  petal.style.animationDuration = `${5 + Math.random() * 3}s`;
  petals.appendChild(petal);
  petal.addEventListener('animationend', () => petal.remove());
};

if (shimmerBtn) {
  shimmerBtn.addEventListener('click', () => {
    shimmerBtn.classList.add('shimmer');

    for (let i = 0; i < 16; i += 1) {
      setTimeout(spawnPetal, i * 120);
    }

    setTimeout(() => shimmerBtn.classList.remove('shimmer'), 1600);
  });
}

if (promiseBtn) {
  promiseBtn.addEventListener('click', () => {
    promiseBtn.textContent = 'Моё обещание: я всегда буду любить тебя.';
    promiseBtn.setAttribute('disabled', 'true');
  });
}

const closeLoveMessage = () => {
  if (!loveModal) return;

  loveModal.hidden = true;
  document.body.style.overflow = '';
};

if (openMessageBtn && loveModal) {
  openMessageBtn.addEventListener('click', () => {
    loveModal.hidden = false;
    document.body.style.overflow = 'hidden';
  });
}

if (closeMessageBtn) {
  closeMessageBtn.addEventListener('click', closeLoveMessage);
}

if (closeMessageBackdrop) {
  closeMessageBackdrop.addEventListener('click', closeLoveMessage);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && loveModal && !loveModal.hidden) {
    closeLoveMessage();
  }
});
