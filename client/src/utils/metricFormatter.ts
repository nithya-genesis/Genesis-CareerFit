export interface FormattedMetric {
  value: number | null;
  display: string;
  status: 'MEASURED' | 'DERIVED' | 'INTERPRETED' | 'NOT_EVALUATED' | 'INSUFFICIENT_EVIDENCE';
}

export function formatMetric(
  val: number | string | null | undefined,
  decimals: number = 1,
  suffix: string = '%'
): string {
  if (val === null || val === undefined || val === '') {
    return 'Not Evaluated';
  }
  const numericVal = typeof val === 'string' ? parseFloat(val.replace('%', '').trim()) : val;
  if (isNaN(numericVal) || !isFinite(numericVal)) {
    return 'Insufficient Evidence';
  }
  return `${numericVal.toFixed(decimals)}${suffix}`;
}

export function formatAdvantage(diff: number | null | undefined): string {
  if (diff === null || diff === undefined || isNaN(diff) || !isFinite(diff)) {
    return 'Comparable Baseline';
  }
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}%`;
}
