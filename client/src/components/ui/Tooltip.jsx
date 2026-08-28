import React, { useState } from 'react';

export default function Tooltip({ text, children, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5'
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div className={`absolute z-50 px-2 py-1 text-[11px] font-medium text-white bg-genesis-black border border-zinc-700 rounded shadow-md pointer-events-none whitespace-nowrap fade-in ${positionStyles[position] || positionStyles.top}`}>
          {text}
        </div>
      )}
    </div>
  );
}
