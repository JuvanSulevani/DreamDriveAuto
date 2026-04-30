export const formatPrice = (cents: number | null | undefined) => {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(cents / 100);
};

export const formatMiles = (miles: number | null | undefined) => {
  if (miles == null) return '—';
  return new Intl.NumberFormat('en-US').format(miles) + ' mi';
};

export const formatNumber = (n: number | null | undefined) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US').format(n);
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
