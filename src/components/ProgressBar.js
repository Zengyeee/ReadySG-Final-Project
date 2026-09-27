import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';

// Progress bar used to visually show the user's progress.
export default function ProgressBar({ percentage, height = 10, color }) {
  // Keeps the animation value when the component renders again.
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the bar when the progress percentage changes.
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [percentage, widthAnim]);

  // Converts the progress value from 0-100 into the width of the bar.
  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { height }]}
      testID="progress-bar"
      accessible
      accessibilityRole="progressbar"
      // Allows screen readers to understand the current progress.
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
    >
      <Animated.View
        style={[
          styles.fill,
          { width: widthInterpolated, height, backgroundColor: color || colors.primary },
        ]}
      />
    </View>
  );
}

// Styling for the progress bar background and filled section.
const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: { borderRadius: radius.pill },
});