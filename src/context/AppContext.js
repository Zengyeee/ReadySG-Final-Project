import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { loadData, saveData, clearAllData } from '../services/storage';
import { STORAGE_KEYS } from '../services/storageKeys';
import { fetchEnvironmentData } from '../services/api';
import { fetchWithCache } from '../services/remoteData';
import {
  requestNotificationPermission,
  sendRiskNotification,
} from '../services/notificationService';
import { checklistItems } from '../data/checklistItems';
import { quizQuestions } from '../data/quizQuestions';
import { toggleItem } from '../utils/progressUtils';
import { calculateScore, updateBestScore } from '../utils/quizUtils';
import { calculateNewRewards, earnedBadgeIds } from '../utils/gamificationUtils';
import {
  shouldNotify,
  recordNotification,
  buildRiskMessage,
} from '../utils/notificationUtils';

// All the app's state lives here. Without it I would have to pass the
// checklist, quiz answers and points down through every screen as props,
// and the home dashboard would never know when something changed on the
// checklist screen.
const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  riskNotificationsEnabled: true,
  hapticsEnabled: true,
};

// What the dashboard shows before the first fetch finishes. Deliberately
// not "Low" - the app should say it does not know yet rather than guess.
const INITIAL_ENVIRONMENT = {
  flood: { risk: 'Unavailable', detail: 'Loading flood information', value: null },
  haze: { risk: 'Unavailable', detail: 'Loading air quality information', value: null },
  fetchedAt: null,
};

