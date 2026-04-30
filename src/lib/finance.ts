export type FinanceInput = {
  priceCents: number;
  downCents: number;
  tradeCents: number;
  termMonths: number;
  aprPercent: number;
  taxRate?: number; // 0..1
  feesCents?: number;
};

export type FinanceResult = {
  monthlyCents: number;
  totalInterestCents: number;
  totalCostCents: number;
  amountFinancedCents: number;
};

export function computePayment(i: FinanceInput): FinanceResult {
  const tax = (i.taxRate ?? 0) * i.priceCents;
  const fees = i.feesCents ?? 0;
  const principal = Math.max(0, i.priceCents + tax + fees - i.downCents - i.tradeCents);
  const r = i.aprPercent / 100 / 12;
  const n = i.termMonths;
  const monthly = r === 0
    ? Math.round(principal / Math.max(1, n))
    : Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
  const totalCost = monthly * n;
  return {
    monthlyCents: monthly,
    amountFinancedCents: principal,
    totalCostCents: totalCost,
    totalInterestCents: Math.max(0, totalCost - principal)
  };
}
