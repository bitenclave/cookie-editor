/**
 * Calculates the height for elements with display:none.
 * https://stackoverflow.com/a/29047447
 * @param {Element} el Element to calculate the height.
 * @param {boolean} ignoreMaxHeight Whether max-height should be ignored.
 * @return {number} The calculated height of the element, in pixel.
 */
export function getHeight(el, ignoreMaxHeight) {
  const elStyle = window.getComputedStyle(el);
  const elMaxHeight = elStyle.maxHeight;
  const elMaxHeightInt = elMaxHeight.replace('px', '').replace('%', '');

  if (!ignoreMaxHeight && elMaxHeightInt !== '0' && elMaxHeight !== 'none') {
    return el.offsetHeight;
  }

  const previousDisplay = el.style.display;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.display = 'block';
  el.style.maxHeight = 'none';

  const wantedHeight = el.offsetHeight;
  el.style.display = previousDisplay;
  el.style.position = '';
  el.style.visibility = '';
  el.style.maxHeight = elMaxHeight;
  return wantedHeight;
}

/**
 * Determines whether or not an element is hidden.
 * @param {Element} el The element to check.
 * @return {boolean} True if the element is hidden, otherwise false.
 */
export function isHidden(el) {
  return el.style.maxHeight.replace('px', '').replace('%', '') === '0';
}
