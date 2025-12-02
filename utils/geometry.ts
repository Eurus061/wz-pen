import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateParticles = (shape: ShapeType, count: number, customPoints?: number[] | null): Float32Array => {
  const positions = new Float32Array(count * 3);

  if (shape === ShapeType.CUSTOM && customPoints && customPoints.length > 0) {
    // If we have custom points from Gemini, distribute them
    const sourceCount = customPoints.length / 3;
    for (let i = 0; i < count; i++) {
      const sourceIndex = i % sourceCount;
      positions[i * 3] = customPoints[sourceIndex * 3];
      positions[i * 3 + 1] = customPoints[sourceIndex * 3 + 1];
      positions[i * 3 + 2] = customPoints[sourceIndex * 3 + 2];
    }
    return positions;
  }

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const t = Math.random() * Math.PI * 2;
    const u = Math.random() * Math.PI * 2;
    const v = Math.random();

    switch (shape) {
      case ShapeType.HEART:
        // Parametric Heart
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        // Scale down to fit view
        x = 16 * Math.pow(Math.sin(theta), 3) * Math.sin(phi);
        y = (13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta));
        z = 16 * Math.pow(Math.sin(theta), 3) * Math.cos(phi);
        x *= 0.15; y *= 0.15; z *= 0.15;
        break;

      case ShapeType.FLOWER:
        // Rose curve inspired
        const k = 5; // Petals
        const r = Math.cos(k * t) * Math.sin(u) * 2;
        x = r * Math.cos(t);
        y = Math.cos(u) * 2 * (Math.random() - 0.5); // Thickness
        z = r * Math.sin(t);
        break;

      case ShapeType.SATURN:
         if (Math.random() > 0.4) {
             // Ring
             const ringRadius = 2.5 + Math.random() * 1.5;
             x = ringRadius * Math.cos(t);
             z = ringRadius * Math.sin(t);
             y = (Math.random() - 0.5) * 0.1;
         } else {
             // Planet
             const planetRadius = 1.5;
             const pPhi = Math.acos(2 * Math.random() - 1);
             const pTheta = Math.sqrt(count * Math.PI) * pPhi;
             x = planetRadius * Math.cos(pTheta) * Math.sin(pPhi);
             y = planetRadius * Math.sin(pTheta) * Math.sin(pPhi);
             z = planetRadius * Math.cos(pPhi);
         }
         break;
      
      case ShapeType.BUDDHA:
        // Approximate a meditative figure using stacked spheres/ovals
        // Base (Legs)
        const part = Math.random();
        if (part < 0.4) {
            // Legs/Base - Ellipsoid
            const lx = (Math.random() - 0.5) * 4;
            const ly = (Math.random() - 0.5) * 1.5;
            const lz = (Math.random() - 0.5) * 2.5;
            if (lx*lx/4 + ly*ly/0.5 + lz*lz/1.5 < 1) {
                x = lx; y = ly - 1.5; z = lz;
            } else { i--; continue; } // Retry
        } else if (part < 0.7) {
             // Torso
             const tx = (Math.random() - 0.5) * 2;
             const ty = (Math.random() - 0.5) * 2.5;
             const tz = (Math.random() - 0.5) * 1.5;
             if (tx*tx + ty*ty + tz*tz < 1.2) {
                 x = tx; y = ty + 0.5; z = tz;
             } else { i--; continue; }
        } else {
            // Head
             const hx = (Math.random() - 0.5) * 1.2;
             const hy = (Math.random() - 0.5) * 1.4;
             const hz = (Math.random() - 0.5) * 1.2;
             if (hx*hx + hy*hy + hz*hz < 0.5) {
                 x = hx; y = hy + 2.2; z = hz;
             } else { i--; continue; }
        }
        break;

      case ShapeType.FIREWORKS:
      default:
        // Sphere / Explosion
        const radius = 3 * Math.cbrt(Math.random());
        const fTheta = Math.random() * Math.PI * 2;
        const fPhi = Math.acos(2 * Math.random() - 1);
        x = radius * Math.sin(fPhi) * Math.cos(fTheta);
        y = radius * Math.sin(fPhi) * Math.sin(fTheta);
        z = radius * Math.cos(fPhi);
        break;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
};
