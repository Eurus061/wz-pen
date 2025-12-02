import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleConfig, HandState, ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';

// Fix for missing JSX.IntrinsicElements definitions in this environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
      ambientLight: any;
      color: any;
    }
  }
}

interface SceneProps {
  config: ParticleConfig;
  handState: HandState;
  customPoints: number[] | null;
}

const Particles: React.FC<SceneProps> = ({ config, handState, customPoints }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const hoverRef = useRef<number>(0);

  // Generate target positions based on selected shape
  const targetPositions = useMemo(() => {
    return generateParticles(config.shape, config.count, customPoints);
  }, [config.shape, config.count, customPoints]);

  // Current positions for animation
  const currentPositions = useMemo(() => {
    return new Float32Array(config.count * 3);
  }, [config.count]);

  // Initialize particles at 0,0,0 or random for explosion effect
  useMemo(() => {
    for (let i = 0; i < config.count * 3; i++) {
        currentPositions[i] = (Math.random() - 0.5) * 10;
    }
  }, [currentPositions, config.count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    hoverRef.current += delta * 0.5;

    // Interaction Parameters
    const { isPresent, position: handPos, spreadFactor, gesture } = handState;
    
    // Smooth interaction strength
    const explodeStrength = gesture === 'OPEN' ? spreadFactor * 5 : 0;
    const attractStrength = gesture === 'CLOSED' ? 2 : 0;
    
    // Interactive cursor position in 3D space (mapped roughly)
    const cursorX = handPos.x * 5;
    const cursorY = handPos.y * 5;
    const cursorZ = 0;

    for (let i = 0; i < config.count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Target position for this particle
      let tx = targetPositions[ix];
      let ty = targetPositions[iy];
      let tz = targetPositions[iz];

      // 1. Basic Animation (Rotation/Float)
      // Rotate entire shape slowly
      const cosT = Math.cos(time * 0.1);
      const sinT = Math.sin(time * 0.1);
      const rx = tx * cosT - tz * sinT;
      const rz = tx * sinT + tz * cosT;
      tx = rx; tz = rz;

      // 2. Hand Interaction
      if (isPresent) {
        const dx = positions[ix] - cursorX;
        const dy = positions[iy] - cursorY;
        const dz = positions[iz] - cursorZ;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // Repulsion (Open Hand - Explode)
        if (explodeStrength > 0) {
            const force = Math.max(0, (5 - dist) * explodeStrength * delta);
            tx += dx * force;
            ty += dy * force;
            tz += dz * force;
        }

        // Attraction (Closed Hand - Pinch)
        if (attractStrength > 0) {
           const force = Math.max(0, (8 - dist) * attractStrength * delta);
           tx = tx * 0.9 + cursorX * 0.1;
           ty = ty * 0.9 + cursorY * 0.1;
           tz = tz * 0.9 + cursorZ * 0.1;
        }
      }

      // 3. Interpolate current position to target
      // This creates the "return to shape" elasticity
      const elasticity = isPresent && gesture !== 'NEUTRAL' ? 1.5 : 3.0; // Stiffer when idle
      positions[ix] += (tx - positions[ix]) * elasticity * delta;
      positions[iy] += (ty - positions[iy]) * elasticity * delta;
      positions[iz] += (tz - positions[iz]) * elasticity * delta;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05; // Global slow spin
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.size}
        color={config.color}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Experience: React.FC<SceneProps> = (props) => {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Particles {...props} />
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};

export default Experience;