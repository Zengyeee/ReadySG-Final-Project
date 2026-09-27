import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, maxContentWidth } from '../theme/theme';

// Reusable layout used to keep the screens using the same structure and spacing.
export default function ScreenContainer({
  title,
  subtitle,
  headerRight,
  scroll = true,
  onRefresh,
  refreshing = false,
  children,
}) {
  // Use ScrollView for normal screens and View when scrolling is handled separately.
  const Body = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={typography.title}>{title}</Text>
            {subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}
          </View>
          {headerRight}
        </View>
      ) : null}

      <Body
        style={styles.body}
        contentContainerStyle={scroll ? styles.scrollContent : undefined}
        // Adds pull to refresh only for screens that need it.
        refreshControl={
          scroll && onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          ) : undefined
        }
      >
        {children}
      </Body>
    </SafeAreaView>
  );
}

// Common styling shared by screens using this container.
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
  },
  headerText: { flex: 1 },
  body: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
  },
});