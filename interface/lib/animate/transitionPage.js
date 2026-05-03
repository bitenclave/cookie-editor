import { getHeight } from './measure.js';

const animationTime = '0.3s';

export function transitionPage(
  container,
  oldPage,
  newPage,
  direction = 'left',
  callback = null,
  animationsEnabled = true
) {
  if (!animationsEnabled) {
    replaceWithoutAnimation(container, oldPage, newPage, callback);
    return;
  }
  container.addEventListener(
    'transitionend',
    () => finishTransition(container, oldPage, callback),
    { passive: true, once: true }
  );
  prepareContainer(container);
  placePages(container, oldPage, newPage, direction);
  resizePopupContainer(container, oldPage, newPage);
  slidePages(container, direction);
}

function replaceWithoutAnimation(container, oldPage, newPage, callback) {
  if (oldPage) {
    oldPage.remove();
  }
  container.appendChild(newPage);
  if (callback) {
    callback();
  }
}

function finishTransition(container, oldPage, callback) {
  container.style.maxHeight = '';
  container.style.transition = '';
  container.style.display = '';
  container.style.width = '';
  container.style.transform = '';
  container.style.overflowY = 'auto';
  if (oldPage) {
    oldPage.remove();
  }
  if (callback) {
    callback();
  }
}

function prepareContainer(container) {
  container.style.overflowY = 'hidden';
  container.style.width = '200%';
  container.style.display = 'flex';
}

function placePages(container, oldPage, newPage, direction) {
  if (oldPage) {
    oldPage.style.flex = '0 0 50%';
  }
  newPage.style.flex = '0 0 50%';
  if (direction === 'left') {
    container.appendChild(newPage);
    return;
  }
  container.insertBefore(newPage, container.firstChild);
}

function resizePopupContainer(container, oldPage, newPage) {
  if (!window.isPopup) {
    return;
  }
  const newPageHeight = Math.min(getHeight(newPage), 400);
  const oldPageHeight = oldPage ? getHeight(oldPage) : 0;
  container.style.maxHeight = oldPageHeight + 'px';

  setTimeout(() => {
    appendTransition(container, `max-height ${animationTime} ease-in-out`);
    setTimeout(() => {
      container.style.maxHeight = newPageHeight + 'px';
    }, 1);
  }, 1);
}

function slidePages(container, direction) {
  if (direction === 'left') {
    appendTransition(container, `transform ${animationTime} ease-in-out`);
    setTimeout(() => {
      container.style.transform = 'translateX(-50%)';
    }, 10);
    return;
  }

  container.style.transform = 'translateX(-50%)';
  setTimeout(() => {
    appendTransition(container, `transform ${animationTime} ease-in-out`);
    setTimeout(() => {
      container.style.transform = 'translateX(0)';
    }, 1);
  }, 1);
}

function appendTransition(container, transition) {
  container.style.transition += container.style.transition
    ? ', ' + transition
    : transition;
}
