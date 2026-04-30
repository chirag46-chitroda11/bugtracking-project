import React from 'react';
import './skeleton.css';

/**
 * SkeletonChart — Chart placeholder skeleton
 * @param {object} props
 * @param {'bar'|'pie'} props.type   - Chart type (default 'bar')
 * @param {number}      props.height - Chart area height (default 250)
 */
const SkeletonChart = ({ type = 'bar', height = 250 }) => (
  <div className="skeleton-wrapper skeleton-chart-wrap">
    <div className="skeleton-shimmer skeleton-chart-title" />

    {type === 'bar' ? (
      <div className="skeleton-chart-bars" style={{ height }}>
        {[65, 85, 45, 70, 55, 90, 40].map((h, i) => (
          <div
            key={i}
            className="skeleton-shimmer skeleton-chart-bar"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
        <div
          className="skeleton-shimmer skeleton-chart-pie"
          style={{ width: Math.min(height * 0.6, 160), height: Math.min(height * 0.6, 160) }}
        />
      </div>
    )}

    {/* Legend row */}
    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
      {[60, 50, 70, 45].map((w, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{ height: 10, width: w, borderRadius: 5, animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  </div>
);

export default SkeletonChart;
