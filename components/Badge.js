import React from 'react';

export default function Badge({ color, children, onClick }) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 m-1 rounded text-xs sm:text-sm font-base tracking-wider ${
        color ? `bg-${color}-100 text-${color}-800` : ''
      } mr-1 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </span>
  );
}
