import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {motion} from 'motion/react';
import {BarChart3, CreditCard, Pause, Play, ShieldCheck, XCircle} from 'lucide-react';
import {useAuth, type AuthUser} from '../lib/authContext';
import {useSiteContent} from '../lib/siteContentContext';

type Subscription = {
  id: string;
  plan: string;
  price: string;
  cadence: string;
  deliveryFrequency: string;
  status: 'trialing' | 'active' | 'paused' | 'canceled' | 'pending_payment';
  billingMode: 'demo' | 'stripe';
  currentPeriodEnd: string;
};

type DashboardResponse = {
  ok: boolean;
  user: AuthUser;
  subscriptions: Subscription[];
};

type MetricsResponse = {
  ok: boolean;
  metrics: {
    users: number;
    activeSubscriptions: number;
    pendingPayment: number;
    contactLeads: number;
    orderRequests: number;
    newsletterSubscribers: number;
  };
};

type MutationResponse = {
  ok: boolean;
  message: string;
  checkoutUrl?: string;
  portalUrl?: string;
  subscription?: Subscription;
};

export default function Dashboard() {
  const {status, user} = useAuth();
  const {plans} = useSiteContent();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<MetricsResponse['metrics'] | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const defaultPlan = useMemo(
    () => plans.items.find((plan) => plan.featured)?.name || plans.items[0]?.name || '',
    [plans.items],
  );

  const defaultFrequency = plans.frequencies[0] || 'Monthly';

  useEffect(() => {
    setSelectedPlan((current) => current || defaultPlan);
    setSelectedFrequency((current) => current || defaultFrequency);
  }, [defaultFrequency, defaultPlan]);

  useEffect(() => {
    if (status !== 'authenticated') {
      setSubscriptions([]);
      setMetrics(null);
      return;
    }

    void loadDashboard();
  }, [status, user?.id]);

  async function loadDashboard() {
    const data = await requestJson<DashboardResponse>('/api/saas/dashboard');
    setSubscriptions(data.subscriptions);

    if (data.user.role === 'admin') {
      const adminData = await requestJson<MetricsResponse>('/api/admin/metrics');
      setMetrics(adminData.metrics);
    }
  }

  async function handleStartSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsBusy(true);
    setMessage('');

    try {
      const data = await requestJson<MutationResponse>('/api/saas/subscriptions', {
        method: 'POST',
        body: {
          plan: selectedPlan,
          deliveryFrequency: selectedFrequency,
        },
      });

      setMessage(data.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start subscription.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubscriptionAction(subscriptionId: string, action: 'pause' | 'resume' | 'cancel') {
    setIsBusy(true);
    setMessage('');

    try {
      const data = await requestJson<MutationResponse>(
        `/api/saas/subscriptions/${subscriptionId}`,
        {
          method: 'PATCH',
          body: {action},
        },
      );

      setMessage(data.message);
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update subscription.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCheckout(plan: string) {
    setIsBusy(true);
    setMessage('');

    try {
      const data = await requestJson<MutationResponse>('/api/billing/checkout', {
        method: 'POST',
        body: {plan},
      });

      setMessage(data.message);
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create checkout session.');
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePortal() {
    setIsBusy(true);
    setMessage('');

    try {
      const data = await requestJson<MutationResponse>('/api/billing/customer-portal', {
        method: 'POST',
      });

      setMessage(data.message);
      if (data.portalUrl) {
        window.location.assign(data.portalUrl);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not open billing portal.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section id="dashboard" className="py-24 bg-[#100b08] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <motion.div
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
          >
            <span className="text-sage-300 uppercase tracking-[0.3em] text-sm font-medium mb-4 block">
              Customer App
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-5">
              SaaS account <span className="italic text-coffee-200">dashboard</span>.
            </h2>
            <p className="text-coffee-100/70 font-light text-lg mb-8">
              Manage subscriptions, billing, and account status from a protected customer workspace.
            </p>

            {status !== 'authenticated' ? (
              <div className="border border-white/10 bg-white/[0.04] p-6">
                <ShieldCheck className="text-sage-300 mb-4" size={28} />
                <h3 className="text-xl font-serif text-white mb-3">Login required</h3>
                <p className="text-sm text-coffee-100/60 leading-relaxed">
                  Use the login or signup button in the navbar to open your dashboard.
                </p>
              </div>
            ) : (
              <div className="border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-sage-300 mb-3">Signed In</p>
                <h3 className="text-2xl font-serif text-white">{user?.name}</h3>
                <p className="text-sm text-coffee-100/60 mt-2">{user?.email}</p>
                <p className="text-xs uppercase tracking-widest text-coffee-400 mt-4">{user?.role}</p>
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            {status === 'authenticated' && (
              <>
                <form
                  onSubmit={handleStartSubscription}
                  className="grid md:grid-cols-[1fr_1fr_auto] gap-4 border border-white/10 bg-[#15100d] p-5"
                >
                  <label htmlFor="dashboard-plan" className="block">
                    <span className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Plan</span>
                    <select
                      id="dashboard-plan"
                      value={selectedPlan}
                      onChange={(event) => setSelectedPlan(event.target.value)}
                      className="w-full bg-coffee-950 border border-white/15 px-3 py-3 text-white focus:outline-none focus:border-sage-300"
                    >
                      {plans.items.map((plan) => (
                        <option key={plan.name} value={plan.name}>
                          {plan.name} - {plan.price}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label htmlFor="dashboard-frequency" className="block">
                    <span className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Frequency</span>
                    <select
                      id="dashboard-frequency"
                      value={selectedFrequency}
                      onChange={(event) => setSelectedFrequency(event.target.value)}
                      className="w-full bg-coffee-950 border border-white/15 px-3 py-3 text-white focus:outline-none focus:border-sage-300"
                    >
                      {plans.frequencies.map((frequency) => (
                        <option key={frequency} value={frequency}>
                          {frequency}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="self-end px-6 py-3 bg-sage-500 hover:bg-sage-700 disabled:opacity-60 text-white uppercase tracking-widest text-xs transition-colors"
                  >
                    Start Trial
                  </button>
                </form>

                {message && (
                  <p aria-live="polite" className="text-sm text-sage-300">
                    {message}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {subscriptions.length === 0 ? (
                    <div className="md:col-span-2 border border-white/10 bg-white/[0.04] p-6 text-coffee-100/60">
                      No subscriptions yet. Start a trial above.
                    </div>
                  ) : (
                    subscriptions.map((subscription) => (
                      <article key={subscription.id} className="border border-white/10 bg-white/[0.04] p-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div>
                            <h3 className="text-2xl font-serif text-white">{subscription.plan}</h3>
                            <p className="text-sm text-coffee-100/60 mt-1">
                              {subscription.price} / {subscription.cadence}
                            </p>
                          </div>
                          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-sage-300 border border-sage-300/30 px-3 py-1">
                            {subscription.status}
                          </span>
                        </div>
                        <p className="text-sm text-coffee-100/60 mb-5">
                          {subscription.deliveryFrequency} delivery. Period ends{' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {subscription.status === 'paused' ? (
                            <button
                              type="button"
                              onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                              disabled={isBusy}
                              className="px-4 py-2 border border-white/10 text-sage-300 hover:border-sage-300 transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                            >
                              <Play size={14} />
                              Resume
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                              disabled={isBusy || subscription.status === 'canceled'}
                              className="px-4 py-2 border border-white/10 text-coffee-100 hover:border-coffee-500 transition-colors text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-40"
                            >
                              <Pause size={14} />
                              Pause
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCheckout(subscription.plan)}
                            disabled={isBusy || subscription.status === 'canceled'}
                            className="px-4 py-2 border border-white/10 text-coffee-100 hover:border-sage-300 transition-colors text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-40"
                          >
                            <CreditCard size={14} />
                            Billing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                            disabled={isBusy || subscription.status === 'canceled'}
                            className="px-4 py-2 border border-white/10 text-red-300 hover:border-red-300 transition-colors text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-40"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={handlePortal}
                  disabled={isBusy}
                  className="px-5 py-3 border border-white/10 text-coffee-100 hover:text-white hover:border-sage-300 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"
                >
                  <CreditCard size={15} />
                  Open Billing Portal
                </button>

                {metrics && (
                  <div className="border border-white/10 bg-[#15100d] p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <BarChart3 className="text-sage-300" size={22} />
                      <h3 className="text-xl font-serif text-white">Admin Metrics</h3>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {Object.entries(metrics).map(([label, value]) => (
                        <div key={label} className="bg-white/[0.04] border border-white/5 p-4">
                          <p className="text-2xl text-white font-serif">{value}</p>
                          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-coffee-100/50 mt-2">
                            {label.replace(/([A-Z])/g, ' $1')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

async function requestJson<T>(
  endpoint: string,
  options: {method?: string; body?: Record<string, unknown>} = {},
): Promise<T> {
  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    credentials: 'same-origin',
    headers: options.body ? {'Content-Type': 'application/json'} : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({
    ok: false,
    message: 'The server returned an unreadable response.',
  }))) as T & {message?: string};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}
