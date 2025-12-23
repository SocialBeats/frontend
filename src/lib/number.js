// Small number formatting helpers used across dashboard widgets
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const opts = {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  };

  return num.toLocaleString(undefined, opts);
}

export default { formatNumber };
