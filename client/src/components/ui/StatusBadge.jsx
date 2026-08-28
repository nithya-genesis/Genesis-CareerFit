import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const normStatus = String(status || 'PROVISIONAL').replace(/_/g, ' ').toUpperCase().trim();

  let variant = 'provisional';
  let label = normStatus.charAt(0) + normStatus.slice(1).toLowerCase();

  if (normStatus.includes('PLACEMENT READY') || normStatus.includes('TIER-1') || normStatus === 'READY') {
    variant = 'ready';
    label = 'Placement Ready';
  } else if (normStatus.includes('PROVISIONAL') || normStatus.includes('DEVELOPING')) {
    variant = 'provisional';
    label = 'Provisional Ready';
  } else if (normStatus.includes('AT-RISK') || normStatus.includes('CRITICAL') || normStatus.includes('ACTION')) {
    variant = 'atRisk';
    label = 'Needs Assessment';
  }

  const styles = {
    ready: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    provisional: 'bg-amber-50 text-amber-800 border-amber-200/80',
    atRisk: 'bg-rose-50 text-rose-800 border-rose-200/80',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };

  const dotStyles = {
    ready: 'bg-emerald-500',
    provisional: 'bg-amber-500',
    atRisk: 'bg-rose-500',
    neutral: 'bg-zinc-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${styles[variant] || styles.neutral} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant] || dotStyles.neutral}`} />
      <span>{label}</span>
    </span>
  );
}
