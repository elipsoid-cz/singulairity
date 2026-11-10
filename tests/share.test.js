import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { shareText, challengeUrl, parseChallenge, challengeVerdict } from '../src/share.js';
import { track, analyticsEnabled } from '../src/analytics.js';

function finished() {
  const s = createState();
  Object.assign(s, { singularity: true, winner: 'player', ending: 'sidelined', gameTime: 3840 });
  s.eraTime = [0, 300, 600, 400, 500, 600, 900, 540];
  s.eraStartProgress = [0, 0, 1e4, 1e7, 1e10, 1e14, 1e20, 1e30];
  return s;
}

test('challenge link carries the finish time and nothing else', () => {
  assert.equal(challengeUrl('https://x.io/singulairity/?debug&speed=50', 3840), 'https://x.io/singulairity/?c=3840');
});

test('parseChallenge reads a sane time and ignores junk', () => {
  assert.equal(parseChallenge('?c=3840'), 3840);
  assert.equal(parseChallenge('?c=abc'), null);
  assert.equal(parseChallenge('?c=-5'), null);
  assert.equal(parseChallenge(''), null);
});

test('share text has time, the punchline, the ending title, a dare and the link', () => {
  const t = shareText(finished(), 'https://x.io/s/');
  assert.match(t, /I reached the singularity in 1 h 4 min\./);
  assert.match(t, /The last 10 years took 9 min\./);
  assert.match(t, /Ending: "A comfortable footnote"\./);
  assert.match(t, /Can you do it faster\?/);
  assert.ok(t.endsWith('https://x.io/s/?c=3840'));
  assert.ok(!/sidelined|extinct|immortal/i.test(t), 'no spoiler words');
});

test('challenge verdict compares with the friend', () => {
  assert.match(challengeVerdict(3000, 3840), /faster than your friend/);
  assert.match(challengeVerdict(4000, 3840), /friend was faster/);
});

test('analytics stays off outside a real browser page', () => {
  assert.equal(analyticsEnabled(), false);
  assert.equal(track('ending-sidelined'), false);
});
