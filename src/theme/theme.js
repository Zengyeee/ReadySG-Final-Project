// Common design values used throughout the app.

export const colors = {
  // Main app colours
  primary: '#1f3f66',
  primaryLight: '#e0ecff',
  primaryBorder: '#bfdbfe',

  // Background colours
  background: '#edf4fb',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',

  // Text colours
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',

  border: '#e5e7eb',
  borderStrong: '#cbd5e1',

  // Colours used for the different risk levels.
  riskLow: { bg: '#ecfdf5', border: '#86efac', text: '#047857' },
  riskModerate: { bg: '#fffbeb', border: '#fcd34d', text: '#b45309' },
  riskHigh: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  riskUnknown: { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },

  success: '#047857',
  warning: '#b45309',
  danger: '#b91c1c',
};

// Spacing values used to keep the layout consistent.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

// Minimum size used for buttons and other items that can be pressed.
export const touchTarget = 44;

export const typography = {
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
  bodyStrong: { fontSize: 15, fontWeight: '700', color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};

export const maxContentWidth = 480;

// Return the correct colours for each risk level.
export function riskPalette(risk) {
  if (risk === 'Low') return colors.riskLow;
  if (risk === 'Moderate') return colors.riskModerate;
  if (risk === 'High') return colors.riskHigh;
  return colors.riskUnknown;
}