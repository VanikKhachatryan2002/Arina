const shimmerBtn = document.getElementById('shimmer');
const promiseBtn = document.getElementById('promise');
const petals = document.querySelector('.petals');

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
    const text = 'Моё обещание: я всегда буду любить тебя.';
    promiseBtn.textContent = text;
    promiseBtn.setAttribute('disabled', 'true');
  });
}