export function AppProvider({ children }) {
  const [completedIds, setCompletedIds] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [bestScore, setBestScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [awardedRewards, setAwardedRewards] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lastNotified, setLastNotified] = useState({});

  const [environment, setEnvironment] = useState(INITIAL_ENVIRONMENT);
  const [dataStatus, setDataStatus] = useState('loading');
  const [cacheAge, setCacheAge] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // A ref rather than state, because the notification check needs the
  // previous risk at the moment a fetch completes. Reading it from state
  // inside the fetch would give a stale value.
  const previousRiskRef = useRef({ flood: 'Unavailable', haze: 'Unavailable' });

  // ---- Loading saved data ----

  useEffect(() => {
    async function loadEverything() {
      const savedChecklist = await loadData(STORAGE_KEYS.CHECKLIST, []);
      const savedAnswers = await loadData(STORAGE_KEYS.QUIZ_ANSWERS, {});
      const savedBest = await loadData(STORAGE_KEYS.QUIZ_BEST_SCORE, 0);
      const savedPoints = await loadData(STORAGE_KEYS.POINTS, 0);
      const savedRewards = await loadData(STORAGE_KEYS.AWARDED_REWARDS, []);
      const savedSettings = await loadData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      const savedNotified = await loadData(STORAGE_KEYS.LAST_NOTIFIED, {});

      setCompletedIds(savedChecklist);
      setQuizAnswers(savedAnswers);
      setBestScore(savedBest);
      setPoints(savedPoints);
      setAwardedRewards(savedRewards);
      // Spreading the defaults first means a setting added in a later
      // version will not be missing for an existing user.
      setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      setLastNotified(savedNotified);

      setIsLoading(false);
    }
    loadEverything();
  }, []);

  // ---- Saving ----
  //
  // The isLoading guard is essential. Effects run on first render, so
  // without it these would save empty values over the real saved data
  // before the load had finished, wiping everything on every launch.

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.CHECKLIST, completedIds);
  }, [completedIds, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.QUIZ_ANSWERS, quizAnswers);
  }, [quizAnswers, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.QUIZ_BEST_SCORE, bestScore);
  }, [bestScore, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.POINTS, points);
  }, [points, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.AWARDED_REWARDS, awardedRewards);
  }, [awardedRewards, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.SETTINGS, settings);
  }, [settings, isLoading]);

  useEffect(() => {
    if (!isLoading) saveData(STORAGE_KEYS.LAST_NOTIFIED, lastNotified);
  }, [lastNotified, isLoading]);

  // ---- Haptics ----

  const triggerHaptic = useCallback(
    (style = 'success') => {
      if (Platform.OS === 'web') return;
      if (!settings.hapticsEnabled) return;

      if (style === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (style === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [settings.hapticsEnabled]
  );

  // ---- Rewards ----

  const grantRewards = useCallback(
    (nextCompletedIds, nextAnswers) => {
      const { pointsEarned, newlyAwarded } = calculateNewRewards({
        awardedRewards,
        completedIds: nextCompletedIds,
        quizAnswers: nextAnswers,
        questions: quizQuestions,
        items: checklistItems,
      });

      if (pointsEarned > 0) {
        setPoints((current) => current + pointsEarned);
        setAwardedRewards((current) => [...current, ...newlyAwarded]);
      }

      return pointsEarned;
    },
    [awardedRewards]
  );

  // ---- Checklist ----

  const toggleChecklistItem = useCallback(
    (itemId) => {
      const wasCompleted = completedIds.includes(itemId);
      const next = toggleItem(completedIds, itemId);

      setCompletedIds(next);

      // Only celebrate when ticking something on, not when unticking.
      if (!wasCompleted) {
        triggerHaptic('light');
        grantRewards(next, quizAnswers);
      }
    },
    [completedIds, quizAnswers, triggerHaptic, grantRewards]
  );

  // ---- Quiz ----

  const answerQuestion = useCallback(
    (questionId, answer) => {
      const next = { ...quizAnswers, [questionId]: answer };
      setQuizAnswers(next);

      const question = quizQuestions.find((q) => q.id === questionId);
      triggerHaptic(question && question.answer === answer ? 'success' : 'error');

      const score = calculateScore(next, quizQuestions);
      setBestScore((current) => updateBestScore(current, score));

      grantRewards(completedIds, next);
    },
    [quizAnswers, completedIds, triggerHaptic, grantRewards]
  );

  // Clears the answers so the quiz can be retaken. Points and the best
  // score are deliberately kept - retaking should not cost anything, and
  // the reward keys stop it paying out twice.
  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
  }, []);

  // ---- Notifications ----

  // Checks both risks after a fetch and notifies only if something has
  // genuinely worsened. All the decision logic is in notificationUtils so
  // it can be unit tested; this function only does the sending.
  const checkForRiskNotifications = useCallback(
    async (nextEnvironment) => {
      if (!settings.riskNotificationsEnabled) return;
      if (Platform.OS === 'web') return;

      const permission = await requestNotificationPermission();
      if (!permission.granted) return;

      let updatedRecord = lastNotified;

      for (const type of ['flood', 'haze']) {
        const nextRisk = nextEnvironment[type].risk;
        const previousRisk = previousRiskRef.current[type];

        if (
          shouldNotify({
            nextRisk,
            previousRisk,
            lastNotified: updatedRecord,
            type,
            enabled: settings.riskNotificationsEnabled,
          })
        ) {
          const message = buildRiskMessage(type, nextRisk);
          await sendRiskNotification(message.title, message.body);
          updatedRecord = recordNotification(updatedRecord, type, nextRisk);
        }
      }

      if (updatedRecord !== lastNotified) {
        setLastNotified(updatedRecord);
      }
    },
    [settings.riskNotificationsEnabled, lastNotified]
  );

  // ---- Environment data ----

  const refreshEnvironment = useCallback(async () => {
    setDataStatus('loading');

    const result = await fetchWithCache(
      STORAGE_KEYS.CACHE_ENVIRONMENT,
      fetchEnvironmentData
    );

    if (result.data) {
      setEnvironment(result.data);
      setCacheAge(result.fetchedAt);
      setDataStatus(result.isFromCache ? 'cached' : 'live');

      // Only notify about live data. Cached readings are old, so alerting
      // on them would be telling the user about conditions that may have
      // already passed.
      if (!result.isFromCache) {
        await checkForRiskNotifications(result.data);
      }

      previousRiskRef.current = {
        flood: result.data.flood.risk,
        haze: result.data.haze.risk,
      };
    } else {
      // No live data and nothing cached. Show honestly that the risk is
      // unknown rather than defaulting to Low.
      setEnvironment({
        flood: {
          risk: 'Unavailable',
          detail: 'Flood information could not be loaded',
          value: null,
        },
        haze: {
          risk: 'Unavailable',
          detail: 'Air quality information could not be loaded',
          value: null,
        },
        fetchedAt: null,
      });
      setCacheAge(null);
      setDataStatus('unavailable');
    }
  }, [checkForRiskNotifications]);

  // Fetch once the saved data has loaded, so a cached result is available
  // to fall back on if the network fails.
  useEffect(() => {
    if (!isLoading) {
      refreshEnvironment();
    }
    // Deliberately not depending on refreshEnvironment - it changes
    // whenever settings change, which would refetch on every toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ---- Settings ----

  const updateSettings = useCallback((changes) => {
    setSettings((current) => ({ ...current, ...changes }));
  }, []);

  const resetAllData = useCallback(async () => {
    await clearAllData(Object.values(STORAGE_KEYS));
    setCompletedIds([]);
    setQuizAnswers({});
    setBestScore(0);
    setPoints(0);
    setAwardedRewards([]);
    setSettings(DEFAULT_SETTINGS);
    setLastNotified({});
    setEnvironment(INITIAL_ENVIRONMENT);
    setDataStatus('loading');
    setCacheAge(null);
    previousRiskRef.current = { flood: 'Unavailable', haze: 'Unavailable' };
    refreshEnvironment();
  }, [refreshEnvironment]);

  // Badges are worked out from the current state rather than stored, so
  // they can never fall out of step with the checklist and quiz.
  const earnedBadges = earnedBadgeIds({
    completedIds,
    quizAnswers,
    questions: quizQuestions,
    items: checklistItems,
  });

  const value = {
    completedIds,
    quizAnswers,
    bestScore,
    points,
    awardedRewards,
    earnedBadges,
    toggleChecklistItem,
    answerQuestion,
    resetQuiz,

    environment,
    dataStatus,
    cacheAge,
    refreshEnvironment,

    settings,
    updateSettings,
    resetAllData,
    triggerHaptic,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook so screens can call useApp() instead of importing both
// useContext and AppContext every time.
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
}