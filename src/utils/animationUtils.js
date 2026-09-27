import { LayoutAnimation, Platform, UIManager } from 'react-native';

// Enables layout animations on Android.
export function enableLayoutAnimations() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Animates the next layout change using the selected animation.
export function animateNextLayout(preset = 'easeInEaseOut') {
  // Layout animations are not used on web.
  if (Platform.OS === 'web') return;

  const presets = {
    easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,
    linear: LayoutAnimation.Presets.linear,
    spring: LayoutAnimation.Presets.spring,
  };

  LayoutAnimation.configureNext(presets[preset] || presets.easeInEaseOut);
}