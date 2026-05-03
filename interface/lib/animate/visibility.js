export function fadeIn(el) {
  el.hidden = false;
  requestAnimationFrame(() => {
    el.classList.add('visible');
  });
}

export function fadeOut(el) {
  el.classList.remove('visible');
  el.addEventListener(
    'transitionend',
    () => {
      if (!el.classList.contains('visible')) {
        el.hidden = true;
      }
    },
    { once: true }
  );
}

export function slideIn(el, direction = 'right') {
  el.hidden = false;
  el.dataset.slideDirection = direction;
  requestAnimationFrame(() => {
    el.classList.add('open');
  });
}

export function slideOut(el, direction = 'right') {
  el.dataset.slideDirection = direction;
  el.classList.remove('open');
  el.addEventListener(
    'transitionend',
    () => {
      if (!el.classList.contains('open')) {
        el.hidden = true;
      }
    },
    { once: true }
  );
}
