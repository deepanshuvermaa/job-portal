import React, { useState, useEffect } from 'react';
import { Coins, Check, Loader2, CreditCard } from 'lucide-react';
import { cn } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CreditPack {
  credits: number;
  price: number;
  perCredit: string;
  badge?: string;
}

interface Transaction {
  id: string;
  date: string;
  credits: number;
  amount: number;
  status: string;
}

const CREDIT_PACKS: CreditPack[] = [
  { credits: 5, price: 149, perCredit: '29.8' },
  { credits: 15, price: 399, perCredit: '26.6', badge: 'Popular' },
  { credits: 30, price: 699, perCredit: '23.3' },
  { credits: 50, price: 999, perCredit: '19.98', badge: 'Best Value' },
];

const CreditPurchase: React.FC = () => {
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  const getToken = () => localStorage.getItem('token') || '';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = getToken();
    try {
      const creditsRes = await fetch(`${API_URL}/payments/credits`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (creditsRes.ok) {
        const json = await creditsRes.json();
        const data = json.data || json;
        setCurrentCredits(data.credits_remaining ?? data.credits ?? data.balance ?? 0);
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pack: CreditPack) => {
    const token = getToken();
    setPurchasing(pack.credits);

    try {
      const res = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ credits: pack.credits, amount: pack.price }),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const response = await res.json();

      // Mock mode: skip Razorpay SDK and directly verify
      if (response.mock === true || response.data?.mock === true) {
        const orderId = response.orderId || response.data?.orderId;
        try {
          await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: orderId,
              razorpay_payment_id: 'mock_pay_' + Date.now(),
              razorpay_signature: 'mock_sig',
            }),
          });
          await fetchData();
          alert('Payment successful! Credits have been added to your account.');
        } catch {
          alert('Payment verification failed. Please contact support.');
        }
        return;
      }

      const options = {
        key: response.key,
        amount: response.amount,
        currency: 'INR',
        name: 'LocalJobs',
        description: `${pack.credits} Interview Credits`,
        order_id: response.orderId,
        handler: async (paymentResponse: Record<string, unknown>) => {
          try {
            await fetch(`${API_URL}/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(paymentResponse),
            });
            await fetchData();
            alert('Payment successful! Credits have been added to your account.');
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {},
        theme: { color: '#2563EB' },
      };

      const rzp = new (window as unknown as Record<string, new (opts: typeof options) => { open: () => void }>).Razorpay(options);
      rzp.open();
    } catch {
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setPurchasing(null);
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
    <div className="max-w-4xl mx-auto">
      {/* Current Balance */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-5 mb-8 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
          <Coins className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Balance / वर्तमान शेष</p>
          <p className="text-2xl font-bold text-primary-700">{currentCredits} Credits</p>
        </div>
      </div>

      {/* Credit Packs */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">Buy Interview Credits</h3>
      <p className="text-sm text-gray-500 mb-4">इंटरव्यू क्रेडिट खरीदें</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CREDIT_PACKS.map((pack) => (
          <div
            key={pack.credits}
            className={cn(
              'relative bg-white border rounded-xl p-5 flex flex-col items-center text-center transition-shadow hover:shadow-md',
              pack.badge === 'Popular' && 'border-primary-400 ring-2 ring-primary-100',
              pack.badge === 'Best Value' && 'border-green-400 ring-2 ring-green-100'
            )}
          >
            {pack.badge && (
              <span
                className={cn(
                  'absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-semibold rounded-full',
                  pack.badge === 'Popular'
                    ? 'bg-primary-600 text-white'
                    : 'bg-green-600 text-white'
                )}
              >
                {pack.badge}
              </span>
            )}

            <p className="text-3xl font-bold text-gray-900 mt-2">{pack.credits}</p>
            <p className="text-sm text-gray-500 mb-3">credits</p>
            <p className="text-xl font-bold text-gray-900 mb-1">
              &#8377;{pack.price}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              &#8377;{pack.perCredit}/credit
            </p>
            <button
              onClick={() => handlePurchase(pack)}
              disabled={purchasing !== null}
              className={cn(
                'w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {purchasing === pack.credits ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Transaction History</h3>
          <p className="text-sm text-gray-500 mb-4">लेनदेन इतिहास</p>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Credits</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      +{tx.credits}
                    </td>
                    <td className="px-4 py-3 text-gray-700">&#8377;{tx.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                          tx.status === 'success'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        )}
                      >
                        {tx.status === 'success' && <Check className="h-3 w-3 mr-1" />}
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditPurchase;
