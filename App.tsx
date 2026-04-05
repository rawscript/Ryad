import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImageManipulator from 'expo-image-manipulator';
import { DetectionProvider, useDetection } from './src/components/DetectionEngine';
import { CameraView } from './src/components/CameraView';
import { ProcessingView } from './src/components/ProcessingView';
import { SwipeStack } from './src/components/SwipeStack';
import { ReportView } from './src/components/ReportView';
import { Activity, Layers, Info, Users, BarChart3, ChevronRight } from 'lucide-react-native';
import { GLASS_COLORS } from './src/theme/glass';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DetectionProvider>
          <MainContent />
        </DetectionProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function MainContent() {
  const [counts, setCounts] = useState({ man: 0, woman: 0, child: 0 });
  const [queue, setQueue] = useState<string[]>([]);
  const [shots, setShots] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime] = useState(new Date());
  const [view, setView] = useState<'capture' | 'review' | 'report'>('capture');
  const { detectPerson } = useDetection();

  const handleCapture = useCallback((image: string) => {
    setShots(prev => [...prev, image]);
  }, []);

  const processCaptures = async () => {
    if (shots.length === 0) return;
    setIsProcessing(true);
    
    try {
      let allCrops: string[] = [];
      for (const shot of shots) {
        // We need the photo dimensions for cropping, but DETR returns absolute pixels.
        // The detectPerson function handles the API call.
        // We'll move the cropping logic to a utility or keep it in the loop if we have access to dimensions.
        // For now, let's assume detectPerson returns base64 crops for us if we update it, 
        // or we handle it here.
        
        // Wait, the current detectPerson in DetectionEngine returns {label, score, box}.
        // I should probably make a helper to process a single shot and return crops.
        const detections = await detectPerson(shot);
        if (detections.length > 0) {
          // Perform cropping (same logic as before in CameraView but centralised)
          const crops = await Promise.all(detections.slice(0, 15).map(async (det) => {
            const { xmin, ymin, xmax, ymax } = det.box;
            const result = await ImageManipulator.manipulateAsync(
              shot.startsWith('data:') ? shot : `data:image/jpeg;base64,${shot}`,
              [{ crop: { originX: xmin, originY: ymin, width: xmax - xmin, height: ymax - ymin } }],
              { base64: true, format: ImageManipulator.SaveFormat.JPEG }
            );
            return `data:image/jpeg;base64,${result.base64}`;
          }));
          allCrops = [...allCrops, ...crops];
        }
      }
      setQueue(allCrops);
      setView('review');
    } catch (err) {
      console.error('Batch processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwipe = useCallback((type: 'man' | 'woman' | 'child' | 'ignore', _: string) => {
    if (type !== 'ignore') {
      setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
  }, []);

  const handleFinish = () => setView('report');
  
  const handleReset = () => {
    setCounts({ man: 0, woman: 0, child: 0 });
    setQueue([]);
    setShots([]);
    setView('capture');
  };

  if (isProcessing) return <ProcessingView />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.iconBox}>
              <Activity size={24} color="white" />
            </View>
            <View>
              <Text style={styles.brand}>VISION</Text>
              <Text style={styles.tagline}>HUMAN COUNTER AI</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Info size={24} color={GLASS_COLORS.muted} />
          </TouchableOpacity>
        </View>

        {view === 'capture' ? (
          <View style={styles.content}>
            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <MiniStat label="MAN" value={counts.man} color={GLASS_COLORS.primary} />
              <MiniStat label="WOMAN" value={counts.woman} color={GLASS_COLORS.secondary} />
              <MiniStat label="CHILD" value={counts.child} color={GLASS_COLORS.accent} />
            </View>

            {/* Camera Feed */}
            <CameraView 
              onCapture={handleCapture}
              shotCount={shots.length}
              onProcess={processCaptures}
              isPaused={false} 
            />

            {/* Pipeline Status */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CAPTURED SESSIONS</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{shots.length} SHOTS</Text>
              </View>
            </View>
          </View>
        ) : view === 'review' ? (
          <View style={styles.content}>
             <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>REVIEWING DETECTIONS</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{queue.length} REMAINING</Text>
                </View>
              </View>

            {/* Interaction Stack */}
            <SwipeStack 
              queue={queue} 
              onSwipe={handleSwipe} 
            />

            {/* Finalize Button */}
            <TouchableOpacity 
              style={[styles.finalizeButton, { opacity: queue.length > 50 ? 0.6 : 1 }]} 
              onPress={handleFinish}
            >
              <Text style={styles.finalizeText}>GENERATE FINAL REPORT</Text>
              <BarChart3 size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <ReportView 
            counts={counts} 
            startTime={startTime} 
            endTime={new Date()} 
            onReset={handleReset} 
          />
        )}
      </ScrollView>

      {/* Floating Navigation Decoration (Mobile Style) */}
      <View style={styles.floatingNav}>
        <Layers size={20} color={GLASS_COLORS.muted} />
        <Users size={20} color={GLASS_COLORS.primary} />
        <BarChart3 size={20} color={GLASS_COLORS.muted} />
      </View>
    </SafeAreaView>
  );
}

const MiniStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={styles.miniStat}>
    <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
    <Text style={styles.miniStatLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, backgroundColor: '#0f172a', borderRadius: 14, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
  brand: { fontSize: 24, fontWeight: '900', color: '#0f172a', letterSpacing: -1, lineHeight: 24 },
  tagline: { fontSize: 8, fontWeight: '800', color: '#94a3b8', letterSpacing: 2 },
  infoButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 12 },
  miniStat: { flex: 1, backgroundColor: 'white', padding: 12, borderRadius: 20, alignItems: 'center', elevation: 2 },
  miniStatValue: { fontSize: 20, fontWeight: '900' },
  miniStatLabel: { fontSize: 8, fontWeight: '800', color: '#94a3b8', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
  badge: { backgroundColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 8, fontWeight: '900', color: '#64748b' },
  finalizeButton: { marginTop: 80, height: 72, backgroundColor: '#0f172a', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 10 },
  finalizeText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  floatingNav: { 
    position: 'absolute', 
    bottom: 24, 
    alignSelf: 'center', 
    width: 240, 
    height: 64, 
    backgroundColor: 'white', 
    borderRadius: 32, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
});
