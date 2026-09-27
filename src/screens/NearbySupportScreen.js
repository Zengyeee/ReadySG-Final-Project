import React, { useState } from 'react';
import { View, Text, Pressable, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useApp } from '../context/AppContext';
import { supportLocations, supportTypes } from '../data/supportLocations';
import { getCurrentCoordinates } from '../services/locationService';
import {
  addDistances,
  sortByDistance,
  filterByType,
  formatDistance,
  shouldShowDistance,
} from '../utils/distanceUtils';
import { colors, radius, spacing, typography, touchTarget } from '../theme/theme';

export default function NearbySupportScreen({ navigation }) {
  const { triggerHaptic } = useApp();

  const [coordinates, setCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationMessage, setLocationMessage] = useState(null);
  const [activeType, setActiveType] = useState('all');

  async function handleFindNearby() {
    setLocationStatus('loading');
    const result = await getCurrentCoordinates();

    setCoordinates(result.coordinates);
    setLocationStatus(result.status);
    setLocationMessage(result.message);

    if (result.coordinates) triggerHaptic('success');
  }

  // The list works with or without location. Without it, every location is
  // still listed and usable - distance is an enhancement, not a
  // requirement. An emergency app that shows nothing until permission is
  // granted would be useless at exactly the wrong moment.
  const filtered = filterByType(supportLocations, activeType);
  const withDistances = addDistances(filtered, coordinates);
  const visible = coordinates ? sortByDistance(withDistances) : withDistances;

  return (
    <ScreenContainer
      title="Nearby support"
      subtitle="Hospitals, clinics and community centres"
      headerRight={
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      }
    >
      {locationStatus === 'granted' ? (
        <View style={styles.locationActive}>
          <Ionicons name="location" size={18} color={colors.success} />
          <Text style={styles.locationActiveText}>
            Sorted by distance from your location
          </Text>
        </View>
      ) : (
        <Pressable
          style={styles.locationButton}
          onPress={handleFindNearby}
          disabled={locationStatus === 'loading'}
          accessibilityRole="button"
          accessibilityLabel="Sort by distance from my location"
        >
          {locationStatus === 'loading' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {locationStatus === 'loading'
              ? 'Finding your location...'
              : 'Sort by distance from me'}
          </Text>
        </Pressable>
      )}

      {/* A denied permission is explained rather than left silent, so the
          user knows why distances are missing and that nothing is broken. */}
      {locationMessage ? (
        <View style={styles.noticeCard}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.noticeText}>{locationMessage}</Text>
        </View>
      ) : null}

      <View style={styles.chipRow}>
        {['all', ...supportTypes].map((type) => {
          const isSelected = activeType === type;
          return (
            <Pressable
              key={type}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => setActiveType(type)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${type === 'all' ? 'all types' : type}`}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {type === 'all' ? 'All' : type}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visible.map((location) => (
        <View key={location.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardTitle}>{location.name}</Text>
              <Text style={typography.caption}>
                {location.type} · {location.area}
              </Text>
            </View>
            {location.distanceKm !== null && shouldShowDistance(location) ? (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>
                  {formatDistance(location.distanceKm)}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.address}>{location.address}</Text>

          <View style={styles.actionRow}>
            {location.phone ? (
              <Pressable
                style={styles.actionButton}
                onPress={() => Linking.openURL(`tel:${location.phone}`)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${location.name}`}
              >
                <Ionicons name="call-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Call</Text>
              </Pressable>
            ) : null}

            {location.url ? (
              <Pressable
                style={styles.actionButton}
                onPress={() => Linking.openURL(location.url)}
                accessibilityRole="link"
                accessibilityLabel={`Open the website for ${location.name}`}
              >
                <Ionicons name="open-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Website</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    minHeight: touchTarget,
  },
  locationButtonText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  locationActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.riskLow.bg,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  locationActiveText: { color: colors.success, fontWeight: '600', flex: 1 },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  noticeText: { ...typography.caption, flex: 1, lineHeight: 19 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: '#ffffff' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: { ...typography.bodyStrong, marginBottom: 2 },
  distanceBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  distanceText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  address: { ...typography.caption, marginTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  actionText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});