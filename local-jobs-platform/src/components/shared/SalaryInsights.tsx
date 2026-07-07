import React, { useState, useEffect } from 'react';
import { IndianRupee, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SalaryData {
  min: number;
  max: number;
  avg?: number;
  sample_size: number;
}

interface SalaryInsightsProps {
  jobType: string;
  city: string;
}

const SalaryInsights: React.FC<SalaryInsightsProps> = ({ jobType, city }) => {
  const [data, setData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobType || !city) {
      setLoading(false);
      return;
    }

    const fetchSalary = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/public/salary-insights?job_type=${encodeURIComponent(jobType)}&city=${encodeURIComponent(city)}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json.data || json || null);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, [jobType, city]);

  if (loading || !data) return null;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toString();
  };

  const avg = data.avg || Math.round((data.min + data.max) / 2);
  const range = data.max - data.min;
  const avgPercent = range > 0 ? ((avg - data.min) / range) * 100 : 50;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-blue-900">Salary Insights</h4>
        <span className="text-xs text-blue-500 ml-auto">
          वेतन जानकारी
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3">
        Average salary for <span className="font-semibold">{jobType}</span> in{' '}
        <span className="font-semibold">{city}</span>:
      </p>

      <div className="flex items-center gap-2 mb-3">
        <IndianRupee className="h-4 w-4 text-gray-600" />
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(data.min)} - {formatCurrency(data.max)}
        </span>
        <span className="text-sm text-gray-500">/month</span>
      </div>

      {/* Visual range indicator */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          style={{ width: '100%' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-700 rounded-full shadow-sm"
          style={{ left: `${avgPercent}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{formatCurrency(data.min)}</span>
        <span className={cn('font-medium text-blue-700')}>
          Avg: {formatCurrency(avg)}
        </span>
        <span>{formatCurrency(data.max)}</span>
      </div>

      <p className="text-xs text-gray-400">
        Based on {data.sample_size} job posting{data.sample_size !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default SalaryInsights;
