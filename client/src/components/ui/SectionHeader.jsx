import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  badge,
  actions,
  className = ''
}) {
  return (
    <div className={`flex justify-between items-center pb-2 border-b border-genesis-border/60 ${className}`}>
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-genesis-black">
          {title}
        </h2>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {subtitle && (
          <span className="text-[11px] font-medium text-genesis-muted">
            {subtitle}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}
