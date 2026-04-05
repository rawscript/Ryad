import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView as ExpoCamera, CameraType, useCameraPermissions } from 'expo-camera';
import { RefreshCcw, AlertCircle, Scan, Cloud, Zap } from 'lucide-react-native';
import { glassStyles, GLASS_COLORS } from '../theme/glass';
import { useDetection } from './DetectionEngine';

interface CameraViewProps {
  onPersonDetected: (image: string) => void;
  isPaused: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onPersonDetected, isPaused }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<ExpoCamera>(null);
  const { detectPerson, isLoading } = useDetection();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Frame capture logic for Cloud Detection
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && permission?.granted) {
      interval = setInterval(async () => {
        if (cameraRef.current && !isLoading) {
          try {
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.3, // Lower quality for faster network upload
              base64: true,
              skipProcessing: true,
            });
            
            if (photo.base64) {
              const detections = await detectPerson(photo.base64);
              
              if (detections.length > 0) {
                onPersonDetected(`data:image/jpeg;base64,${photo.base64}`);
                console.log(`Cloud AI: Detected ${detections.length} people.`);
              }
            }
          } catch (e) {
            console.error('Capture/Detection failed:', e);
          }
        }
      }, 5000); // 5 seconds to manage API rate limits and battery
    }
    return () => clearInterval(interval);
  }, [isPaused, permission, isLoading, detectPerson, onPersonDetected]);

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
      >
        {/* HUD Overlay */}
        <View style={styles.hud}>
          <View style={[glassStyles.darkCard, styles.statusBadge]}>
            <View style={[styles.pulse, { backgroundColor: isLoading ? GLASS_COLORS.accent : '#22c55e' }]} />
            <Cloud size={10} color="white" />
            <Text style={styles.statusText}>{isLoading ? 'ANALYSING' : 'SCANNING'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <RefreshCcw size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Scan Brackets */}
        <View style={styles.brackets}>
          <Scan size={120} color="white" strokeWidth={0.5} style={{ opacity: 0.3 }} />
        </View>

        <View style={styles.footer}>
          <Zap size={14} color="white" style={{ opacity: 0.8 }} strokeWidth={2} />
          <Text style={styles.footerText}>CLOUD-POWERED AI DETECTION</Text>
        </View>
      </ExpoCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 350, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000', marginBottom: 32, elevation: 15 },
  camera: { flex: 1 },
  centered: { height: 350, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 32 },
  loadingText: { fontSize: 10, fontWeight: '900', color: GLASS_COLORS.muted, letterSpacing: 2, marginTop: 16 },
  errorText: { fontSize: 14, fontWeight: '900', color: GLASS_COLORS.text, marginTop: 16 },
  subText: { fontSize: 10, fontWeight: '700', color: GLASS_COLORS.muted, marginTop: 4 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 100 },
  pulse: { width: 6, height: 6, borderRadius: 100 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  flipButton: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  brackets: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { color: 'white', fontSize: 8, fontWeight: '900', letterSpacing: 2, opacity: 0.8 }
});
