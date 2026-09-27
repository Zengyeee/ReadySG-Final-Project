// Badges reward preparedness learning rather than app usage. Each one can
// only be earned once - the awarding logic lives in gamificationUtils.

export const badges = [
  {
    id: 'flood-ready',
    name: 'Flood Ready',
    description: 'Completed every flood preparedness task.',
    howToUnlock: 'Complete all Flood items in the checklist.',
    icon: '🌊',
  },
  {
    id: 'haze-ready',
    name: 'Haze Ready',
    description: 'Completed every haze preparedness task.',
    howToUnlock: 'Complete all Haze items in the checklist.',
    icon: '🌫️',
  },
  {
    id: 'safety-scholar',
    name: 'Safety Scholar',
    description: 'Scored at least 75% on the safety quiz.',
    howToUnlock: 'Answer at least 6 of 8 quiz questions correctly.',
    icon: '🎓',
  },
  {
    id: 'preparedness-champion',
    name: 'Preparedness Champion',
    description: 'Fully prepared across every category.',
    howToUnlock:
      'Complete the entire checklist and score at least 75% on the quiz.',
    icon: '🏆',
  },
];