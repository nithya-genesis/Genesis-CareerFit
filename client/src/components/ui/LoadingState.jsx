import React from 'react';

export default function LoadingState({
  message = 'Loading verified placement intelligence...',
  size = 'md',
  className = ''
}) {
  const spinnerSizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-7 h-7 border-3',
    lg: 'w-10 h-10 border-4'
  };

  return (
    <div className={`py-12 text-center space-y-3 ${className}`}>
      <div className={`inline-block ${spinnerSizes[size] || spinnerSizes.md} border-genesis-gold border-t-transparent rounded-full animate-spin`} />
      {message && (
        <div className="text-xs font-bold uppercase tracking-wider text-genesis-muted">
          {message}
        </div>
      )}
    </div>
  );
}
