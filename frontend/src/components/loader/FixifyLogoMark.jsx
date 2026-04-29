import { motion } from 'framer-motion';

/*
 * Fixify Logo Mark — Shield + Lightning Bolt
 * Premium SVG emblem with path-drawing animation.
 *
 * Props:
 *   phase: 'idle' | 'drawing' | 'filled' | 'complete'
 *   quick:  boolean — skip drawing, instant appear
 */

/* ── SVG Path Data ── */
const SHIELD_LEFT = 'M 50 6 C 42 6 14 16 14 44 C 14 66 30 82 50 96';
const SHIELD_RIGHT = 'M 50 6 C 58 6 86 16 86 44 C 86 66 70 82 50 96';
const BOLT = 'M 55 26 L 40 54 L 51 51 L 44 76';
const BOLT_FILL = 'M 55 26 L 40 54 L 51 51 L 44 76 L 62 47 L 51 50 L 55 26 Z';
const SHIELD_FILL = 'M 50 6 C 42 6 14 16 14 44 C 14 66 30 82 50 96 C 70 82 86 66 86 44 C 86 16 58 6 50 6 Z';

const FixifyLogoMark = ({ phase = 'idle', quick = false }) => {
  const isDrawing = phase === 'drawing' || phase === 'filled' || phase === 'complete';
  const isFilled = phase === 'filled' || phase === 'complete';
  const isComplete = phase === 'complete';

  const drawDuration = quick ? 0.01 : 0.7;
  const boltDrawDuration = quick ? 0.01 : 0.5;
  const fillDuration = quick ? 0.15 : 0.4;

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg
        viewBox="0 0 100 100"
        width="120"
        height="120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isComplete ? 'fixify-logo-glow' : ''}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Brand gradient for fills */}
          <linearGradient id="fixify-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a0b5f9" />
            <stop offset="50%" stopColor="#7f98f5" />
            <stop offset="100%" stopColor="#6b83e8" />
          </linearGradient>

          {/* Bolt accent gradient */}
          <linearGradient id="fixify-bolt-grad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#dbe3ff" />
            <stop offset="80%" stopColor="#a0b5f9" />
            <stop offset="100%" stopColor="#84cc16" stopOpacity="0.8" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="fixify-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Energy Ring ── */}
        <motion.circle
          cx="50"
          cy="51"
          r="52"
          stroke="url(#fixify-grad)"
          strokeWidth="0.8"
          fill="none"
          className="fixify-energy-ring"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isFilled ? { scale: 1, opacity: 0.35 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: quick ? 0.2 : 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: '50px 51px' }}
        />

        {/* ── Shield Fill (fades in after drawing) ── */}
        <motion.path
          d={SHIELD_FILL}
          fill="url(#fixify-grad)"
          initial={{ opacity: 0 }}
          animate={isFilled ? { opacity: 0.15 } : { opacity: 0 }}
          transition={{ duration: fillDuration, ease: 'easeOut' }}
        />

        {/* ── Shield Left Half (path drawing) ── */}
        <motion.path
          d={SHIELD_LEFT}
          stroke="url(#fixify-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter={isDrawing ? 'url(#fixify-glow)' : 'none'}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isDrawing
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
          }
          transition={{ pathLength: { duration: drawDuration, ease: 'easeInOut' }, opacity: { duration: 0.1 } }}
        />

        {/* ── Shield Right Half (path drawing) ── */}
        <motion.path
          d={SHIELD_RIGHT}
          stroke="url(#fixify-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter={isDrawing ? 'url(#fixify-glow)' : 'none'}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isDrawing
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
          }
          transition={{ pathLength: { duration: drawDuration, ease: 'easeInOut', delay: quick ? 0 : 0.1 }, opacity: { duration: 0.1 } }}
        />

        {/* ── Bolt Stroke (draws after shield) ── */}
        <motion.path
          d={BOLT}
          stroke="#dbe3ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={isDrawing ? 'url(#fixify-glow)' : 'none'}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isDrawing
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
          }
          transition={{
            pathLength: { duration: boltDrawDuration, ease: 'easeInOut', delay: quick ? 0 : 0.3 },
            opacity: { duration: 0.1, delay: quick ? 0 : 0.3 },
          }}
        />

        {/* ── Bolt Fill (fades in with shield fill) ── */}
        <motion.path
          d={BOLT_FILL}
          fill="url(#fixify-bolt-grad)"
          initial={{ opacity: 0 }}
          animate={isFilled ? { opacity: 0.9 } : { opacity: 0 }}
          transition={{ duration: fillDuration, delay: quick ? 0 : 0.1, ease: 'easeOut' }}
        />
      </svg>

      {/* ── Shine Sweep Overlay ── */}
      <div
        className={`fixify-shine ${isComplete ? 'fixify-shine--active' : ''}`}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      >
        <div className={`fixify-shine ${isComplete ? 'fixify-shine--active' : ''}`} />
      </div>
    </div>
  );
};

export default FixifyLogoMark;
