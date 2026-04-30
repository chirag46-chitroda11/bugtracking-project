import React from 'react';
import './skeleton.css';

/**
 * SkeletonUserGrid — User card grid skeleton
 * @param {object} props
 * @param {number} props.count   - Number of user cards (default 8)
 * @param {number} props.columns - Grid columns (default 4)
 */
const SkeletonUserGrid = ({ count = 8, columns = 4 }) => (
  <div
    className="skeleton-wrapper"
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
    }}
  >
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton-user-card" style={{ animationDelay: `${i * 50}ms` }}>
        <div className="skeleton-shimmer skeleton-user-avatar" />
        <div className="skeleton-shimmer skeleton-user-name" />
        <div className="skeleton-shimmer skeleton-user-email" />
        <div className="skeleton-shimmer skeleton-user-role" />
        <div className="skeleton-shimmer skeleton-user-actions" />
      </div>
    ))}
  </div>
);

export default SkeletonUserGrid;
