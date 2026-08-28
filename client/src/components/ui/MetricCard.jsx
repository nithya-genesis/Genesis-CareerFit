import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
  className = ''
}) {
  return (
    <div className={`bg-white border rounded-xl p-5 transition-all duration-150 ease-in-out ${
      highlight 
        ? 'border-genesis-gold/60 shadow-card bg-gradient-to-b from-white to-amber-50/20' 
        : 'border-genesis-border shadow-card hover:border-zinc-300'
    } ${className}`}>
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-genesis-muted">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${highlight ? 'bg-amber-100/80 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className={`text-2xl lg:text-3xl font-black font-mono tracking-tight ${
          highlight ? 'text-genesis-black' : 'text-zinc-900'
        }`}>
          {value !== null && value !== undefined && value !== '' ? value : '—'}
        </span>
        {trend && (
          <span className="text-xs font-bold text-emerald-600">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 text-xs font-medium text-genesis-muted">
          {subtitle}
        </div>
      )}
    </div>
  );
}
