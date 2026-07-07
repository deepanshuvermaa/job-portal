import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Loader2, Zap, Rocket } from 'lucide-react';
import { cn } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  icon: React.ReactNode;
  features: { label: string; included: boolean }[];
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Free Forever',
    icon: <Zap className="h-6 w-6" />,
    features: [
      { label: 'Post up to 3 jobs', included: true },
      { label: 'Basic candidate search', included: true },
      { label: 'Email support', included: true },
      { label: 'Priority listing', included: false },
      { label: 'Candidate match scoring', included: false },
      { label: 'Bulk job posting', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 499,
    priceLabel: '\u20B9499/month',
    icon: <Crown className="h-6 w-6" />,
    highlighted: true,
    features: [
      { label: 'Post up to 15 jobs', included: true },
      { label: 'Advanced candidate search', included: true },
      { label: 'Priority email support', included: true },
      { label: 'Priority listing', included: true },
      { label: 'Candidate match scoring', included: true },
      { label: 'Bulk job posting', included: false },
      { label: 'Analytics dashboard', included: false },
      { label: 'Dedicated account manager', included: false },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1499,
    priceLabel: '\u20B91,499/month',
    icon: <Rocket className="h-6 w-6" />,
    features: [
      { label: 'Unlimited job postings', included: true },
      { label: 'Advanced candidate search', included: true },
      { label: 'Priority phone + email support', included: true },
      { label: 'Priority listing', included: true },
      { label: 'Candidate match scoring', included: true },
      { label: 'Bulk job posting', included: true },
      { label: 'Analytics dashboard', included: true },
      { label: 'Dedicated account manager', included: true },
    ],
  },
];

const SubscriptionPlans: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`${API_URL}/subscriptions/my`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setCurrentPlan(data.plan || data.subscription?.plan || 'free');
        }
      } catch {
        // default to free
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.id === currentPlan || plan.id === 'free') return;

    const token = getToken();
    setUpgrading(plan.id);

    try {
      const res = await fetch(`${API_URL}/payments/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      if (!res.ok) throw new Error('Failed to create subscription');
      const response = await res.json();

      // Mock mode: skip Razorpay SDK and directly verify
      if (response.mock === true || response.data?.mock === true) {
        const subscriptionId = response.subscriptionId || response.data?.subscriptionId;
        try {
          await fetch(`${API_URL}/payments/verify-subscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_subscription_id: subscriptionId,
              razorpay_payment_id: 'mock_pay_' + Date.now(),
              razorpay_signature: 'mock_sig',
            }),
          });
          setCurrentPlan(plan.id);
          alert(`Successfully upgraded to ${plan.name} plan!`);
        } catch {
          alert('Subscription verification failed. Please contact support.');
        }
        return;
      }

      const options = {
        key: response.key,
        subscription_id: response.subscriptionId,
        name: 'LocalJobs',
        description: `${plan.name} Plan - Monthly`,
        handler: async (paymentResponse: Record<string, unknown>) => {
          try {
            await fetch(`${API_URL}/payments/verify-subscription`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(paymentResponse),
            });
            setCurrentPlan(plan.id);
            alert(`Successfully upgraded to ${plan.name} plan!`);
          } catch {
            alert('Subscription verification failed. Please contact support.');
          }
        },
        theme: { color: '#2563EB' },
      };

      const rzp = new (window as unknown as Record<string, new (opts: typeof options) => { open: () => void }>).Razorpay(options);
      rzp.open();
    } catch {
      alert('Failed to initiate subscription. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose Your Plan</h2>
        <p className="text-sm text-gray-500">अपना प्लान चुनें</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                'relative bg-white rounded-xl border-2 p-6 flex flex-col transition-shadow',
                plan.highlighted
                  ? 'border-primary-400 shadow-lg shadow-primary-100'
                  : 'border-gray-200',
                isCurrent && 'ring-2 ring-green-400'
              )}
            >
              {/* Current plan badge */}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </span>
              )}

              {/* Plan header */}
              <div className="text-center mb-5 pt-2">
                <div
                  className={cn(
                    'inline-flex items-center justify-center h-12 w-12 rounded-full mb-3',
                    plan.highlighted
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {plan.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {plan.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      &#8377;{plan.price.toLocaleString('en-IN')}
                      <span className="text-sm font-normal text-gray-500">/month</span>
                    </>
                  )}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-2 text-sm"
                  >
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      )}
                    >
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Action */}
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={isCurrent || plan.id === 'free' || upgrading !== null}
                className={cn(
                  'w-full inline-flex items-center justify-center px-4 py-3 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : plan.highlighted
                    ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                    : plan.id === 'free'
                    ? 'bg-gray-100 text-gray-500 cursor-default'
                    : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {upgrading === plan.id && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isCurrent
                  ? 'Current Plan'
                  : plan.id === 'free'
                  ? 'Free Plan'
                  : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
