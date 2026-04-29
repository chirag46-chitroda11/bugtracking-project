import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_MESSAGES = [
  'Scanning modules...',
  'Initializing workspace...',
  'Syncing projects...',
  'Launching dashboard...',
];

const ProgressStatus = ({ active = false }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= STATUS_MESSAGES.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const progress = ((index + 1) / STATUS_MESSAGES.length) * 100;

  return (
    <motion.div
      className="fixify-progress-wrap"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Status Text */}
      <div style={{ height: 18, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="fixify-status-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ display: 'block', whiteSpace: 'nowrap' }}
          >
            {STATUS_MESSAGES[index]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="fixify-progress-bar">
        <div
          className="fixify-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export default ProgressStatus;
