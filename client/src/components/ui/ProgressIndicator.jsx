import React from 'react';

export default function ProgressIndicator({
  value = 0,
  max = 100,
  label,
  valueText,
  variant = 'gold',
  className = ''
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const variantStyles = {
    gold: 'bg-genesis-gold',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500'
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || valueText) && (
        <div className="flex justify-between items-center text-xs font-semibold">
          {label && <span className="text-genesis-muted">{label}</span>}
          {valueText && <span className="font-mono text-genesis-black font-bold">{valueText}</span>}
        </div>
      )}
      <div className="w-full bg-zinc-200/80 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${variantStyles[variant] || variantStyles.gold}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
