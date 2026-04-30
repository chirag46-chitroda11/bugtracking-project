import React from 'react';

/**
 * SkeletonLine — A rectangular shimmer block
 * @param {object} props
 * @param {string|number} props.width  - CSS width (default '100%')
 * @param {string|number} props.height - CSS height (default '14px')
 * @param {string} props.borderRadius  - CSS border-radius (default '8px')
 * @param {string} props.className     - Extra class names
 * @param {object} props.style         - Extra inline styles
 */
export const SkeletonLine = ({
  width = '100%',
  height = '14px',
  borderRadius = '8px',
  className = '',
  style = {},
}) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

/**
 * SkeletonCircle — A circular shimmer element (avatars)
 * @param {object} props
 * @param {number} props.size - Diameter in pixels (default 40)
 * @param {string} props.className
 * @param {object} props.style
 */
export const SkeletonCircle = ({
  size = 40,
  className = '',
  style = {},
}) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      ...style,
    }}
  />
);

/**
 * SkeletonRect — A rectangular shimmer block for larger areas (charts, images)
 * @param {object} props
 * @param {string|number} props.width
 * @param {string|number} props.height
 * @param {string} props.borderRadius
 * @param {string} props.className
 * @param {object} props.style
 */
export const SkeletonRect = ({
  width = '100%',
  height = '200px',
  borderRadius = '12px',
  className = '',
  style = {},
}) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

export default { SkeletonLine, SkeletonCircle, SkeletonRect };
