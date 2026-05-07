import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {motion} from 'motion/react';
import {Check, Send} from 'lucide-react';
import {postJson} from '../lib/api';
import {useSiteContent} from '../lib/siteContentContext';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function SubscriptionPlans() {
  const {plans: planContent} = useSiteContent();
  const plans = planContent.items;
  const frequencies = planContent.frequencies;
  const defaultPlan = useMemo(
    () => plans.find((plan) => plan.featured)?.name || plans[0]?.name || '',
    [plans],
  );
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [status, setStatus] = useState<FormState>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!plans.some((plan) => plan.name === selectedPlan)) {
      setSelectedPlan(defaultPlan);
    }
  }, [defaultPlan, plans, selectedPlan]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');
    setMessage('');

    try {
      const response = await postJson('/api/orders', {
        plan: selectedPlan,
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        company: String(formData.get('company') || ''),
        deliveryFrequency: String(formData.get('deliveryFrequency') || ''),
        notes: String(formData.get('notes') || ''),
      });
      setStatus('success');
      setMessage(response.message);
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit request.');
    }
  }

  return (
    <section id="plans" className="py-24 md:py-32 bg-coffee-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 lg:gap-16 items-start">
          <div>
            <motion.span
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              className="text-sage-300 uppercase tracking-[0.3em] text-sm font-medium mb-4 block"
            >
              {planContent.eyebrow}
            </motion.span>
            <motion.h2
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: 0.1}}
              className="text-4xl md:text-5xl font-serif text-white mb-6"
            >
              {planContent.title} <span className="italic text-coffee-200">{planContent.accent}</span>.
            </motion.h2>
            <p className="text-coffee-100/70 font-light text-lg max-w-2xl mb-10">
              {planContent.description}
            </p>

            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((plan, index) => (
                <motion.button
                  key={plan.name}
                  type="button"
                  initial={{opacity: 0, y: 24}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true}}
                  transition={{delay: index * 0.08}}
                  onClick={() => setSelectedPlan(plan.name)}
                  className={`text-left border p-6 transition-all duration-300 ${
                    selectedPlan === plan.name
                      ? 'border-sage-300 bg-sage-700/20 shadow-2xl shadow-black/20'
                      : 'border-white/10 bg-white/[0.04] hover:border-coffee-500/60'
                  }`}
                >
                  {plan.featured && (
                    <span className="inline-flex mb-4 text-[0.65rem] uppercase tracking-[0.24em] text-sage-100 bg-sage-700/70 px-3 py-1">
                      Popular
                    </span>
                  )}
                  <h3 className="text-xl font-serif text-white mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl text-coffee-100">{plan.price}</span>
                    <span className="text-xs uppercase tracking-widest text-coffee-100/50">{plan.cadence}</span>
                  </div>
                  <p className="text-sm text-coffee-100/60 font-light leading-relaxed min-h-20">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-coffee-100/70">
                        <Check size={16} className="mt-0.5 text-sage-300 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div
            initial={{opacity: 0, x: 30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{duration: 0.7}}
            className="bg-[#15100d] border border-white/10 p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-sage-300">Launch Request</span>
                <h3 className="text-2xl font-serif text-white mt-3">{selectedPlan}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-500/20 text-sage-300 flex items-center justify-center shrink-0">
                <Send size={20} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="plan-name" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Full Name</label>
                <input id="plan-name" name="name" required className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-sage-300 transition-colors font-light" placeholder="Alex Mercer" />
              </div>
              <div>
                <label htmlFor="plan-email" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Email Address</label>
                <input id="plan-email" name="email" type="email" required className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-sage-300 transition-colors font-light" placeholder="alex@company.com" />
              </div>
              <div>
                <label htmlFor="plan-company" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Company</label>
                <input id="plan-company" name="company" className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-sage-300 transition-colors font-light" placeholder="Lumina Studio" />
              </div>
              <div>
                <label htmlFor="plan-frequency" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Delivery Frequency</label>
                <select id="plan-frequency" name="deliveryFrequency" required defaultValue="Monthly" className="w-full bg-coffee-950 border border-white/15 px-3 py-3 text-white focus:outline-none focus:border-sage-300 transition-colors font-light">
                  {frequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>{frequency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="plan-notes" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Notes</label>
                <textarea id="plan-notes" name="notes" className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-sage-300 transition-colors font-light resize-none h-20" placeholder="Team size, grind preference, or delivery needs" />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-sage-500 hover:bg-sage-700 disabled:opacity-60 disabled:cursor-not-allowed text-white uppercase tracking-widest text-sm transition-colors mt-4"
              >
                {status === 'submitting' ? 'Submitting...' : 'Request Plan'}
              </button>
              {message && (
                <p aria-live="polite" className={`text-sm ${status === 'error' ? 'text-red-300' : 'text-sage-300'}`}>
                  {message}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
