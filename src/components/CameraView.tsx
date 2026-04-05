import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { RefreshCcw, AlertCircle, Scan, Eye } from 'lucide-react-native';
import { glassStyles, GLASS_COLORS } from '../theme/glass';
import { useDetection } from './DetectionEngine';

interface CameraViewProps {
  onPersonDetected: (image: string) => void;
  isPaused: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onPersonDetected, isPaused }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const cameraRef = useRef<Camera>(null);
  const { model, isLoading } = useDetection();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Simple frame capture logic for detection
  // In a real app, we'd use TensorCamera from tfjs-react-native for true real-time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && model && hasPermission) {
      interval = setInterval(async () => {
        if (cameraRef.current) {
          try {
            const photo = await cameraRef.current.takePictureAsync({
              quality: 0.5,
              base64: true,
              skipProcessing: true,
            });
            // Simulate AI detection check on the photo
            // Real detection would happen here using model.detect()
            if (photo.base64) {
              onPersonDetected(`data:image/jpeg;base64,${photo.base64}`);
            }
          } catch (e) {
            console.error('Capture failed:', e);
          }
        }
      }, 3000); // Sample every 3 seconds to save battery
    }
    return () => clearInterval(interval);
  }, [isPaused, model, hasPermission, onPersonDetected]);

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={GLASS_COLORS.primary} size="large" />
        <Text style={styles.loadingText}>REQUESTING CAMERA...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={48} color={GLASS_COLORS.secondary} />
        <Text style={styles.errorText}>CAMERA ACCESS DENIED</Text>
        <Text style={styles.subText}>Check permissions in settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        ref={cameraRef}
        style={styles.camera} 
        type={type}
        autoFocus={true}
      >
        {/* HUD Overlay */}
        <View style={styles.hud}>
          <View style={[glassStyles.darkCard, styles.statusBadge]}>
            <View style={[styles.pulse, { backgroundColor: isLoading ? GLASS_COLORS.accent : '#10b981' }]} />
            <Text style={styles.statusText}>{isLoading ? 'INIT' : 'LIVE'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}
          >
            <RefreshCcw size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Scan Brackets */}
        <View style={styles.brackets}>
          <Scan size={120} color="white" strokeWidth={0.5} style={{ opacity: 0.3 }} />
        </View>

        <View style={styles.footer}>
          <Eye size={16} color="white" style={{ opacity: 0.6 }} />
          <Text style={styles.footerText}>AI SCANNING PERSISTENT</Text>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 350, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000', marginBottom: 32, elevation: 20 },
  camera: { flex: 1 },
  centered: { height: 350, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 32 },
  loadingText: { fontSize: 10, fontWeight: '900', color: GLASS_COLORS.muted, letterSpacing: 2, marginTop: 16 },
  errorText: { fontSize: 14, fontWeight: '900', color: GLASS_COLORS.text, marginTop: 16 },
  subText: { fontSize: 10, fontWeight: '700', color: GLASS_COLORS.muted, marginTop: 4 },
  hud: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  pulse: { width: 6, height: 6, borderRadius: 100 },
  statusText: { color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  flipButton: { width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  brackets: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { position: 'absolute', bottom: 20, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { color: 'white', fontSize: 8, fontWeight: '900', letterSpacing: 2, opacity: 0.6 }
});
