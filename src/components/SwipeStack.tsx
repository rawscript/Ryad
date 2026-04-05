import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS,
  interpolate,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import { User, Users, Baby, Trash2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react-native';
import { glassStyles, GLASS_COLORS } from '../theme/glass';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeStackProps {
  queue: string[];
  onSwipe: (type: 'man' | 'woman' | 'child' | 'ignore', image: string) => void;
}

export const SwipeStack: React.FC<SwipeStackProps> = ({ queue, onSwipe }) => {
  const [index, setIndex] = useState(0);

  const handleNext = (type: 'man' | 'woman' | 'child' | 'ignore') => {
    onSwipe(type, queue[index]);
    setIndex(prev => prev + 1);
  };

  if (queue.length === 0 || index >= queue.length) {
    return (
      <View style={[glassStyles.container, styles.emptyContainer]}>
        <CheckCircle size={48} color={GLASS_COLORS.primary} strokeWidth={1.5} />
        <Text style={styles.emptyText}>PIPELINE CLEAR</Text>
        <Text style={styles.emptySubtext}>Awaiting detections...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Cards for visual depth */}
      {index + 1 < queue.length && (
        <View style={[styles.card, styles.cardBack, glassStyles.card]}>
           <Image source={{ uri: queue[index + 1] }} style={[styles.image, { opacity: 0.3 }]} blurRadius={10} />
        </View>
      )}

      <SwipeCard 
        key={index}
        image={queue[index]}
        onSwipe={handleNext}
      />
      
      {/* Help Indicators */}
      <View style={styles.indicators}>
        <View style={styles.indicatorRow}>
            <Indicator icon={<ChevronLeft size={16} color={GLASS_COLORS.secondary} />} label="FEMALE" />
            <View style={styles.verticalIndicators}>
                <Indicator icon={<ChevronUp size={16} color="#ef4444" />} label="IGNORE" />
                <Indicator icon={<ChevronDown size={16} color={GLASS_COLORS.accent} />} label="CHILD" />
            </View>
            <Indicator icon={<ChevronRight size={16} color={GLASS_COLORS.primary} />} label="MALE" />
        </View>
      </View>
    </View>
  );
};

const SwipeCard: React.FC<{ image: string; onSwipe: (type: 'man' | 'woman' | 'child' | 'ignore') => void }> = ({ image, onSwipe }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const absX = Math.abs(event.translationX);
      const absY = Math.abs(event.translationY);

      if (absX > absY && absX > SWIPE_THRESHOLD) {
        // Horizontal Swipe
        const type = event.translationX > 0 ? 'man' : 'woman';
        translateX.value = withSpring(event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, {}, () => {
            runOnJS(onSwipe)(type);
        });
      } else if (absY > absX && absY > SWIPE_THRESHOLD) {
        // Vertical Swipe
        const type = event.translationY > 0 ? 'child' : 'ignore';
        translateY.value = withSpring(event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT, {}, () => {
            runOnJS(onSwipe)(type);
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, SCREEN_WIDTH], [-10, 10], Extrapolation.CLAMP)}deg` }
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, glassStyles.card, animatedStyle]}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        
        {/* Dynamic State Overlays */}
        <AnimatedOverlay x={translateX} y={translateY} />
      </Animated.View>
    </GestureDetector>
  );
};

const AnimatedOverlay: React.FC<{ x: SharedValue<number>; y: SharedValue<number> }> = ({ x, y }) => {
  const manOpacity = useAnimatedStyle(() => ({ 
    opacity: interpolate(x.value, [0, 80], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(x.value, [0, 80], [0.5, 1], Extrapolation.CLAMP) }]
  }));
  const womanOpacity = useAnimatedStyle(() => ({ 
    opacity: interpolate(x.value, [0, -80], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(x.value, [0, -80], [0.5, 1], Extrapolation.CLAMP) }]
  }));
  const childOpacity = useAnimatedStyle(() => ({ 
    opacity: interpolate(y.value, [0, 80], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(y.value, [0, 80], [0.5, 1], Extrapolation.CLAMP) }]
  }));
  const ignoreOpacity = useAnimatedStyle(() => ({ 
    opacity: interpolate(y.value, [0, -80], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(y.value, [0, -80], [0.5, 1], Extrapolation.CLAMP) }]
  }));

  return (
    <>
      <Animated.View style={[styles.overlay, styles.manOverlay, manOpacity]}>
        <User size={40} color="white" />
        <Text style={styles.overlayText}>MALE</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.womanOverlay, womanOpacity]}>
        <Users size={40} color="white" />
        <Text style={styles.overlayText}>FEMALE</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.childOverlay, childOpacity]}>
        <Baby size={40} color="white" />
        <Text style={styles.overlayText}>CHILD</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.ignoreOverlay, ignoreOpacity]}>
        <Trash2 size={40} color="white" />
        <Text style={styles.overlayText}>IGNORE</Text>
      </Animated.View>
    </>
  );
};

const Indicator: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <View style={styles.indicatorItem}>
    {icon}
    <Text style={styles.indicatorLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { width: '100%', height: 420, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  card: { width: SCREEN_WIDTH * 0.85, height: '100%', borderRadius: 32, overflow: 'hidden', backgroundColor: 'white', elevation: 12 },
  cardBack: { position: 'absolute', transform: [{ scale: 0.9 }, { translateY: 15 }], opacity: 0.5, zIndex: -1 },
  image: { width: '100%', height: '100%' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 32 },
  emptyText: { fontSize: 16, fontWeight: '900', color: '#0f172a', letterSpacing: 2, marginTop: 16 },
  emptySubtext: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginTop: 4 },
  overlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  manOverlay: { backgroundColor: 'rgba(59, 130, 246, 0.6)' },
  womanOverlay: { backgroundColor: 'rgba(236, 72, 153, 0.6)' },
  childOverlay: { backgroundColor: 'rgba(16, 185, 129, 0.6)' },
  ignoreOverlay: { backgroundColor: 'rgba(239, 68, 68, 0.6)' },
  overlayText: { color: 'white', fontSize: 24, fontWeight: '900', marginTop: 12, letterSpacing: 2 },
  indicators: { width: '100%', paddingHorizontal: 32, marginTop: 40 },
  indicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verticalIndicators: { alignItems: 'center', gap: 12 },
  indicatorItem: { alignItems: 'center', gap: 6 },
  indicatorLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 }
});
