// Every storage key in one place so I never mistype one somewhere and
// silently write to the wrong slot. The @readysg: prefix keeps this app's
// data separate from anything else stored on the device.

export const STORAGE_KEYS = {
  CHECKLIST: '@readysg:checklist',
  QUIZ_ANSWERS: '@readysg:quizAnswers',
  QUIZ_BEST_SCORE: '@readysg:quizBestScore',
  POINTS: '@readysg:points',
  AWARDED_REWARDS: '@readysg:awardedRewards',
  SETTINGS: '@readysg:settings',
  LAST_NOTIFIED: '@readysg:lastNotified',
  CACHE_ENVIRONMENT: '@readysg:cache:environment',
};