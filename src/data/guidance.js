// Risk-based guidance text. Kept as data rather than inside a screen so
// the wording can be checked and updated without touching any logic.

export const guidance = {
  flood: {
    title: 'Flood Guidance',
    subtitle: 'Risk-based flood safety guidance',
    riskTitle: 'Flood Risk',
    icon: '🌊',
    source: 'PUB Flood Alerts',
    sourceUrl: 'https://t.me/pubfloodalerts',
    actions: {
      Low: [
        'Monitor weather updates.',
        'Check official sources if heavy rain is expected.',
        'Keep emergency contacts saved.',
      ],
      Moderate: [
        'Avoid low-lying and flood-prone areas.',
        'Protect important belongings from water damage.',
        'Plan safer travel routes.',
      ],
      High: [
        'Do not walk or drive through flood water.',
        'Avoid low-lying and flood-prone areas.',
        'Move to higher or sheltered ground if needed.',
        'Check PUB Flood Alerts regularly.',
        'Protect important belongings from water damage.',
      ],
    },
  },
  haze: {
    title: 'Haze Guidance',
    subtitle: 'Risk-based haze health guidance',
    riskTitle: 'Haze Risk',
    icon: '🌫️',
    source: 'NEA PSI readings',
    sourceUrl: 'https://www.haze.gov.sg/',
    actions: {
      Low: [
        'Continue normal activity but monitor PSI updates.',
        'Stay hydrated.',
        'Check official haze information if conditions change.',
      ],
      Moderate: [
        'Reduce long outdoor activities.',
        'Keep hydrated.',
        'Check PSI updates regularly.',
      ],
      High: [
        'Reduce outdoor activities.',
        'Wear a mask if you must go outside.',
        'Keep windows and doors closed.',
        'Monitor health symptoms.',
        'Check PSI updates from official sources.',
      ],
    },
  },
};

// Shown when live and cached data are both unavailable. The app should
// say it does not know rather than guessing that the risk is low.
export const unavailableGuidance = [
  'Live risk information could not be loaded.',
  'Check official sources directly using the Resources tab.',
  'Preparedness guidance below remains available offline.',
];