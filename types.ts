export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  FIREWORKS = 'Fireworks',
  BUDDHA = 'Buddha', // Simplified geometric representation
  CUSTOM = 'AI Generated'
}

export interface ParticleConfig {
  color: string;
  count: number;
  size: number;
  shape: ShapeType;
}

export interface HandState {
  isPresent: boolean;
  gesture: 'OPEN' | 'CLOSED' | 'NEUTRAL';
  position: { x: number; y: number }; // Normalized -1 to 1
  pinchDistance: number; // 0 to 1
  spreadFactor: number; // 0 to 1 (how open the hand is)
}

export interface AIState {
  loading: boolean;
  prompt: string;
  generatedPoints: number[] | null;
  error: string | null;
}
