// Sharing: result text, challenge links and the friendly comparison. Pure helpers plus browser actions.
import { ENDINGS, eraTimeline } from './endings.js';
import { revealSentence } from './ui/ending.js';
import { formatDuration } from './format.js';

/** Clean game URL with the finish time as a challenge (drops debug and other parameters). */
export function challengeUrl(href, seconds) {
  const u = new URL(href);
  u.search = '';
  u.hash = '';
  if (seconds != null) u.searchParams.set('c', String(Math.round(seconds)));
  return u.toString();
}

export function parseChallenge(search) {
  const v = Number(new URLSearchParams(search).get('c'));
  return Number.isFinite(v) && v > 0 && new URLSearchParams(search).has('c') ? Math.round(v) : null;
}

/** "I reached the singularity in …" without naming what the ending means. */
export function shareText(state, href) {
  const last = revealSentence(eraTimeline(state)).lead.split('. ')[1] ?? '';
  const title = ENDINGS[state.ending]?.title ?? '';
  return `I reached the singularity in ${formatDuration(state.gameTime)}. ${last.replace(/\.$/, '')}. `
    + `Ending: "${title}". Can you do it faster? ${challengeUrl(href, state.gameTime)}`;
}

export function challengeVerdict(yours, friends) {
  return yours < friends
    ? `You were ${formatDuration(friends - yours)} faster than your friend.`
    : `Your friend was faster by ${formatDuration(yours - friends)}. Try again?`;
}

/** Native share sheet where available, otherwise copy to the clipboard. Resolves to 'shared' | 'copied' | 'failed'. */
export async function shareOrCopy({ title, text, url }) {
  try {
    if (navigator.share) { await navigator.share({ title, text, url }); return 'shared'; }
  } catch (e) {
    if (e?.name === 'AbortError') return 'failed';
  }
  try {
    await navigator.clipboard.writeText(url && !text.includes(url) ? `${text} ${url}` : text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
