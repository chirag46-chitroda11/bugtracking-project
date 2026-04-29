import { useMemo } from 'react';

/* ── Deterministic particle generation ── */
const seed = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const DESKTOP_COUNT = 18;
const MOBILE_COUNT = 6;

const ParticleField = () => {
  const particles = useMemo(() => {
    return Array.from({ length: DESKTOP_COUNT }, (_, i) => ({
      id: i,
      left: `${seed(i) * 100}%`,
      top: `${seed(i + 50) * 100}%`,
      size: 2 + seed(i + 100) * 4,
      opacity: 0.15 + seed(i + 150) * 0.3,
      duration: 5 + seed(i + 200) * 7,
      delay: seed(i + 250) * 4,
      dx: -20 + seed(i + 300) * 40,
      dy: -25 + seed(i + 350) * 50,
      // Use brand palette with variation
      color: i % 3 === 0
        ? 'rgba(160, 181, 249, 0.5)'
        : i % 3 === 1
          ? 'rgba(127, 152, 245, 0.4)'
          : 'rgba(219, 227, 255, 0.3)',
    }));
  }, []);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className={`fixify-particle ${p.id >= MOBILE_COUNT ? 'fixify-particle--desktop' : ''}`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.color,
            '--p-dur': `${p.duration}s`,
            '--p-delay': `${p.delay}s`,
            '--p-opa': p.opacity,
            '--p-dx': `${p.dx}px`,
            '--p-dy': `${p.dy}px`,
          }}
        />
      ))}

      {/* Hide desktop-only particles on mobile via inline style tag */}
      <style>{`
        @media (max-width: 768px) {
          .fixify-particle--desktop { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ParticleField;
