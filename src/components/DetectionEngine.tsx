import React, { useEffect, useState, createContext, useContext } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-react-native';

interface DetectionContextType {
  model: cocoSsd.ObjectDetection | null;
  isLoading: boolean;
  error: string | null;
}

const DetectionContext = createContext<DetectionContextType>({
  model: null,
  isLoading: true,
  error: null,
});

export const useDetection = () => useContext(DetectionContext);

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initTF = async () => {
      try {
        console.log('Mobile AI: Initializing TFJS...');
        await tf.ready();
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2', // Best for mobile performance
        });
        setModel(loadedModel);
        console.log('Mobile AI: Model Loaded.');
      } catch (err) {
        console.error('Mobile AI Error:', err);
        setError('Detection system failed to load.');
      } finally {
        setIsLoading(false);
      }
    };

    initTF();
  }, []);

  return (
    <DetectionContext.Provider value={{ model, isLoading, error }}>
      {children}
    </DetectionContext.Provider>
  );
};
