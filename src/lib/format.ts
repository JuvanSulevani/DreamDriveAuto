export const formatPrice = (cents: number | null | undefined) => {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0
  }).format(cents / 100).replace(/^\$/, 'CA$');
};

export const formatMiles = (km: number | null | undefined) => {
  if (km == null) return '—';
  return new Intl.NumberFormat('en-CA').format(km) + ' km';
};

export const formatNumber = (n: number | null | undefined) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-CA').format(n);
};

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const conditionLabel = (c: string) => {
  switch (c) {
    case 'new': return 'New';
    case 'certified': return 'Certified Pre-Owned';
    case 'used': return 'Pre-Owned';
    default: return c;
  }
};
