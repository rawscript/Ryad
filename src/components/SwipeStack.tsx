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
import { User, Users, Baby, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react-native';
import { glassStyles, GLASS_COLORS } from '../theme/glass';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeStackProps {
  queue: string[];
  onSwipe: (type: 'man' | 'woman' | 'child', image: string) => void;
}

export const SwipeStack: React.FC<SwipeStackProps> = ({ queue, onSwipe }) => {
  const [index, setIndex] = useState(0);

  const handleNext = (type: 'man' | 'woman' | 'child') => {
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
      <SwipeCard 
        key={index}
        image={queue[index]}
        onSwipe={handleNext}
      />
      
      {/* Help Indicators */}
      <View style={styles.indicators}>
        <Indicator icon={<ChevronLeft size={14} color="#94a3b8" />} label="WOMAN" />
        <Indicator icon={<ChevronUp size={14} color="#94a3b8" />} label="CHILD" />
        <Indicator icon={<ChevronRight size={14} color="#94a3b8" />} label="MAN" />
      </View>
    </View>
  );
};

const SwipeCard: React.FC<{ image: string; onSwipe: (type: 'man' | 'woman' | 'child') => void }> = ({ image, onSwipe }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const type = event.translationX > 0 ? 'man' : 'woman';
        translateX.value = withSpring(event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH);
        runOnJS(onSwipe)(type);
      } else if (Math.abs(event.translationY) > SWIPE_THRESHOLD) {
        translateY.value = withSpring(event.translationY > 0 ? SCREEN_HEIGHT : -SCREEN_HEIGHT);
        runOnJS(onSwipe)('child');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, SCREEN_WIDTH], [-15, 15], Extrapolation.CLAMP)}deg` }
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, glassStyles.card, animatedStyle]}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        
        {/* Dynamic State Badges */}
        <AnimatedOverlay x={translateX} y={translateY} />
      </Animated.View>
    </GestureDetector>
  );
};

const AnimatedOverlay: React.FC<{ x: SharedValue<number>; y: SharedValue<number> }> = ({ x, y }) => {
  const manOpacity = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 100], [0, 1], Extrapolation.CLAMP) }));
  const womanOpacity = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, -100], [0, 1], Extrapolation.CLAMP) }));
  const childOpacity = useAnimatedStyle(() => ({ opacity: interpolate(Math.abs(y.value), [0, 100], [0, 1], Extrapolation.CLAMP) }));

  return (
    <>
      <Animated.View style={[styles.overlay, styles.manOverlay, manOpacity]}>
        <User size={32} color="white" />
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.womanOverlay, womanOpacity]}>
        <Users size={32} color="white" />
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.childOverlay, childOpacity]}>
        <Baby size={32} color="white" />
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
  container: { width: '100%', height: 400, alignItems: 'center', justifyContent: 'center' },
  card: { width: SCREEN_WIDTH * 0.8, height: '100%', elevation: 10 },
  image: { width: '100%', height: '100%' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, fontWeight: '900', color: GLASS_COLORS.text, letterSpacing: 2, marginTop: 16 },
  emptySubtext: { fontSize: 10, fontWeight: '700', color: GLASS_COLORS.muted, letterSpacing: 1, marginTop: 4 },
  overlay: { position: 'absolute', top: 20, padding: 12, borderRadius: 100 },
  manOverlay: { right: 20, backgroundColor: GLASS_COLORS.primary },
  womanOverlay: { left: 20, backgroundColor: GLASS_COLORS.secondary },
  childOverlay: { bottom: 20, alignSelf: 'center', backgroundColor: GLASS_COLORS.accent },
  indicators: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', position: 'absolute', bottom: -50, paddingHorizontal: 40 },
  indicatorItem: { alignItems: 'center', opacity: 0.6 },
  indicatorLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginTop: 4 }
});
