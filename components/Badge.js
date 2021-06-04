import React from 'react';

export function RedBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-red-100 text-red-800 mr-1'>
      {children}
    </span>
  );
}

export function GreenBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-green-100 text-green-800 mr-1'>
      {children}
    </span>
  );
}

export function BlueBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-blue-100 text-blue-800 mr-1'>
      {children}
    </span>
  );
}

export function YellowBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-yellow-100 text-yellow-800 mr-1'>
      {children}
    </span>
  );
}

export function PurpleBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-purple-100 text-purple-800 mr-1'>
      {children}
    </span>
  );
}

export function GrayBadge({ color, children }) {
  return (
    <span className='inline-flex items-center px-1.5 py-0.25 rounded text-xs font-medium tracking-wider bg-gray-100 text-gray-800 mr-1'>
      {children}
    </span>
  );
}