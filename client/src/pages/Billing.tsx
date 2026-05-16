import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { Loader, CreditCard, Check, X } from 'lucide-react';

interface UsageStats {
  tier: 'free' | 'pro' | 'team';
  reviewsUsed: number;
  reviewsLimit: number;
  projectsLimit: number;
  resetDate: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  limits: {
    projects: number;
    reviewsPerMonth: number;
  };
}

export default function Billing() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usageRes, plansRes] = await Promise.all([
        api.get('/billing/usage'),
        api.get('/billing/plans')
      ]);
      setUsage(usageRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (tier: string) => {
    setIsUpgrading(true);
    try {
      const response = await api.post('/billing/checkout', { tier });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/billing/portal');
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing & Subscription</h1>

      {/* Current Usage */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Subscription Tier</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{usage?.tier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Reviews This Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {usage?.reviewsUsed} / {usage?.reviewsLimit === -1 ? '∞' : usage?.reviewsLimit}
            </p>
            {usage && usage.reviewsLimit > 0 && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full"
                  style={{ width: `${Math.min(100, (usage.reviewsUsed / usage.reviewsLimit) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Resets On</p>
            <p className="text-2xl font-bold text-gray-900">{usage && formatDate(usage.resetDate)}</p>
          </div>
        </div>

        {usage?.tier !== 'free' && (
          <button
            onClick={handleManageSubscription}
            className="btn-secondary mt-6"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </button>
        )}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {Object.values(plans).map((plan) => {
          const isCurrentPlan = usage?.tier === plan.id;
          const isUpgrade = plan.price > (usage?.tier === 'free' ? 0 : plan.price);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm p-6 ${
                plan.id === 'pro' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.id === 'pro' && (
                <div className="bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.price > 0 && <span className="text-gray-500">/month</span>}
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-gray-600">
                  {plan.limits.projects === -1 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      Unlimited Projects
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      {plan.limits.projects} Projects
                    </>
                  )}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  {plan.limits.reviewsPerMonth === -1 ? (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      Unlimited Reviews
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5 text-green-500" />
                      {plan.limits.reviewsPerMonth} Reviews/month
                    </>
                  )}
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan || isUpgrading || (plan.price === 0 && usage?.tier === 'free')}
                className={`w-full mt-8 ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.id === 'pro'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {isCurrentPlan
                  ? 'Current Plan'
                  : isUpgrade
                  ? isUpgrading
                    ? 'Redirecting...'
                    : 'Upgrade'
                  : 'Downgrade'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}