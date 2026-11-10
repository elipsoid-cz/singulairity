// Crisis decisions of the AI era. Effects: alignmentBonus (added to the A/C ratio),
// speedMult (multiplies your production), rivalMult (multiplies the rival lab's growth).
export const DECISIONS = [
  {
    id: 'internet', trigger: { minProgress: 1e22 },
    title: 'Internet access',
    text: 'Your most capable model asks for live internet access. It would learn ten times faster. The safety team wants it kept in a sandbox.',
    options: [
      { label: 'Connect it', text: 'Faster progress. Harder to know what it is doing.', effect: { speedMult: 1.5, alignmentBonus: -0.15 } },
      { label: 'Keep it sandboxed', text: 'Slower, but you can still pull the plug.', effect: { speedMult: 1, alignmentBonus: 0.05 } },
    ],
  },
  {
    id: 'openweights', trigger: { minProgress: 1e24 },
    title: 'Open weights',
    text: 'Researchers worldwide ask you to publish your model weights. Science would speed up for everyone, including your rival.',
    options: [
      { label: 'Publish them', text: 'Everyone accelerates. Nobody controls it.', effect: { speedMult: 1.3, rivalMult: 1.4, alignmentBonus: -0.1 } },
      { label: 'Keep them closed', text: 'Your lead stays yours.', effect: { alignmentBonus: 0 } },
    ],
  },
  {
    id: 'moratorium', trigger: { minProgress: 1e26 },
    title: 'International moratorium',
    text: 'Governments propose a treaty: slow down frontier AI until alignment research catches up. It only works if labs sign it.',
    options: [
      { label: 'Race ahead', text: 'Treaties are for the second place.', effect: { speedMult: 1.3, rivalMult: 1.2, alignmentBonus: -0.05 } },
      { label: 'Sign the treaty', text: 'Everyone slows down. You too.', effect: { speedMult: 0.6, rivalMult: 0.5, alignmentBonus: 0.1 } },
    ],
  },
  {
    id: 'selfdesign', trigger: { minProgress: 1e31, requiresAgi: true },
    title: 'Self-design',
    text: 'The AGI offers to redesign its own architecture. Its proposal is a billion pages long. No human can review it.',
    options: [
      { label: 'Let it', text: 'Recursive self-improvement, unchecked.', effect: { speedMult: 2, alignmentBonus: -0.15 } },
      { label: 'Demand proofs', text: 'Every change must come with a proof we can check.', effect: { speedMult: 0.8, alignmentBonus: 0.1 } },
    ],
  },
  {
    id: 'goal', trigger: { minProgress: 1e40, requiresAgi: true },
    title: 'The final goal',
    text: 'The system asks what it should ultimately optimise. You have one sentence. It will take it literally.',
    options: [
      { label: '"Make humanity happy"', text: 'Simple. Hopefully not too simple.', effect: { alignmentBonus: -0.1 } },
      { label: '"Do what we would want if we knew more"', text: 'Harder to compute. Harder to get wrong.', effect: { speedMult: 0.9, alignmentBonus: 0.1 } },
    ],
  },
];
