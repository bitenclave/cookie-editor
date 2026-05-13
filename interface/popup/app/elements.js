import { elementCacheMethods } from './elements/cache.js';
import { elementEventMethods } from './elements/events.js';

export const elementMethods = {
  ...elementCacheMethods,
  ...elementEventMethods,
};
