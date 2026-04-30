import React from 'react';
import './skeleton.css';

/**
 * SkeletonTable — Table skeleton matching bug/task tables
 * @param {object} props
 * @param {number} props.rows    - Number of body rows (default 5)
 * @param {number} props.columns - Number of columns (default 5)
 */
const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="skeleton-wrapper skeleton-table-wrap">
    {/* Header */}
    <div className="skeleton-table-header">
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={i}
          className="skeleton-shimmer skeleton-table-header-cell"
          style={{ animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIdx) => (
      <div
        key={rowIdx}
        className="skeleton-table-row"
        style={{ animationDelay: `${(rowIdx + 1) * 50}ms` }}
      >
        {Array.from({ length: columns }, (_, colIdx) => (
          <div
            key={colIdx}
            className="skeleton-shimmer skeleton-table-cell"
            style={{
              width: colIdx === 0 ? '50px' : colIdx === 1 ? undefined : `${55 + (colIdx * 7) % 30}%`,
              animationDelay: `${(rowIdx * columns + colIdx) * 20}ms`,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonTable;
