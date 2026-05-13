import { cookieDomainMethods } from './cookies/domains.js';
import { cookieFilteringMethods } from './cookies/filtering.js';
import { cookieIncrementalRenderingMethods } from './cookies/incrementalRendering.js';
import { cookieLifecycleMethods } from './cookies/lifecycle.js';
import { cookieRenderingMethods } from './cookies/rendering.js';
import { cookieRowMethods } from './cookies/rows.js';
import { cookieSearchMethods } from './cookies/search.js';
import { cookieSelectionMethods } from './cookies/selection.js';

export const cookieMethods = {
  ...cookieLifecycleMethods,
  ...cookieRenderingMethods,
  ...cookieIncrementalRenderingMethods,
  ...cookieRowMethods,
  ...cookieFilteringMethods,
  ...cookieSearchMethods,
  ...cookieDomainMethods,
  ...cookieSelectionMethods,
};
