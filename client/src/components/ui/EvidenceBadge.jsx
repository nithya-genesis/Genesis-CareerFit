import React from 'react';

export default function EvidenceBadge({ status, className = '' }) {
  const norm = String(status || 'NOT_EVALUATED').toUpperCase().trim();

  let variant = 'notEvaluated';
  let label = 'NOT EVALUATED';

  if (norm === 'MEASURED' || norm === 'EVALUATED') {
    variant = 'measured';
    label = 'MEASURED';
  } else if (norm === 'DERIVED') {
    variant = 'derived';
    label = 'DERIVED';
  } else if (norm === 'UNAVAILABLE') {
    variant = 'unavailable';
    label = 'UNAVAILABLE';
  } else {
    variant = 'notEvaluated';
    label = 'NOT EVALUATED';
  }

  const styles = {
    measured: 'bg-emerald-50 text-emerald-800 border-emerald-300/80',
    derived: 'bg-blue-50 text-blue-800 border-blue-300/80',
    notEvaluated: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    unavailable: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase border ${styles[variant]} ${className}`}>
      {label}
    </span>
  );
}
