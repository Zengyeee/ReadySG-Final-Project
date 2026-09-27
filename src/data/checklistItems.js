// The preparedness checklist. Points are awarded per item, with a bonus
// for finishing a whole category - that logic lives in gamificationUtils.

export const checklistItems = [
  // General
  {
    id: 'weather',
    category: 'General',
    title: 'Check weather, PSI or flood updates before leaving home.',
    points: 10,
  },
  {
    id: 'contacts',
    category: 'General',
    title: 'Save emergency contacts such as 995 and 999.',
    points: 10,
  },
  {
    id: 'documents',
    category: 'General',
    title: 'Keep a digital copy of important documents.',
    points: 10,
  },
  {
    id: 'powerbank',
    category: 'General',
    title: 'Keep a charged power bank for emergencies.',
    points: 10,
  },

  // Flood
  {
    id: 'route',
    category: 'Flood',
    title: 'Plan an alternative route in case some roads are affected.',
    points: 10,
  },
  {
    id: 'belongings',
    category: 'Flood',
    title: 'Keep important belongings away from water-prone areas.',
    points: 10,
  },
  {
    id: 'flood-areas',
    category: 'Flood',
    title: 'Know which areas near you are flood-prone.',
    points: 10,
  },
  {
    id: 'flood-alerts',
    category: 'Flood',
    title: 'Subscribe to PUB flood alerts.',
    points: 10,
  },

  // Haze
  {
    id: 'mask',
    category: 'Haze',
    title: 'Prepare an N95 mask in case haze becomes unhealthy.',
    points: 10,
  },
  {
    id: 'indoor',
    category: 'Haze',
    title: 'Plan indoor activities if the haze level becomes high.',
    points: 10,
  },
  {
    id: 'air-quality',
    category: 'Haze',
    title: 'Know how to check PSI readings for your region.',
    points: 10,
  },
  {
    id: 'medication',
    category: 'Haze',
    title: 'Keep any respiratory medication accessible.',
    points: 10,
  },
];

export const checklistCategories = ['General', 'Flood', 'Haze'];