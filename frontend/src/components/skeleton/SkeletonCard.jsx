import React from 'react';
import './skeleton.css';

/**
 * SkeletonCard — Stat card skeleton matching glass-card layout
 * @param {object} props
 * @param {number} props.count - Number of cards to render (default 4)
 * @param {number} props.columns - Grid columns (default 4)
 */
const SkeletonCard = ({ count = 4, columns = 4 }) => (
  <div
    className="skeleton-wrapper"
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
    }}
  >
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
        <div className="skeleton-shimmer skeleton-stat-label" />
        <div className="skeleton-shimmer skeleton-stat-value" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;
