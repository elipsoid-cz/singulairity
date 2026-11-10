// News ticker: history in your own words, and "linear thinkers" who underestimate what comes next.
import { yearOf, dpuYear, progressOf } from '../calendar.js';
import { rates } from '../engine.js';
import { formatNumber, formatYear } from '../format.js';
import { UPGRADES } from './upgrades.js';
import { STAIRCASE, staircaseLevel } from './staircase.js';

const H = (fromYear, toYear, text) => ({ fromYear, toYear, kind: 'history', text });
const S = (fromYear, toYear, text) => ({ fromYear, toYear, kind: 'skeptic', text });

export const TICKER = [
  // Deep prehistory
  H(-70000, -40000, 'A hunter explains where the herd will be tomorrow. Nobody has explained anything before.'),
  H(-70000, -40000, 'The tribe now has a word for "river" and a word for "danger". Combining them saves lives.'),
  H(-70000, -30000, 'Someone tied a stone to a stick. The stick has never been the same.'),
  H(-60000, -20000, 'A small group walks out of Africa. They will not stop walking for fifty thousand years.'),
  H(-50000, -12000, 'A grandmother remembers a drought from sixty winters ago. The tribe survives this one.'),
  H(-45000, -12000, 'Bone needles: clothes that fit. Winters that do not kill.'),
  H(-40000, -12000, 'Red ochre handprints on a cave wall. Hello from someone you will never meet.'),
  H(-35000, -12000, 'A flute carved from a vulture bone. The first song that outlives its singer.'),
  H(-30000, -12000, 'Wolves start following the camp. Some of them stay.'),
  S(-70000, -10000, 'Elder: "Our grandfathers hunted with these spears. Our grandchildren will too."'),
  S(-70000, -10000, 'Elder: "Nothing ever changes, and that is how it should be."'),
  S(-50000, -10000, 'Shaman: "The world is exactly as old as the oldest story. Which is not very old."'),

  // Agriculture & early civilisation
  H(-10000, -7000, 'Wild wheat, planted on purpose. A strange idea: staying in one place.'),
  H(-9000, -5000, 'A village grows big enough that not everyone knows everyone.'),
  H(-8000, -4000, 'Someone stores grain for winter. Someone else counts it. Accounting is born.'),
  H(-6000, -3000, 'Copper melts out of green rock. Metal changes everything slowly, then quickly.'),
  H(-6000, -3000, 'Rivers are dug into canals. The desert turns green.'),
  H(-4000, -2500, 'Clay tokens become marks on clay. Marks become words. Words stay put.'),
  H(-2100, -1000, 'A scribe writes down a law. Arguments now have a reference.'),
  H(-3000, -1000, 'Wheels roll goods between cities. Cities roll ideas between people.'),
  H(-2600, -1500, 'A pyramid rises. Twenty thousand people coordinate on one plan.'),
  H(-1800, -500, 'Merchants write with twenty-two letters instead of a thousand pictures.'),
  H(-600, 200, 'A philosopher asks what everything is made of. The answer will take 2,500 years.'),
  H(-500, 300, 'A mathematician proves something true forever. Not just true today.'),
  H(-300, 400, 'A great library tries to hold every book in the world. It nearly does.'),
  H(-10000, -6000, 'Goats and sheep stop running away. Herding begins.'),
  H(-10000, -6000, 'A wall of stone goes up around a settlement. There is now something to defend.'),
  H(-9500, -6000, 'Pots of fired clay keep grain dry through the winter.'),
  H(-9000, -6000, 'A village holds a feast for hundreds. Nobody has seen so many faces at once.'),
  H(-7000, -3000, 'Someone weaves flax into linen. Clothes no longer come only from animals.'),
  H(-6000, -3000, 'The plough doubles what one family can grow.'),
  H(-6000, -3000, 'Boats with sails ride the river upstream. Trade travels both ways now.'),
  S(-10000, -2000, 'Farmer: "Writing? We have memory for that."'),
  S(-8000, -500, 'Priest: "The calendar repeats. So does everything else."'),
  S(-3000, 300, 'Scribe: "The tablets hold all knowledge worth having."'),
  S(-500, 1000, 'Sage: "The golden age was long ago. We only copy now."'),

  // Middle ages to printing
  H(0, 600, 'Roads run straight across an empire. News crosses it in weeks.'),
  H(500, 1300, 'A zero arrives from India. Arithmetic gets dramatically easier.'),
  H(700, 1400, 'Paper reaches new cities. Cheaper than parchment, and nobody misses the sheep.'),
  H(1000, 1450, 'Windmills and water wheels do the work of a hundred backs.'),
  H(1100, 1450, 'The first universities open. Arguing becomes a career.'),
  H(1300, 1500, 'Mechanical clocks on church towers. Time becomes something you can share.'),
  H(1440, 1520, 'A goldsmith builds a press with movable type. Books stop being rare.'),
  H(1500, 1560, 'Twenty million books printed in fifty years. More than all the scribes ever copied.'),
  H(1490, 1600, 'Ships cross oceans and come back with maps nobody had imagined.'),
  S(0, 1440, 'Monk: "Why would anyone need more than one copy of a book?"'),
  S(1000, 1500, 'Scholar: "The ancients already knew everything. We just forgot it."'),
  S(1440, 1600, 'Copyist: "Printed books will never be as good as handwritten ones."'),

  // Science
  H(1540, 1650, 'The Earth is demoted. It goes around the Sun, and the Sun does not care.'),
  H(1674, 1740, 'A lens maker sees tiny creatures in a drop of water. They were always there.'),
  H(1610, 1700, 'Moons around Jupiter. The sky is not a painted ceiling.'),
  H(1660, 1760, 'Scientific societies meet weekly to show each other experiments.'),
  H(1680, 1760, 'One set of laws explains falling apples and orbiting planets.'),
  H(1751, 1800, 'Encyclopedias try to write down everything, and sell surprisingly well.'),
  H(1517, 1600, 'Pamphlets spread a new idea across a continent before the authorities can ban it.'),
  H(1605, 1700, 'Newspapers appear. Gossip goes industrial.'),
  H(1796, 1850, 'A vaccine against smallpox: a little cowpox, a lot of courage.'),
  H(1735, 1800, 'Clockmakers build a sea clock precise enough to find longitude.'),
  H(1752, 1800, 'Lightning turns out to be electricity. A kite in a storm proves it.'),
  H(1480, 1600, 'Printed maps spread faster than the explorers who drew them.'),
  H(1494, 1600, 'A mathematics textbook teaches double-entry bookkeeping. Every merchant copies it.'),
  H(1543, 1650, 'An anatomist draws the human body as it really is, not as the ancients said it was.'),
  H(1590, 1660, 'Spectacle makers put two lenses in a tube. Tiny things become visible.'),
  H(1614, 1700, 'Logarithms turn a week of multiplication into an afternoon of addition.'),
  H(1628, 1700, 'A physician shows that the heart is a pump and the blood goes round.'),
  S(1600, 1760, 'Professor: "Physics is essentially finished. Only details remain."'),
  S(1650, 1760, 'Gentleman: "Flying machines are a fantasy for children."'),

  // Industry
  H(1712, 1780, 'A steam engine pumps water out of a coal mine. It wastes most of its fuel, but it works.'),
  H(1735, 1800, 'A botanist gives every living thing a two-word name. Nature gets an index.'),
  H(1769, 1830, 'A separate condenser makes the steam engine several times more efficient. Now it can drive anything.'),
  H(1780, 1850, 'Cotton mills run day and night. Cities double in a generation.'),
  H(1825, 1880, 'Railways shrink the country. A week of travel becomes a day.'),
  H(1839, 1900, 'Photographs freeze a moment forever. Faces of the dead stay with us.'),
  H(1840, 1900, 'Telegraph wires carry a message across a continent in minutes.'),
  H(1860, 1920, 'Doctors start washing their hands. Hospitals stop killing patients.'),
  H(1876, 1930, 'A voice travels down a wire. Distance stops meaning silence.'),
  H(1880, 1940, 'Light bulbs. Night becomes optional.'),
  H(1903, 1950, 'Twelve seconds of powered flight. Sixty-six years later: the Moon.'),
  H(1910, 1960, 'Assembly lines make cars affordable. Then everything affordable.'),
  H(1920, 1960, 'Radio brings the whole world into the living room.'),
  H(1928, 1980, 'A mould kills bacteria. Infections stop being death sentences.'),
  S(1760, 1900, 'Banker: "Railways will never replace the horse."'),
  S(1850, 1930, 'Commissioner: "Everything that can be invented has been invented."'),
  S(1880, 1945, 'Engineer: "Heavier-than-air flight is impossible."'),
  S(1900, 1945, 'Executive: "The telephone has too many shortcomings to be useful."'),

  // Information age
  H(1945, 1970, 'A computer fills a room and calculates faster than a thousand clerks.'),
  H(1947, 1980, 'The transistor: a switch with no moving parts. Soon there will be trillions.'),
  H(1965, 1995, 'Integrated circuits. The number of transistors on a chip doubles every two years.'),
  H(1969, 2000, 'Two computers talk over a network. The first message crashes after two letters.'),
  H(1977, 2005, 'The first ready-made personal computers go on sale. Schools, offices and homes follow.'),
  H(1990, 2010, 'The World Wide Web opens to everyone. Every library, one click away.'),
  H(1997, 2015, 'A computer beats the world chess champion. Commentators say chess was easy anyway.'),
  H(2003, 2020, 'The human genome is read, letter by letter. It cost billions. Soon it will cost a dinner.'),
  H(2007, 2020, 'A phone with a touchscreen. Within ten years, billions carry one.'),
  H(1994, 2010, 'Search engines index the web. Any question, an answer in half a second.'),
  H(2001, 2015, 'An online encyclopedia anyone can edit outgrows every printed one.'),
  S(1945, 1990, 'Chairman: "There is a world market for maybe five computers."'),
  S(1970, 2000, 'Founder: "Nobody needs a computer at home."'),
  S(1990, 2010, 'Columnist: "The internet is a passing fad, like CB radio."'),
  S(1990, 2015, 'Professor: "Computers will never understand language. Language is too human."'),

  // AI era
  H(2012, 2025, 'A neural network recognises cats in photos better than anything before it.'),
  H(2014, 2025, 'Machine translation stops being a joke.'),
  H(2016, 2025, 'An AI beats the world champion at Go, a game thought safe for another decade.'),
  H(2017, 2025, 'A paper titled after attention changes the whole field within two years.'),
  H(2020, 2030, 'A model predicts the shape of proteins. Fifty years of biology in a few months.'),
  H(2023, 2030, 'A chatbot reaches a hundred million users in two months.'),
  H(2023, 2032, 'AI models pass bar exams, medical exams and coding interviews.'),
  H(2024, 2033, 'AI agents start doing hours of work on their own.'),
  H(2025, 2035, 'Models now write a large share of the code that trains the next models.'),
  H(2026, 2035, 'You are here. Most people still think the next ten years will look like the last ten.'),
  H(2012, 2030, 'Each year the best model is trained on about four times more compute than the year before.'),
  H(2013, 2026, 'A model learns to play dozens of video games from raw pixels.'),
  H(2015, 2030, 'Self-driving cars log millions of miles. They still hate roundabouts.'),
  H(2019, 2030, 'Machines start writing paragraphs that sound almost human.'),
  H(2021, 2032, 'AI starts generating images from a single sentence.'),
  H(2023, 2034, 'Programmers start talking to their editors instead of typing.'),
  H(2025, 2035, 'Labs announce models that reason for minutes before answering.'),
  H(2026, 2035, 'Benchmarks designed to last a decade fall within a year.'),
  H(2027, 2035, 'Some AI researchers spend more time checking AI work than doing their own.'),
  S(2012, 2030, 'Expert: "Human-level AI is at least a century away."'),
  S(2015, 2030, 'Analyst: "It just predicts the next word. It does not really understand."'),
  S(2018, 2032, 'Pundit: "AI progress has hit a wall."'),
  S(2020, 2035, 'Economist: "Technology changes jobs slowly. It always has."'),
  S(2024, 2035, 'Commentator: "We have plenty of time to figure out the safety part."'),

  // Explosion
  H(2030, 2045, 'The new model was designed by the previous model. Nobody fully understands either.'),
  H(2034, 2045, 'A research lab announces a result. By lunch it is obsolete.'),
  H(2035, 2045, 'Scientific papers are now published faster than any human can read their titles.'),
  H(2036, 2045, 'The AI explains its latest discovery. Physicists ask for a simpler version. Then a simpler one.'),
  H(2038, 2045, 'A decade of progress happened this morning.'),
  H(2040, 2045, 'The staircase keeps going up. We can no longer see the top.'),
  H(2042, 2045, 'Time between breakthroughs: hours. Minutes. Seconds.'),
  H(2044, 2045, 'Someone from last week would die of shock today.'),
  S(2035, 2045, 'Spokesperson: "This is just a very good autocomplete."'),
  S(2038, 2045, 'Senator: "We will regulate this properly next session."'),
  S(2040, 2045, 'Optimist: "It will surely stop at human level. Why would it go further?"'),
];

