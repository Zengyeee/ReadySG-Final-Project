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

// Main context used to share data between the different screens.
const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  riskNotificationsEnabled: true,
  hapticsEnabled: true,
};

// Default state before the flood and haze information has been loaded.
const INITIAL_ENVIRONMENT = {
  flood: { risk: 'Unavailable', detail: 'Loading flood information', value: null },
  haze: { risk: 'Unavailable', detail: 'Loading air quality information', value: null },
  fetchedAt: null,
};

export function AppProvider({ children }) {
  // Stores the main progress and settings used throughout the application.
  const [completedIds, setCompletedIds] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [bestScore, setBestScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [awardedRewards, setAwardedRewards] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lastNotified, setLastNotified] = useState({});

  // Stores the current flood and haze information.
  const [environment, setEnvironment] = useState(INITIAL_ENVIRONMENT);
  const [dataStatus, setDataStatus] = useState('loading');
  const [cacheAge, setCacheAge] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // Keeps the previous risk so the app can detect when the risk becomes higher.
  const previousRiskRef = useRef({ flood: 'Unavailable', haze: 'Unavailable' });

  // ---- Loading saved data ----

  // Loads the user's saved progress and settings when the app starts.
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

      // Keeps the default settings if a new setting is added later.
      setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      setLastNotified(savedNotified);

      setIsLoading(false);
    }

    loadEverything();
  }, []);

  // ---- Saving ----

  // Save the user's data whenever it changes after the first load is finished.
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

  // Gives simple vibration feedback when the user completes an action.
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

  // Calculates and adds new points earned from checklist or quiz progress.
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

  // Updates the checklist and gives rewards for newly completed items.
  const toggleChecklistItem = useCallback(
    (itemId) => {
      const wasCompleted = completedIds.includes(itemId);
      const next = toggleItem(completedIds, itemId);

      setCompletedIds(next);

      // Only give feedback and check rewards when an item is completed.
      if (!wasCompleted) {
        triggerHaptic('light');
        grantRewards(next, quizAnswers);
      }
    },
    [completedIds, quizAnswers, triggerHaptic, grantRewards]
  );

  // ---- Quiz ----

  // Saves an answer, updates the best score and checks for new rewards.
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

  // Clears the current answers so the user can try the quiz again.
  const resetQuiz = useCallback(() => {
    setQuizAnswers({});
  }, []);

  // ---- Notifications ----

  // Checks whether flood or haze risk increased and sends a notification if needed.
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

  // Gets the latest flood and haze information, with cached data as backup.
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

      // Notifications are only sent using current live data.
      if (!result.isFromCache) {
        await checkForRiskNotifications(result.data);
      }

      previousRiskRef.current = {
        flood: result.data.flood.risk,
        haze: result.data.haze.risk,
      };
    } else {
      // Clearly show unavailable when no live or cached data can be loaded.
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

  // Fetch the environmental information after saved data has loaded.
  useEffect(() => {
    if (!isLoading) {
      refreshEnvironment();
    }

    // Avoid fetching again every time a setting changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ---- Settings ----

  // Updates only the settings that have been changed.
  const updateSettings = useCallback((changes) => {
    setSettings((current) => ({ ...current, ...changes }));
  }, []);

  // Clears all saved progress and returns the app to its starting state.
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

  // Work out the badges from the user's current checklist and quiz progress.
  const earnedBadges = earnedBadgeIds({
    completedIds,
    quizAnswers,
    questions: quizQuestions,
    items: checklistItems,
  });

  // Values and functions that can be used by the other screens.
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

// Makes it easier for screens to access the shared app data.
export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }

  return context;
}