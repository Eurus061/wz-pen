import React, { useState } from 'react';
import Experience from './components/Experience';
import UI from './components/UI';
import HandManager from './components/HandManager';
import { ParticleConfig, ShapeType, HandState } from './types';

function App() {
  const [config, setConfig] = useState<ParticleConfig>({
    color: '#a855f7', // Purple default
    count: 5000,
    size: 0.12,
    shape: ShapeType.SATURN
  });

  const [handState, setHandState] = useState<HandState>({
    isPresent: false,
    gesture: 'NEUTRAL',
    position: { x: 0, y: 0 },
    pinchDistance: 0,
    spreadFactor: 0
  });

  const [customPoints, setCustomPoints] = useState<number[] | null>(null);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-purple-500/30">
      <HandManager onHandUpdate={setHandState} />
      
      <Experience 
        config={config} 
        handState={handState}
        customPoints={customPoints}
      />
      
      <UI 
        config={config} 
        setConfig={setConfig} 
        handState={handState}
        setCustomPoints={setCustomPoints}
      />

      {/* Instructions Overlay if no hand detected initially */}
      {!handState.isPresent && (
        <div className="absolute bottom-10 left-10 pointer-events-none z-30 opacity-50 hidden md:block">
           <div className="text-white text-sm space-y-1">
             <p className="font-bold">Controls:</p>
             <p>🖐️ Open Hand: Explode/Disperse</p>
             <p>✊ Closed Hand/Pinch: Attract/Collapse</p>
             <p>👋 Move: Influence gravity</p>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