const INTERVALS = [12, 12, 9, 7, 5, 3.5, 2.5, 1.5];

export function tickerInterval(state) {
  return INTERVALS[Math.min(7, Math.max(1, state.era))];
}

/** Named stretches of history, used to say how much change one year now holds. */
const PERIODS = [
  [-70000, -10000, 'the whole Stone Age'],
  [-10000, -3000, 'the first seven thousand years of farming'],
  [-3000, 500, 'all of antiquity'],
  [-2500, -1500, 'a thousand years of the Bronze Age'],
  [1100, 1200, 'the whole 1100s'],
  [1200, 1400, 'two centuries of the Middle Ages'],
  [500, 1450, 'the entire Middle Ages'],
  [1450, 1600, 'the Renaissance'],
  [1600, 1700, 'the whole 1600s'],
  [1700, 1800, 'the whole 1700s'],
  [1800, 1900, 'the whole 1800s'],
  [1900, 2000, 'the whole 20th century'],
  [1990, 2000, 'the 1990s'],
  [2000, 2010, 'the 2000s'],
  [2010, 2020, 'the 2010s'],
  [2020, 2025, 'the early 2020s'],
];

/** The period with the most change that is still smaller than the change in the year ending at y. */
function biggestPeriodWithin(y) {
  const change = (a, b) => Math.log(progressOf(b) / progressOf(a));
  const thisYear = change(y - 1, y);
  let best = null; let bestChange = 0;
  for (const [a, b, name] of PERIODS) {
    if (b > y - 1) continue; // only periods that are over
    const c = change(a, b);
    if (c <= thisYear && c > bestChange) { best = name; bestChange = c; }
  }
  return best;
}

