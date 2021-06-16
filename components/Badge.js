import React from 'react';

export default function Badge({ color, children }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-${color}-100 text-${color}-800 mr-1`}
    >
      {children}
    </span>
  );
}