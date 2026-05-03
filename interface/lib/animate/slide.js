import { getHeight, isHidden } from './measure.js';

export function toggleSlide(el, callback = null) {
  el.style.display = 'flex';
  el.addEventListener(
    'transitionend',
    () => {
      if (callback) {
        callback();
      }
      if (isHidden(el)) {
        el.style.display = 'none';
      }
      forcePopupResize();
    },
    { once: true }
  );

  if (el.getAttribute('data-max-height')) {
    toggleKnownSlide(el);
    return;
  }

  const elMaxHeight = getHeight(el) + 'px';
  el.style.transition = 'max-height 0.25s ease-in-out';
  el.style.overflowY = 'hidden';
  el.setAttribute('data-max-height', elMaxHeight);

  const nextMaxHeight = el.offsetHeight > 0 ? 0 : elMaxHeight;
  if (el.offsetHeight > 0) {
    el.style.maxHeight = elMaxHeight;
  } else {
    el.style.maxHeight = 0;
  }
  setTimeout(() => {
    el.style.maxHeight = nextMaxHeight;
  }, 10);
}

function toggleKnownSlide(el) {
  if (isHidden(el)) {
    setTimeout(() => {
      el.style.maxHeight = el.getAttribute('data-max-height');
    }, 10);
    return;
  }
  const elMaxHeight = getHeight(el) + 'px';
  el.setAttribute('data-max-height', elMaxHeight);
  el.style.maxHeight = '0';
}

export function resizeSlide(el, callback = null) {
  if (callback) {
    el.addEventListener('transitionend', () => callback(), { once: true });
  }
  const elMaxHeight = getHeight(el, true) + 'px';
  el.style.transition = 'max-height 0.25s ease-in-out';
  el.style.overflowY = 'hidden';
  el.setAttribute('data-max-height', elMaxHeight);
  el.style.maxHeight = el.offsetHeight;
  setTimeout(() => {
    el.style.maxHeight = elMaxHeight;
  }, 10);
}

function forcePopupResize() {
  document.body.style.height = '100%';
  setTimeout(() => {
    document.body.style.height = '';
  }, 10);
}