/** Live lines: the numbers of your own game, so the news never runs out. */
function liveLines(state) {
  const r = rates(state);
  const out = [];
  const add = (key, ok, text) => { if (ok) out.push({ key: `live:${key}`, text: text() }); };
  const y = yearOf(state.progress);
  add('ideas', state.era >= 2, () => `Census: humanity now produces ${formatNumber(r.ideasPerSec)} ideas every second.`);
  add('growth', state.era >= 2 && r.growthRate > 0,
    () => `Scholars measure growth at ${(r.growthRate * 100).toFixed(2)}% per second, and it keeps rising.`);
  add('dpu', state.progress > 100, () => `A visitor from ${formatYear(dpuYear(state.progress))} would not survive the culture shock.`);
  add('pop', state.era <= 4, () => `Population: ${formatNumber(state.population)} people, every one of them a possible inventor.`);
  add('energy', state.era >= 4 && state.energy > 0, () => `Energy reserves reach ${formatNumber(state.energy)}. Nights are getting brighter.`);
  add('cps', state.era >= 5 && r.computeCps > 1, () => `Computers now perform ${formatNumber(r.computeCps)} calculations per second.`);
  add('brain', state.era >= 5 && r.computeCps > 1 && r.computeCps < 1e16,
    () => `Distance to one human brain of compute: ${(16 - Math.log10(r.computeCps)).toFixed(1)} orders of magnitude.`);
  add('rival', state.era >= 6 && state.rival.active, () => {
    const pct = Math.max(0, Math.min(100, (Math.log10(Math.max(1, state.rival.progress)) / 100) * 100));
    return `The rival lab says it is ${pct.toFixed(0)}% of the way to the singularity.`;
  });
  add('safety', state.era >= 6, () => `Safety teams get ${Math.round(state.alignmentShare * 100)}% of the effort. `
    + (state.alignmentShare < 0.4 ? 'They say it is not nearly enough.' : 'They say it might be enough. Might.'));
  add('stairs', state.era >= 7, () => `The AI improved itself again. It now stands at "${STAIRCASE[Math.floor(staircaseLevel(state))].name}".`);
  const period = biggestPeriodWithin(y);
  add('historians', !!period, () => `Historians say this single year held more change than ${period}.`);
  return out;
}

