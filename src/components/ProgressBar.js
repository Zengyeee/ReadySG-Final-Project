import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';

// Animated progress bar using the Animated API from the module. A bar that
// slides into place makes it obvious that the number changed, which a
// static width would not.
export default function ProgressBar({ percentage, height = 10, color }) {
  // useRef keeps the same Animated.Value between renders. With useState a
  // new value would be created each render and the bar would jump back to
  // zero instead of animating from where it was.
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 600,
      // Width cannot be animated on the native thread, so this has to be
      // false here - setting it true throws.
      useNativeDriver: false,
    }).start();
  }, [percentage, widthAnim]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    // Clamped so a value above 100 cannot overflow the track.
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[styles.track, { height }]}
      testID="progress-bar"
      accessible
      accessibilityRole="progressbar"
      // Without this a screen reader user would have no idea how far along
      // they are, since the bar carries no text.
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

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: { borderRadius: radius.pill },
});