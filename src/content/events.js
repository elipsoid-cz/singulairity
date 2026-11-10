// Rare clickable lucky events. mult multiplies all production for `duration` seconds.
export const EVENTS = [
  { id: 'genius', minEra: 1, mult: 2, duration: 30, text: 'A genius is born. Nurture them!' },
  { id: 'accident', minEra: 1, mult: 1.5, duration: 40, text: 'A lucky accident. Look closer!' },
  { id: 'traveller', minEra: 2, mult: 3, duration: 15, text: 'A traveller brings a strange idea. Listen!' },
  { id: 'patron', minEra: 3, mult: 2, duration: 30, text: 'A rich patron funds research. Accept!' },
  { id: 'eureka', minEra: 3, mult: 5, duration: 8, text: 'Eureka! Write it down, quick!' },
  { id: 'breakthrough', minEra: 5, mult: 3, duration: 15, text: 'An unexpected breakthrough. Publish it!' },
  { id: 'emergent', minEra: 6, mult: 5, duration: 8, text: 'An emergent ability appears. Investigate!' },
];
