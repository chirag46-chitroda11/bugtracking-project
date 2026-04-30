import React, { useMemo } from 'react';
import './skeleton.css';

/**
 * Deterministic pseudo-random seed (same as ParticleField.jsx)
 */
const seed = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * SkeletonParticles — Lightweight CSS-only floating particles
 * Appears behind skeleton content as a subtle anti-gravity effect.
 * Pure CSS animation, pointer-events: none, non-blocking.
 */
const SkeletonParticles = ({ count = 8 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${seed(i + 400) * 100}%`,
      top: `${seed(i + 450) * 100}%`,
      size: 3 + seed(i + 500) * 5,
      opacity: 0.12 + seed(i + 550) * 0.18,
      duration: 5 + seed(i + 600) * 6,
      delay: seed(i + 650) * 3,
      dx: -12 + seed(i + 700) * 24,
      dy: -18 + seed(i + 750) * 36,
      color: i % 3 === 0
        ? 'rgba(129, 140, 248, 0.35)'  // indigo
        : i % 3 === 1
          ? 'rgba(99, 102, 241, 0.25)'   // purple-ish
          : 'rgba(165, 180, 252, 0.2)',   // light indigo
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="skeleton-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            '--sp-dur': `${p.duration}s`,
            '--sp-delay': `${p.delay}s`,
            '--sp-opa': p.opacity,
            '--sp-dx': `${p.dx}px`,
            '--sp-dy': `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
};

export default SkeletonParticles;