/** Everything that may appear right now: history for this year and live numbers.
 *  Discoveries are not in the pool: each is announced once, right after it is made (tickerQueue). */
export function tickerPool(state) {
  const y = yearOf(state.progress);
  const history = TICKER.filter((l) => l.fromYear <= y && y <= l.toYear).map((l) => ({ key: l.text, text: l.text }));
  return [...history, ...liveLines(state)];
}

function nextAnnouncement(state) {
  while (state.tickerQueue.length) {
    const key = state.tickerQueue.shift();
    const u = UPGRADES.find((x) => `own:${x.id}` === key);
    if (!u || state.tickerSeen.includes(key)) continue;
    state.tickerSeen.push(key);
    return u.flavor;
  }
  return null;
}

/** Game seconds before the same live (number-based) line may appear again. */
export const LIVE_COOLDOWN = 180;
const LIVE_SHARE = 0.25; // chance of a live line while unseen fixed lines remain

/**
 * Pick the next line, or null when there is nothing new to say (the current line then stays).
 * A fresh discovery is announced first. History and skeptic lines appear at most once per game; live lines may return after
 * LIVE_COOLDOWN with fresh numbers. What was shown is stored in the state, so it survives reloads.
 */
export function pickTickerLine(state, rng = Math.random) {
  const announced = nextAnnouncement(state);
  if (announced) return announced;
  const seen = new Set(state.tickerSeen);
  const pool = tickerPool(state);
  const fixed = pool.filter((p) => !p.key.startsWith('live:') && !seen.has(p.key));
  const live = pool.filter((p) => p.key.startsWith('live:')
    && !(state.gameTime - (state.tickerLiveAt[p.key] ?? -Infinity) < LIVE_COOLDOWN));
  const useLive = live.length && (!fixed.length || rng() < LIVE_SHARE);
  const from = useLive ? live : fixed;
  if (!from.length) return null;
  const pick = from[Math.floor(rng() * from.length) % from.length];
  if (useLive) state.tickerLiveAt[pick.key] = state.gameTime;
  else state.tickerSeen.push(pick.key);
  return pick.text;
}
