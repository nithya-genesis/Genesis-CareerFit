import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  category = 'PLACEMENT INTELLIGENCE',
  actions,
  breadcrumbs,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-genesis-border ${className}`}>
      <div className="space-y-1">
        {category && (
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-genesis-goldHover flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-genesis-gold" />
            <span>{category}</span>
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-genesis-black">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-genesis-muted leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
