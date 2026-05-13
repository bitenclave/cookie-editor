export const FIELD_ALIASES = {
  d: 'domain',
  domain: 'domain',
  host: 'domain',
  n: 'name',
  name: 'name',
  p: 'path',
  path: 'path',
  samesite: 'sameSite',
  store: 'storeId',
  storeid: 'storeId',
  v: 'value',
  value: 'value',
};

export const FLAG_ALIASES = {
  exact: 'hostOnly',
  host: 'hostOnly',
  hostonly: 'hostOnly',
  http: 'httpOnly',
  httponly: 'httpOnly',
  http_only: 'httpOnly',
  none: 'sameSiteNone',
  persistent: 'persistent',
  secure: 'secure',
  session: 'session',
  temporary: 'session',
};

export const SEARCH_SYNONYMS = {
  ads: ['ad', 'ads', 'advertising', 'doubleclick', 'fbp', 'fr', 'gcl'],
  analytics: ['analytics', '_ga', '_gid', '_gat', 'gtag', 'utm'],
  auth: ['auth', 'csrf', 'jwt', 'login', 'sid', 'token', 'xsrf'],
  identity: ['id', 'uid', 'user', 'visitor'],
  prefs: ['consent', 'lang', 'locale', 'pref', 'settings', 'theme'],
  security: ['csrf', 'httponly', 'secure', 'token', 'xsrf'],
  tracking: ['analytics', 'fbp', 'ga', 'gid', 'track', 'tracking', 'utm'],
};

export const COOKIE_FILTER_BATCH_SIZE = 800;
export const COOKIE_INITIAL_RENDER_COUNT = 260;
export const COOKIE_RENDER_BATCH_SIZE = 220;
export const COOKIE_SCROLL_THRESHOLD_PX = 360;
export const COOKIE_PROGRESS_UPDATE_MS = 120;
export const COOKIE_CHANGE_FLUSH_MS = 160;
export const MAX_DOMAIN_FILTER_OPTIONS = 200;
