import React from 'react';
import './skeleton.css';

/**
 * SkeletonForm — Form layout skeleton matching Create/Edit pages
 * @param {object} props
 * @param {number} props.fields - Number of form fields (default 6)
 */
const SkeletonForm = ({ fields = 6 }) => (
  <div className="skeleton-wrapper skeleton-form-wrap">
    {/* Header */}
    <div className="skeleton-form-header">
      <div className="skeleton-shimmer skeleton-form-back" />
      <div>
        <div className="skeleton-shimmer skeleton-form-title" />
        <div className="skeleton-shimmer skeleton-form-subtitle" />
      </div>
    </div>

    {/* Fields Grid */}
    <div className="skeleton-form-grid">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="skeleton-form-field" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="skeleton-shimmer skeleton-form-label" style={{ width: `${35 + (i * 11) % 25}%` }} />
          <div className="skeleton-shimmer skeleton-form-input" />
        </div>
      ))}

      {/* Textarea spanning full width */}
      <div className="skeleton-shimmer skeleton-form-textarea" style={{ animationDelay: `${fields * 60}ms` }} />
    </div>

    {/* Submit button */}
    <div className="skeleton-shimmer skeleton-form-submit" style={{ animationDelay: `${(fields + 1) * 60}ms` }} />
  </div>
);

export default SkeletonForm;
