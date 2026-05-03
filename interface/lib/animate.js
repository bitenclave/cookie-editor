import { getHeight, isHidden } from './animate/measure.js';
import { resizeSlide, toggleSlide } from './animate/slide.js';
import { transitionPage } from './animate/transitionPage.js';
import { fadeIn, fadeOut, slideIn, slideOut } from './animate/visibility.js';

/**
 * Handles the different animations used in the interface.
 */
export class Animate {
  static fadeIn(el) {
    fadeIn(el);
  }

  static fadeOut(el) {
    fadeOut(el);
  }

  static slideIn(el, direction = 'right') {
    slideIn(el, direction);
  }

  static slideOut(el, direction = 'right') {
    slideOut(el, direction);
  }

  static toggleSlide(el, callback = null) {
    toggleSlide(el, callback);
  }

  static resizeSlide(el, callback = null) {
    resizeSlide(el, callback);
  }

  static transitionPage(
    container,
    oldPage,
    newPage,
    direction = 'left',
    callback = null,
    animationsEnabled = true
  ) {
    transitionPage(
      container,
      oldPage,
      newPage,
      direction,
      callback,
      animationsEnabled
    );
  }

  static getHeight(el, ignoreMaxHeight) {
    return getHeight(el, ignoreMaxHeight);
  }

  static isHidden(el) {
    return isHidden(el);
  }
}
