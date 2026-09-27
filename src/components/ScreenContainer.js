import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, maxContentWidth } from '../theme/theme';

// Every screen needs the same safe-area handling, padding and maximum
// width, so rather than repeating that in eight places this wrapper does
// it once.
//
// scroll={false} is for screens that use a FlatList, since a FlatList
// cannot be nested inside a ScrollView.
export default function ScreenContainer({
  title,
  subtitle,
  headerRight,
  scroll = true,
  onRefresh,
  refreshing = false,
  children,
}) {
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
        // Pull to refresh only makes sense when a screen has something to
        // refresh, so it is only attached when a handler is passed in.
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