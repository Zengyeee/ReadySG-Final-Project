import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import RiskCard from '../components/RiskCard';
import StatusBanner from '../components/StatusBanner';
import SectionCard from '../components/SectionCard';
import ProgressBar from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { checklistItems } from '../data/checklistItems';
import { quizQuestions } from '../data/quizQuestions';
import { calculateProgress } from '../utils/progressUtils';
import { calculatePercentage } from '../utils/quizUtils';
import { levelFromPoints, pointsToNextLevel } from '../utils/gamificationUtils';
import { formatUpdatedAt } from '../utils/dateUtils';
import { colors, radius, spacing, typography } from '../theme/theme';

// Main dashboard showing current risks and the user's preparedness progress.
export default function HomeScreen({ navigation }) {
  const {
    environment,
    dataStatus,
    cacheAge,
    refreshEnvironment,
    completedIds,
    quizAnswers,
    points,
    earnedBadges,
  } = useApp();

  const isOnline = useNetworkStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate the user's current checklist, quiz and level progress.
  const checklistPercentage = calculateProgress(completedIds, checklistItems);
  const quizPercentage = calculatePercentage(quizAnswers, quizQuestions);
  const level = levelFromPoints(points);
  const toNextLevel = pointsToNextLevel(points);

  // Refresh the latest flood and haze information.
  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshEnvironment();
    setIsRefreshing(false);
  }

  return (
    <ScreenContainer
      title="ReadySG"
      subtitle="Stay prepared for flood and haze"
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      headerRight={
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </Pressable>
      }
    >
      <StatusBanner
        dataStatus={dataStatus}
        cacheAge={cacheAge}
        isOnline={isOnline}
      />

      <Text style={styles.sectionLabel}>CURRENT CONDITIONS</Text>

      {/* Current flood and haze risk information. */}
      <RiskCard
        title="Flood"
        icon="🌊"
        risk={environment.flood.risk}
        detail={environment.flood.detail}
        onPress={() => navigation.navigate('Guidance', { type: 'flood' })}
      />

      <RiskCard
        title="Haze"
        icon="🌫️"
        risk={environment.haze.risk}
        detail={environment.haze.detail}
        onPress={() => navigation.navigate('Guidance', { type: 'haze' })}
      />

      {environment.fetchedAt ? (
        <Text style={styles.updatedAt}>
          {formatUpdatedAt(environment.fetchedAt)} · pull down to refresh
        </Text>
      ) : null}

      <Text style={styles.sectionLabel}>YOUR PREPAREDNESS</Text>

      {/* Shows the user's points, level and badges. */}
      <SectionCard
        icon="trophy-outline"
        title={level.title}
        subtitle={
          toNextLevel > 0
            ? `${toNextLevel} points to the next level`
            : 'Highest level reached'
        }
        value={`${points}`}
        onPress={() => navigation.navigate('Achievements')}
      >
        <View style={styles.badgeRow}>
          <Text style={typography.caption}>
            {earnedBadges.length} of 4 badges earned
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        icon="checkbox-outline"
        title="Preparedness checklist"
        subtitle={`${checklistPercentage}% complete`}
        onPress={() => navigation.navigate('Prepare')}
      >
        <View style={styles.progressWrap}>
          <ProgressBar percentage={checklistPercentage} />
        </View>
      </SectionCard>

      <SectionCard
        icon="school-outline"
        title="Safety quiz"
        subtitle={
          quizPercentage > 0
            ? `Best attempt: ${quizPercentage}%`
            : 'Not attempted yet'
        }
        onPress={() => navigation.navigate('Learn')}
      />

      <Text style={styles.sectionLabel}>IN AN EMERGENCY</Text>

      {/* Quick access to nearby support and emergency contacts. */}
      <SectionCard
        icon="location-outline"
        title="Nearby support"
        subtitle="Hospitals, clinics and community centres"
        onPress={() => navigation.navigate('NearbySupport')}
      />

      <Pressable
        style={styles.emergencyCard}
        onPress={() => navigation.navigate('Resources')}
        accessibilityRole="button"
        accessibilityLabel="Emergency contacts and official sources"
      >
        <Ionicons name="call" size={20} color={colors.riskHigh.text} />
        <View style={styles.emergencyText}>
          <Text style={styles.emergencyTitle}>Emergency contacts</Text>
          <Text style={typography.caption}>995 ambulance · 999 police</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.riskHigh.text} />
      </Pressable>
    </ScreenContainer>
  );
}

// Styling for the home dashboard.
const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  updatedAt: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  badgeRow: { marginTop: spacing.md },
  progressWrap: { marginTop: spacing.md },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.riskHigh.bg,
    borderWidth: 1,
    borderColor: colors.riskHigh.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  emergencyText: { flex: 1 },
  emergencyTitle: {
    ...typography.bodyStrong,
    color: colors.riskHigh.text,
    marginBottom: 2,
  },
});