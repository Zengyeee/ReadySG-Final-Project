import React from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { colors, radius, spacing, typography, touchTarget } from '../theme/theme';

// Emergency contact numbers shown in the app.
const EMERGENCY_CONTACTS = [
  {
    id: 'scdf',
    name: 'Ambulance and Fire',
    number: '995',
    description: 'SCDF emergency line',
  },
  {
    id: 'police',
    name: 'Police',
    number: '999',
    description: 'Urgent police assistance',
  },
  {
    id: 'scdf-nonemergency',
    name: 'SCDF non-emergency',
    number: '1777',
    description: 'Non-urgent ambulance requests',
  },
];

// Official sources for more information about emergencies and weather.
const OFFICIAL_SOURCES = [
  {
    id: 'nea',
    name: 'NEA Haze Information',
    description: 'Live PSI readings and haze advisories',
    url: 'https://www.haze.gov.sg/',
  },
  {
    id: 'pub',
    name: 'PUB Flood Alerts',
    description: 'Flash flood alerts and water level updates',
    url: 'https://t.me/pubfloodalerts',
  },
  {
    id: 'weather',
    name: 'MSS Weather Forecast',
    description: 'Rainfall and weather warnings',
    url: 'https://www.weather.gov.sg/',
  },
  {
    id: 'scdf-site',
    name: 'SCDF',
    description: 'Emergency preparedness guidance',
    url: 'https://www.scdf.gov.sg/',
  },
  {
    id: 'moh',
    name: 'Ministry of Health',
    description: 'Health advisories during haze',
    url: 'https://www.moh.gov.sg/',
  },
];

// Shows emergency contacts and useful official sources.
export default function ResourcesScreen() {
  // Opens the phone dialler with the selected number.
  function handleCall(number) {
    Linking.openURL(`tel:${number}`);
  }

  // Opens the selected official website.
  function handleOpen(url) {
    Linking.openURL(url);
  }

  return (
    <ScreenContainer
      title="Resources"
      subtitle="Emergency contacts and official sources"
    >
      <Text style={styles.sectionLabel}>EMERGENCY NUMBERS</Text>

      {EMERGENCY_CONTACTS.map((contact) => (
        <Pressable
          key={contact.id}
          style={styles.emergencyRow}
          onPress={() => handleCall(contact.number)}
          accessibilityRole="button"
          accessibilityLabel={`Call ${contact.name} on ${contact.number}`}
        >
          <View style={styles.numberCircle}>
            <Text style={styles.numberText}>{contact.number}</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{contact.name}</Text>
            <Text style={typography.caption}>{contact.description}</Text>
          </View>
          <Ionicons name="call" size={20} color={colors.riskHigh.text} />
        </Pressable>
      ))}

      <Text style={styles.sectionLabel}>OFFICIAL SOURCES</Text>

      {OFFICIAL_SOURCES.map((source) => (
        <Pressable
          key={source.id}
          style={styles.sourceRow}
          onPress={() => handleOpen(source.url)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${source.name}`}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{source.name}</Text>
            <Text style={typography.caption}>{source.description}</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.primary} />
        </Pressable>
      ))}

      <View style={styles.noteCard}>
        <Ionicons
          name="information-circle-outline"
          size={18}
          color={colors.textSecondary}
        />
        <Text style={styles.noteText}>
          ReadySG summarises public information. Always follow official
          instructions from the authorities during an emergency.
        </Text>
      </View>
    </ScreenContainer>
  );
}

// Styling for the emergency contacts and official sources.
const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.riskHigh.bg,
    borderWidth: 1,
    borderColor: colors.riskHigh.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: touchTarget,
  },
  numberCircle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.riskHigh.text,
  },
  numberText: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: touchTarget,
  },
  rowText: { flex: 1 },
  rowTitle: { ...typography.bodyStrong, marginBottom: 2 },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  noteText: { ...typography.caption, flex: 1, lineHeight: 19 },
});