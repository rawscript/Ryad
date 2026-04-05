import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Brain, Sparkles, Wand2 } from 'lucide-react-native';
import { glassStyles, GLASS_COLORS } from '../theme/glass';

export const ProcessingView: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={[glassStyles.card, styles.inner]}>
        <View style={styles.iconContainer}>
          <Brain size={48} color={GLASS_COLORS.primary} strokeWidth={1.5} />
          <View style={styles.sparklePos}>
            <Sparkles size={24} color={GLASS_COLORS.accent} />
          </View>
        </View>
        
        <Text style={styles.title}>AI ANALYSING</Text>
        <Text style={styles.subtitle}>CROPPING INDIVIDUALS & REMOVING BACKGROUNDS</Text>
        
        <View style={styles.loaderLine}>
            <ActivityIndicator color={GLASS_COLORS.primary} size="small" />
            <Text style={styles.loadingText}>DEPLOYING NEURAL NETS...</Text>
        </View>

        <View style={styles.badge}>
            <Wand2 size={12} color={GLASS_COLORS.secondary} />
            <Text style={styles.badgeText}>BETA V2 ENGINE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 24 },
  inner: { width: '100%', padding: 40, alignItems: 'center', justifyContent: 'center', elevation: 20 },
  iconContainer: { marginBottom: 24, position: 'relative' },
  sparklePos: { position: 'absolute', top: -10, right: -10 },
  title: { fontSize: 20, fontWeight: '900', color: '#0f172a', letterSpacing: 2, marginBottom: 8 },
  subtitle: { fontSize: 10, fontWeight: '700', color: '#64748b', textAlign: 'center', letterSpacing: 1, lineHeight: 16 },
  loaderLine: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 40 },
  loadingText: { fontSize: 10, fontWeight: '900', color: GLASS_COLORS.primary, letterSpacing: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginTop: 40 },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#64748b', letterSpacing: 1 },
});
