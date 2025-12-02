import React, { useState } from 'react';
import { ParticleConfig, ShapeType, AIState, HandState } from '../types';
import { generateShapePoints } from '../services/geminiService';
import { 
  Palette, 
  Shapes, 
  Sparkles, 
  Hand, 
  Maximize, 
  Minimize,
  PanelRightClose,
  PanelRightOpen,
  Wand2,
  Loader2
} from 'lucide-react';

interface UIProps {
  config: ParticleConfig;
  setConfig: (config: ParticleConfig) => void;
  handState: HandState;
  setCustomPoints: (points: number[]) => void;
}

const UI: React.FC<UIProps> = ({ config, setConfig, handState, setCustomPoints }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiState, setAiState] = useState<AIState>({
    loading: false,
    prompt: '',
    generatedPoints: null,
    error: null
  });

  const handleShapeChange = (shape: ShapeType) => {
    setConfig({ ...config, shape });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, color: e.target.value });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleAIGenerate = async () => {
    if (!aiState.prompt.trim()) return;

    setAiState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const points = await generateShapePoints(aiState.prompt);
      setCustomPoints(points);
      setConfig({ ...config, shape: ShapeType.CUSTOM });
      setAiState(prev => ({ ...prev, loading: false }));
    } catch (err: any) {
      setAiState(prev => ({ ...prev, loading: false, error: err.message || "Failed to generate" }));
    }
  };

  return (
    <>
      {/* Hand Status Indicator */}
      <div className="fixed top-4 left-4 md:left-1/2 md:transform md:-translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white z-40 transition-all duration-300 shadow-lg">
        <Hand className={`w-5 h-5 ${handState.isPresent ? 'text-green-400' : 'text-red-400'}`} />
        <span className="text-xs md:text-sm font-medium">
            {handState.isPresent 
              ? `${handState.gesture === 'NEUTRAL' ? 'Ready' : handState.gesture}`
              : 'No Hand'
            }
        </span>
        {handState.isPresent && (
           <div className="w-16 h-1 bg-gray-700 rounded-full ml-2 overflow-hidden">
             <div 
               className="h-full bg-green-400 transition-all duration-100" 
               style={{ width: `${handState.spreadFactor * 100}%` }}
             />
           </div>
        )}
      </div>

      {/* Top Right Controls Group */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        {/* Fullscreen Toggle */}
        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-black/60 backdrop-blur-md text-white rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-5 h-5"/> : <Maximize className="w-5 h-5"/>}
        </button>

        {/* Panel Toggle */}
        <button 
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="p-2 bg-black/60 backdrop-blur-md text-white rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          title="Toggle Settings"
        >
          {isPanelOpen ? <PanelRightClose className="w-5 h-5"/> : <PanelRightOpen className="w-5 h-5"/>}
        </button>
      </div>

      {/* Main Control Panel */}
      <div className={`fixed top-16 right-4 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl z-40 transition-all duration-500 transform origin-top-right ${isPanelOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <div className="space-y-6 custom-scroll max-h-[80vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              ZenParticles
            </h1>
          </div>

          {/* Shape Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Shapes className="w-4 h-4" />
              <span>Shape Template</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ShapeType).filter(s => s !== ShapeType.CUSTOM).map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleShapeChange(shape)}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${config.shape === shape ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generation Section */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Wand2 className="w-4 h-4 text-blue-400" />
              <span>Gemini Shape Generator</span>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. A skull, A dragon..."
                value={aiState.prompt}
                onChange={(e) => setAiState(prev => ({...prev, prompt: e.target.value}))}
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              />
              <button 
                onClick={handleAIGenerate}
                disabled={aiState.loading || !aiState.prompt}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed p-2 rounded-lg transition-all shadow-lg shadow-blue-900/20"
              >
                {aiState.loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
              </button>
            </div>
            {aiState.error && <p className="text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50">{aiState.error}</p>}
            {config.shape === ShapeType.CUSTOM && (
               <div className="text-xs text-blue-300 flex items-center gap-2 bg-blue-900/20 p-2 rounded border border-blue-900/50 animate-pulse">
                 <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                 Displaying AI generated shape
               </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Palette className="w-4 h-4" />
                  <span>Particle Color</span>
                </div>
                <div className="relative overflow-hidden w-8 h-8 rounded-full border border-white/20 shadow-inner">
                  <input 
                    type="color" 
                    value={config.color}
                    onChange={handleColorChange}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 m-0 cursor-pointer border-0 bg-transparent"
                  />
                </div>
            </div>
          </div>

          {/* Particle Count - Simple Slider */}
           <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-gray-400 uppercase tracking-wider">
              <span>Density</span>
              <span>{config.count.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="1000" 
              max="20000" 
              step="1000"
              value={config.count}
              onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
            />
          </div>

        </div>
      </div>
    </>
  );
};

export default UI;