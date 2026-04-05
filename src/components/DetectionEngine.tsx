import React, { useState, createContext, useContext } from 'react';

interface DetectionContextType {
  isLoading: boolean;
  error: string | null;
  detectPerson: (base64Image: string) => Promise<{ label: string; score: number }[]>;
}

const DetectionContext = createContext<DetectionContextType>({
  isLoading: false,
  error: null,
  detectPerson: async () => [],
});

export const useDetection = () => useContext(DetectionContext);

export const DetectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hugging Face Inference API for Object Detection
  // Using facebook/detr-resnet-50 (Standard, reliable)
  const detectPerson = async (base64Image: string) => {
    const token = process.env.EXPO_PUBLIC_HF_API_TOKEN;
    
    if (!token || token === 'your_token_here') {
      console.warn('Mobile AI: Missing EXPO_PUBLIC_HF_API_TOKEN');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean base64 string
      const imageData = base64Image.split(',')[1] || base64Image;

      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: imageData }),
        }
      );

      if (!response.ok) {
        throw new Error(`HF API Error: ${response.status}`);
      }

      const results = await response.json();
      
      // Filter for 'person' with > 0.5 confidence
      return results.filter((item: any) => 
        item.label === 'person' && item.score > 0.5
      );
    } catch (err) {
      console.error('Cloud AI Error:', err);
      setError('Cloud detection failed.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DetectionContext.Provider value={{ isLoading, error, detectPerson }}>
      {children}
    </DetectionContext.Provider>
  );
};
