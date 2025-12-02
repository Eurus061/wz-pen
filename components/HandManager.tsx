import React, { useEffect, useRef } from 'react';
import { HandState } from '../types';

interface Props {
  onHandUpdate: (state: HandState) => void;
}

const HandManager: React.FC<Props> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let hands: any;
    let camera: any;

    const onResults = (results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Key Landmarks
        // 0: Wrist
        // 4: Thumb Tip
        // 8: Index Tip
        // 12: Middle Tip
        // 9: Middle MCP (Palm center approx)
        
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];
        const middleBase = landmarks[9];

        // 1. Calculate Pinch (Thumb to Index)
        const pinchDist = Math.hypot(
          indexTip.x - thumbTip.x,
          indexTip.y - thumbTip.y
        );

        // 2. Calculate Spread (Average tip distance from palm center)
        // A naive "openness" metric
        const tips = [8, 12, 16, 20].map(i => landmarks[i]);
        const avgDistToPalm = tips.reduce((acc, tip) => {
            return acc + Math.hypot(tip.x - middleBase.x, tip.y - middleBase.y);
        }, 0) / 4;
        
        // Normalize spread (approximate range based on hand size)
        // Hand size varies, so we normalize by wrist-to-middle-base distance
        const handSize = Math.hypot(middleBase.x - wrist.x, middleBase.y - wrist.y);
        const normalizedSpread = Math.min(Math.max((avgDistToPalm / handSize) - 0.8, 0), 1) * 2; // Rough tuning

        // 3. Position (Center of palm)
        // Invert X because webcam is mirrored
        const x = (1 - middleBase.x) * 2 - 1; 
        const y = -(middleBase.y * 2 - 1); 

        const gesture = normalizedSpread > 0.6 ? 'OPEN' : (pinchDist < 0.05 ? 'CLOSED' : 'NEUTRAL');

        onHandUpdate({
          isPresent: true,
          gesture,
          position: { x, y },
          pinchDistance: Math.max(0, Math.min(1, pinchDist * 5)), // Amplify
          spreadFactor: Math.min(1, Math.max(0, normalizedSpread))
        });
      } else {
        onHandUpdate({
          isPresent: false,
          gesture: 'NEUTRAL',
          position: { x: 0, y: 0 },
          pinchDistance: 0,
          spreadFactor: 0
        });
      }
    };

    const loadMediaPipe = async () => {
      if (!(window as any).Hands) {
        console.warn("MediaPipe Hands not loaded yet");
        return;
      }

      hands = new (window as any).Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);

      if (videoRef.current) {
        camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
      }
    };

    // Delay slightly to ensure scripts are parsed
    const timer = setTimeout(loadMediaPipe, 1000);

    return () => {
      clearTimeout(timer);
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="fixed bottom-4 right-4 z-50 opacity-80 overflow-hidden rounded-lg border border-white/20 shadow-xl w-32 h-24 bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover transform -scale-x-100"
        playsInline
        muted
      />
      <div className="absolute top-1 left-1 text-[8px] text-white/70 bg-black/50 px-1 rounded">
        Input
      </div>
    </div>
  );
};

export default HandManager;
