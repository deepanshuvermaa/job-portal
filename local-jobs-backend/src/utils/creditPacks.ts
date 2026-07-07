export const CREDIT_PACKS = [
  { id: 'pack_5', credits: 5, price: 149, per_credit: 29.8 },
  { id: 'pack_15', credits: 15, price: 399, per_credit: 26.6 },
  { id: 'pack_30', credits: 30, price: 699, per_credit: 23.3 },
  { id: 'pack_50', credits: 50, price: 999, per_credit: 19.98 },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits_per_month: 2,
    max_active_jobs: 1,
    features: [
      '1 active job post',
      '2 interview credits/month',
      'View applications',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    credits_per_month: 15,
    max_active_jobs: 5,
    features: [
      '5 active jobs',
      '15 interview credits/month',
      'Response time badge',
      'GST invoice',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1499,
    credits_per_month: 50,
    max_active_jobs: 20,
    features: [
      '20 active jobs',
      '50 interview credits/month',
      '2 featured listings',
      'Bulk actions',
      'Priority support',
    ],
  },
];
