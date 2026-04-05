import { StyleSheet, Platform } from 'react-native';

export const GLASS_COLORS = {
  white: 'rgba(255, 255, 255, 0.7)',
  dark: 'rgba(0, 0, 0, 0.4)',
  primary: '#0ea5e9',
  secondary: '#f43f5e',
  accent: '#fbbf24',
  text: '#1e293b',
  textLight: '#f8fafc',
  muted: '#94a3b8',
};

export const glassStyles = StyleSheet.create({
  container: {
    backgroundColor: GLASS_COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  card: {
    backgroundColor: GLASS_COLORS.white,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  darkCard: {
    backgroundColor: GLASS_COLORS.dark,
    borderRadius: 24,
    padding: 16,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
