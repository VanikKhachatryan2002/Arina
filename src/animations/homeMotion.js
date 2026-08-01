const ICONS = ["\u2764\ufe0f", "\ud83d\udc96", "\ud83d\udc95", "\ud83d\udc9e", "\ud83c\udf39"];
const random = (min, max) => min + Math.random() * (max - min);

export function setupHomeMotion() {
  const controller = new AbortController();
  const signal = controller.signal;
  const animations = new Set();
  const temporaryNodes = new Set();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function track(animation) {
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    return animation;
  }

  function removeWhenFinished(node, animation) {
    temporaryNodes.add(node);
    animation.finished.catch(() => {}).finally(() => {
      temporaryNodes.delete(node);
      node.remove();
    });
  }

  const letter = document.getElementById("letter");
  const reveal = document.getElementById("reveal");
  if (letter && reveal) {
    reveal.addEventListener("click", () => {
      const opening = !letter.classList.contains("open");
      letter.classList.toggle("open", opening);
      reveal.setAttribute("aria-expanded", String(opening));
      if (reducedMotion) return;
      const animation = letter.animate(
        opening
          ? [
              { opacity: 0, transform: "translateY(-8px)", filter: "blur(3px)" },
              { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
            ]
          : [
              { opacity: 1, transform: "translateY(0)" },
              { opacity: 0.4, transform: "translateY(-5px)" },
            ],
        { duration: opening ? 650 : 260, easing: "cubic-bezier(.22,1,.36,1)" },
      );
      track(animation);
    }, { signal });
  }

  const flipCard = document.getElementById("flipCard");
  if (flipCard) {
    const toggle = () => {
      const flipped = flipCard.classList.toggle("flipped");
      flipCard.setAttribute("aria-expanded", String(flipped));
    };
    flipCard.addEventListener("click", toggle, { signal });
    flipCard.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    }, { signal });
  }

  const heartTrigger = document.getElementById("loveHeart");
  const heartLayer = document.getElementById("pageHearts");
  if (heartTrigger && heartLayer) {
    heartTrigger.addEventListener("click", () => {
      const bounds = heartTrigger.getBoundingClientRect();
      const count = window.__LITE__ ? 8 : 14;
      for (let index = 0; index < count; index += 1) {
        const node = document.createElement("span");
        node.className = "love-floating love-floating--managed";
        node.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
        node.style.left = `${bounds.left + bounds.width / 2 + random(-14, 14)}px`;
        node.style.top = `${bounds.top + bounds.height / 2 + random(-5, 5)}px`;
        heartLayer.append(node);
        const animation = track(node.animate([
          { opacity: 0, transform: "translate3d(0,8px,0) scale(.65)" },
          { opacity: 1, transform: `translate3d(${random(-24, 24)}px,-35px,0) scale(1.2)`, offset: 0.18 },
          { opacity: 0, transform: `translate3d(${random(-130, 130)}px,${random(-320, -220)}px,0) scale(.8) rotate(${random(-35, 35)}deg)` },
        ], {
          duration: reducedMotion ? 1 : random(2200, 3400),
          delay: reducedMotion ? 0 : index * 35,
          easing: "cubic-bezier(.2,.7,.2,1)",
          fill: "forwards",
        }));
        removeWhenFinished(node, animation);
      }
    }, { signal });
  }

  const albumLink = document.querySelector(".album-cta");
  if (albumLink) {
    albumLink.addEventListener("click", (event) => {
      if (reducedMotion || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const destination = albumLink.href;
      const bounds = albumLink.getBoundingClientRect();
      const layer = document.createElement("span");
      layer.className = "album-cta-burst";
      Object.assign(layer.style, {
        position: "fixed",
        left: `${bounds.left + bounds.width / 2}px`,
        top: `${bounds.top + bounds.height / 2}px`,
        pointerEvents: "none",
        zIndex: "1000",
      });
      document.body.append(layer);
      temporaryNodes.add(layer);

      for (let index = 0; index < 14; index += 1) {
        const node = document.createElement("i");
        node.textContent = ICONS[Math.floor(Math.random() * ICONS.length)];
        Object.assign(node.style, { position: "absolute", left: "0", top: "0", fontSize: "18px" });
        layer.append(node);
        track(node.animate([
          { opacity: 0, transform: "translate(-50%,-50%) scale(.5)" },
          { opacity: 1, transform: `translate(${random(-55, 55)}px,${random(-75, -30)}px) scale(1.2)`, offset: 0.45 },
          { opacity: 0, transform: `translate(${random(-85, 85)}px,${random(-145, -80)}px) scale(.9)` },
        ], { duration: 720, delay: index * 16, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }));
      }
      track(albumLink.animate([
        { transform: "scale(1)" },
        { transform: "scale(.985)", offset: 0.3 },
        { transform: "scale(1.015)" },
      ], { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" }));
      window.setTimeout(() => { window.location.href = destination; }, 460);
    }, { signal });
  }

  return () => {
    controller.abort();
    for (const animation of animations) animation.cancel();
    for (const node of temporaryNodes) node.remove();
    animations.clear();
    temporaryNodes.clear();
  };
}
