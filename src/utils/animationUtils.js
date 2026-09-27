import { LayoutAnimation, Platform, UIManager } from 'react-native';

// LayoutAnimation animates the difference between two layouts automatically,
// so a list that grows or shrinks slides rather than jumping. It needs to be
// enabled explicitly on Android, and calling that on other platforms throws,
// hence the check.
export function enableLayoutAnimations() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Call immediately before a state change that alters layout. The next
// render is then animated instead of snapping into place.
//
// LayoutAnimation is not supported on web, where it is a silent no-op, so
// the browser preview simply shows the change without the transition.
export function animateNextLayout(preset = 'easeInEaseOut') {
  if (Platform.OS === 'web') return;

  const presets = {
    easeInEaseOut: LayoutAnimation.Presets.easeInEaseOut,
    linear: LayoutAnimation.Presets.linear,
    spring: LayoutAnimation.Presets.spring,
  };

  LayoutAnimation.configureNext(presets[preset] || presets.easeInEaseOut);
}