import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import FixifyLogoMark from './FixifyLogoMark';
import ParticleField from './ParticleField';
import ProgressStatus from './ProgressStatus';
import './preloader.css';

/*
 * FixifyPreloader — Premium Brand Reveal
 *
 * Timeline (first visit ~3s):
 *   0.0s  → Background + particles fade in
 *   0.3s  → Shield paths start drawing
 *   1.0s  → Fill gradient + energy ring
 *   1.2s  → "FIXIFY." text slides up
 *   1.4s  → Tagline + shine sweep
 *   1.6s  → Progress status cycling
 *   2.5s  → Exit animation begins
 *   3.0s  → Preloader removed, app revealed
 *
 * Repeat visit (~0.8s):
 *   Quick logo scale-in → text → exit
 *
 * Reduced motion:
 *   Simple fade of logo + text (~0.6s)
 */

const FixifyPreloader = ({ onComplete }) => {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isRepeatVisit = useMemo(() => {
    try {
      return sessionStorage.getItem('fixify_loaded') === '1';
    } catch {
      return false;
    }
  }, []);

  // Phases: intro → drawing → filled → text → status → exit → done
  const [phase, setPhase] = useState('intro');

  useEffect(() => {
    const timers = [];
    const t = (fn, ms) => timers.push(setTimeout(fn, ms));

    if (prefersReducedMotion) {
      // Minimal: instant show, quick fade
      setPhase('filled');
      t(() => setPhase('text'), 100);
      t(() => setPhase('exit'), 400);
      t(() => {
        setPhase('done');
        try { sessionStorage.setItem('fixify_loaded', '1'); } catch {}
        onComplete?.();
      }, 700);
    } else if (isRepeatVisit) {
      // Quick version
      setPhase('filled');
      t(() => setPhase('text'), 150);
      t(() => setPhase('exit'), 600);
      t(() => {
        setPhase('done');
        onComplete?.();
      }, 1000);
    } else {
      // Full cinematic reveal
      t(() => setPhase('drawing'), 300);
      t(() => setPhase('filled'), 1000);
      t(() => setPhase('text'), 1250);
      t(() => setPhase('status'), 1600);
      t(() => setPhase('exit'), 2500);
      t(() => {
        setPhase('done');
        try { sessionStorage.setItem('fixify_loaded', '1'); } catch {}
        onComplete?.();
      }, 3000);
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'done') return null;

  const showLogo = phase !== 'intro';
  const showText = ['text', 'status', 'exit'].includes(phase);
  const showStatus = phase === 'status';
  const isExit = phase === 'exit';
  const quick = isRepeatVisit || prefersReducedMotion;

  // Map phase to logo sub-phase
  const logoPhase = phase === 'drawing'
    ? 'drawing'
    : ['filled', 'text', 'status', 'exit'].includes(phase)
      ? (['text', 'status', 'exit'].includes(phase) ? 'complete' : 'filled')
      : 'idle';

  return (
    <div
      className="fixify-preloader"
      style={{ opacity: isExit ? 0 : 1 }}
      aria-label="Loading Fixify"
      role="progressbar"
    >
      {/* Background */}
      <div className="fixify-preloader__bg" />
      <div className="fixify-preloader__noise" />

      {/* Particles */}
      {!prefersReducedMotion && <ParticleField />}

      {/* Center Content */}
      <motion.div
        className="fixify-logo-wrap"
        animate={{
          scale: isExit ? 0.92 : 1,
          y: isExit ? -10 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo Mark */}
        <motion.div
          initial={{ opacity: 0, scale: quick ? 0.9 : 0.7 }}
          animate={showLogo
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: 0.7 }
          }
          transition={{
            duration: quick ? 0.2 : 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ position: 'relative' }}
        >
          <FixifyLogoMark phase={logoPhase} quick={quick} />

          {/* Reflection */}
          {!prefersReducedMotion && (
            <div className="fixify-reflection" style={{ width: 120, height: 60 }}>
              <FixifyLogoMark phase={logoPhase} quick={quick} />
            </div>
          )}
        </motion.div>

        {/* Brand Text: FIXIFY. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={showText
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 16 }
          }
          transition={{
            duration: quick ? 0.2 : 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <div className="fixify-brand-text">FIXIFY.</div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showText ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: quick ? 0.15 : 0.4,
            delay: quick ? 0.05 : 0.15,
            ease: 'easeOut',
          }}
        >
          <div className="fixify-tagline">Track Bugs Faster. Build Better Products.</div>
        </motion.div>

        {/* Progress Status */}
        <ProgressStatus active={showStatus} />
      </motion.div>
    </div>
  );
};

export default FixifyPreloader;
