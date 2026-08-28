export const formatPercent = (val) => {
  if (val === null || val === undefined || val === '') return 'Not Evaluated';
  const num = typeof val === 'object' && val.display ? val.display : parseFloat(val);
  if (typeof num === 'string') return num;
  if (isNaN(num)) return 'Not Evaluated';
  const adjusted = (num > 0 && num <= 1) ? num * 100 : num;
  return `${adjusted.toFixed(1)}%`;
};

export const getHealthBadge = (health) => {
  if (!health || health.status === 'offline') {
    return { text: 'NVIDIA AI Offline', color: '#EF4444' };
  }
  if (health.status === 'degraded') {
    return { text: `NVIDIA AI Degraded (${health.healthy_keys}/${health.total_keys} Keys)`, color: '#F59E0B' };
  }
  return { text: `NVIDIA AI Connected (${health.healthy_keys}/${health.total_keys} Keys)`, color: '#10B981' };
};
