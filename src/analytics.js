// Cookie-free analytics via GoatCounter: page views plus a few anonymous events.
// No cookies, no local storage, no personal data, so no consent banner is needed. Off until configured.
import { GOATCOUNTER_CODE } from './config.js';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export function analyticsEnabled() {
  return !!GOATCOUNTER_CODE && isBrowser && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    && !new URLSearchParams(location.search).has('debug');
}

export function initAnalytics() {
  if (!analyticsEnabled()) return false;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  document.head.append(s);
  return true;
}

/** Count an event such as "era-3", "ending-sidelined" or "share-result". */
export function track(name) {
  if (!analyticsEnabled() || !window.goatcounter?.count) return false;
  window.goatcounter.count({ path: name, title: name, event: true });
  return true;
}
