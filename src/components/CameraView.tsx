import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCamera, CameraType, useCameraPermissions } from 'expo-camera';
import { RefreshCcw, AlertCircle, Cloud, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { glassStyles, GLASS_COLORS } from '../theme/glass';

interface CameraViewProps {
  onCapture: (image: string) => void;
  onProcess: () => void;
  shotCount: number;
  isPaused: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onProcess, shotCount, isPaused }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<ExpoCamera>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const takeShot = async () => {
    if (cameraRef.current) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
          skipProcessing: true,
          shutterSound: false,
        });
        
        if (photo.base64) {
          onCapture(`data:image/jpeg;base64,${photo.base64}`);
        }
      } catch (e) {
        console.error('Capture failed:', e);
      }
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={GLASS_COLORS.primary} size="large" />
        <Text style={styles.loadingText}>INITIALISING CAMERA...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={48} color={GLASS_COLORS.secondary} strokeWidth={1.5} />
        <Text style={styles.errorText}>CAMERA ACCESS DENIED</Text>
        <Text style={styles.subText}>Check your device settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCamera 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
      />
      
      {/* Immersive Overlay */}
      <View style={StyleSheet.absoluteFill}>
        {/* HUD Overlay */}
        <View style={styles.hud}>
          <View style={[glassStyles.darkCard, styles.statusBadge]}>
            <View style={[styles.pulse, { backgroundColor: shotCount > 0 ? '#22c55e' : '#94a3b8' }]} />
            <Text style={styles.statusText}>{shotCount} SHOTS TAKEN</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <RefreshCcw size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Shutter Button Container */}
        <View style={styles.shotZone}>
          <TouchableOpacity 
            style={styles.shutterOuter}
            onPress={takeShot}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>
        </View>

        {shotCount > 0 && (
          <TouchableOpacity 
            style={[glassStyles.darkCard, styles.processButton]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onProcess();
            }}
          >
            <Zap size={14} color="white" fill="white" />
            <Text style={styles.processText}>FINISH & PROCESS</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Cloud size={14} color="white" style={{ opacity: 0.8 }} strokeWidth={2} />
          <Text style={styles.footerText}>MANUAL HIGH-RES MODE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 450, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000', marginBottom: 32, elevation: 15 },
  camera: { flex: 1 },
  centered: { height: 450, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 32 },
  loadingText: { fontSize: 10, fontWeight: '900', color: GLASS_COLORS.muted, letterSpacing: 2, marginTop: 16 },
  errorText: { fontSize: 14, fontWeight: '900', color: GLASS_COLORS.text, marginTop: 16 },
  subText: { fontSize: 10, fontWeight: '700', color: GLASS_COLORS.muted, marginTop: 4 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100 },
  pulse: { width: 6, height: 6, borderRadius: 100 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  flipButton: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  shotZone: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 40 },
  shutterOuter: { width: 80, height: 80, borderRadius: 100, borderWidth: 4, borderColor: 'white', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 100, backgroundColor: 'white' },
  footer: { position: 'absolute', bottom: 20, left: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { color: 'white', fontSize: 8, fontWeight: '900', letterSpacing: 2, opacity: 0.8 },
  processButton: { position: 'absolute', bottom: 40, right: 24, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, backgroundColor: 'rgba(34, 197, 94, 0.4)', borderColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1 },
  processText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 }
});


