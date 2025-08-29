import { useState, useRef, useCallback, useEffect } from 'react';

export interface FaceDetectionResult {
  detected: boolean;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: Array<{ x: number; y: number }>;
}

export class FaceDetector {
  private static instance: FaceDetector | null = null;
  private faceDetector: any = null;
  private isSupported: boolean = false;

  private constructor() {
    this.initializeFaceDetector();
  }

  static getInstance(): FaceDetector {
    if (!FaceDetector.instance) {
      FaceDetector.instance = new FaceDetector();
    }
    return FaceDetector.instance;
  }

  private async initializeFaceDetector() {
    try {
      // Check if Face Detection API is supported
      if ('FaceDetector' in window) {
        this.faceDetector = new (window as any).FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1
        });
        this.isSupported = true;
        console.log('Face Detection API supported');
      } else {
        console.log('Face Detection API not supported, using fallback');
        this.isSupported = false;
      }
    } catch (error) {
      console.error('Error initializing face detector:', error);
      this.isSupported = false;
    }
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<FaceDetectionResult> {
    if (!this.isSupported || !this.faceDetector) {
      // Fallback: basic face detection using canvas analysis
      return this.fallbackFaceDetection(videoElement);
    }

    try {
      const faces = await this.faceDetector.detect(videoElement);
      
      if (faces.length > 0) {
        const face = faces[0];
        return {
          detected: true,
          confidence: face.confidence || 0.8,
          boundingBox: face.boundingBox,
          landmarks: face.landmarks
        };
      }

      return {
        detected: false,
        confidence: 0
      };
    } catch (error) {
      console.error('Face detection error:', error);
      return this.fallbackFaceDetection(videoElement);
    }
  }

  private async fallbackFaceDetection(videoElement: HTMLVideoElement): Promise<FaceDetectionResult> {
    try {
      // Create canvas to analyze video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return { detected: false, confidence: 0 };
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Simple skin tone detection as fallback
      const skinTonePixels = this.detectSkinTone(data, canvas.width, canvas.height);
      const totalPixels = canvas.width * canvas.height;
      const skinToneRatio = skinTonePixels / totalPixels;
      
      // If more than 15% of pixels are skin tone, likely a face
      const detected = skinToneRatio > 0.15;
      
      return {
        detected,
        confidence: detected ? skinToneRatio : 0
      };
    } catch (error) {
      console.error('Fallback face detection error:', error);
      return { detected: false, confidence: 0 };
    }
  }

  private detectSkinTone(data: Uint8ClampedArray, width: number, height: number): number {
    let skinTonePixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection algorithm
      if (this.isSkinTone(r, g, b)) {
        skinTonePixels++;
      }
    }
    
    return skinTonePixels;
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Enhanced skin tone detection
    const rgb = [r, g, b];
    const max = Math.max(...rgb);
    const min = Math.min(...rgb);
    
    // Check if it's a skin tone based on color ratios
    if (max === 0) return false;
    
    const rRatio = r / max;
    const gRatio = g / max;
    const bRatio = b / max;
    
    // Skin tone typically has higher red and green values
    return (
      rRatio > 0.6 && 
      gRatio > 0.4 && 
      bRatio < 0.5 &&
      r > g && 
      g > b &&
      max - min > 30
    );
  }

  isReady(): boolean {
    return this.isSupported;
  }
}

// Real-time face detection hook
export const useFaceDetection = () => {
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  const startDetection = useCallback((videoElement: HTMLVideoElement) => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }

    setIsDetecting(true);
    
    detectionInterval.current = setInterval(async () => {
      try {
        const detector = FaceDetector.getInstance();
        const result = await detector.detectFace(videoElement);
        
        setFaceDetected(result.detected);
        setFaceConfidence(result.confidence);
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 100); // Check every 100ms for smooth detection
  }, []);

  const stopDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    setIsDetecting(false);
  }, []);

  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  return {
    faceDetected,
    faceConfidence,
    isDetecting,
    startDetection,
    stopDetection
  };
};
