import React from 'react';

const Badge = React.forwardRef(function Button({ onClick, href, children, color }, ref) {
  return (
    <a
      href={href}
      onClick={onClick}
      ref={ref}
      className={`inline-flex items-center px-2.5 py-0.5 m-1 rounded whitespace-nowrap text-xs sm:text-sm font-base tracking-wider ${
        color ? `bg-${color}-100 visited:text-${color}-800 text-${color}-800` : ''
      } mr-1 ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </a>
  );
});

export default Badge;
