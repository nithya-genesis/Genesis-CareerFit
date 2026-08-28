import React from 'react';

export default function ScoreDisplay({
  score,
  suffix = '%',
  scale = '',
  status,
  missingLabel = 'Not Evaluated',
  className = ''
}) {
  const isEvaluated = score !== null && score !== undefined && score !== '' && String(score).trim() !== 'null' && String(score).trim() !== 'undefined';

  if (!isEvaluated) {
    return (
      <span className={`text-xs font-semibold text-zinc-400 italic ${className}`}>
        {missingLabel}
      </span>
    );
  }

  const num = typeof score === 'number' ? score : parseFloat(score);
  const formatted = isNaN(num) ? String(score) : (num % 1 === 0 ? num.toFixed(0) : num.toFixed(1));

  return (
    <span className={`font-mono font-bold ${className}`}>
      <span>{formatted}</span>
      {suffix && <span className="text-[11px] font-sans font-medium text-zinc-500 ml-0.5">{suffix}</span>}
      {scale && <span className="text-[10px] font-sans text-zinc-400 ml-1">/ {scale}</span>}
    </span>
  );
}
