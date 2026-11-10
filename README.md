# Singulairity

An incremental browser game about how fast progress accelerates: lead humanity from the first spark of language
to the AI singularity, and feel the curve bend under your fingers.

**Play:** https://elipsoid-cz.github.io/singulairity/

Inspired by Frank Lantz's [Universal Paperclips](https://www.decisionproblem.com/paperclips/) and Tim Urban's
[The AI Revolution](https://waitbutwhy.com/2015/01/artificial-intelligence-revolution-1.html) on Wait But Why.

## Run locally

No build step, no dependencies.

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Debug parameters: `?speed=50` (faster time), `?no3d=1` (2D finale), `?debug`.

## Tests

```bash
npm test
```

Game logic, pacing simulation (a bot plays the whole game), scenes and content checks run on Node ≥ 20.

## Privacy

Cookie-free page-view and event counting with [GoatCounter](https://www.goatcounter.com). No cookies,
no personal data. Your saved game stays in your browser's local storage.
