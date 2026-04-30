import React from 'react';
import './skeleton.css';

/**
 * SkeletonActivityFeed — Activity feed skeleton with timeline connectors
 * @param {object} props
 * @param {number} props.items - Number of feed items (default 5)
 */
const SkeletonActivityFeed = ({ items = 5 }) => (
  <div className="skeleton-wrapper skeleton-chart-wrap">
    <div className="skeleton-shimmer" style={{ height: 16, width: '40%', borderRadius: 8, marginBottom: 20 }} />

    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: items }, (_, i) => (
        <div
          key={i}
          className="skeleton-feed-item"
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div className="skeleton-shimmer skeleton-feed-avatar" />
          <div className="skeleton-feed-content">
            <div className="skeleton-shimmer skeleton-feed-line1" style={{ width: `${30 + (i * 7) % 20}%` }} />
            <div className="skeleton-shimmer skeleton-feed-line2" style={{ width: `${65 + (i * 11) % 25}%` }} />
            <div className="skeleton-shimmer skeleton-feed-line3" style={{ width: `${40 + (i * 13) % 20}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonActivityFeed;
