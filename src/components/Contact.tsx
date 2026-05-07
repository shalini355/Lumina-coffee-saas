import {useState, type FormEvent} from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail } from 'lucide-react';
import {postJson} from '../lib/api';
import {useFallbackImage} from '../lib/media';
import {useSiteContent} from '../lib/siteContentContext';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function Contact() {
  const [status, setStatus] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const {contact} = useSiteContent();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');
    setMessage('');

    try {
      const response = await postJson('/api/contact', {
        name: String(formData.get('name') || ''),
        email: String(formData.get('email') || ''),
        company: String(formData.get('company') || ''),
        message: String(formData.get('message') || ''),
      });
      setStatus('success');
      setMessage(response.message);
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not send message.');
    }
  }

  return (
    <section id="contact" className="py-24 bg-coffee-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-coffee-400 uppercase tracking-[0.3em] text-sm font-medium mb-4 block">
              {contact.eyebrow}
            </span>
            <h2 className="text-4xl font-serif text-white mb-8">
              {contact.title} <span className="italic text-coffee-200">{contact.accent}</span>.
            </h2>
            
            <div className="space-y-8 mb-12">
              <div className="flex items-start gap-4">
                <MapPin className="text-coffee-500 mt-1" size={24} />
                <div>
                  <h4 className="text-white font-medium tracking-widest uppercase text-sm mb-1">Our Location</h4>
                  <p className="text-coffee-100/60 font-light text-sm">
                    {contact.address.split('\n').map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-coffee-500" size={24} />
                <div>
                  <h4 className="text-white font-medium tracking-widest uppercase text-sm mb-1">Call Us</h4>
                  <p className="text-coffee-100/60 font-light text-sm">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="text-coffee-500" size={24} />
                <div>
                  <h4 className="text-white font-medium tracking-widest uppercase text-sm mb-1">Email</h4>
                  <p className="text-coffee-100/60 font-light text-sm">{contact.email}</p>
                </div>
              </div>
            </div>

            {/* Google Maps placeholder (using an aesthetic dark map styled iframe or static image) */}
            <div className="h-48 w-full bg-coffee-900 border border-white/10 relative overflow-hidden group">
               <img
                 src={contact.mapImage}
                 alt="Map Location"
                 loading="lazy"
                 onError={(event) => useFallbackImage(event, contact.mapFallback)}
                 className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500"
               />
               <div className="absolute inset-0 bg-coffee-950/40" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <a href={contact.directionsUrl} target="_blank" rel="noreferrer" className="px-6 py-2 bg-coffee-500/90 text-white uppercase tracking-widest text-xs hover:bg-coffee-500 transition-colors">Get Directions</a>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#1a100c] p-10 border border-white/5"
          >
            <h3 className="text-2xl font-serif text-white mb-8">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Full Name</label>
                <input 
                  id="contact-name"
                  name="name"
                  type="text" 
                  required
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-coffee-500 transition-colors font-light"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Email Address</label>
                <input 
                  id="contact-email"
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-coffee-500 transition-colors font-light"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-company" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Company</label>
                <input
                  id="contact-company"
                  name="company"
                  type="text"
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-coffee-500 transition-colors font-light"
                  placeholder="Your team or venue"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Message</label>
                <textarea 
                  id="contact-message"
                  name="message"
                  required
                  className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-coffee-500 transition-colors font-light resize-none h-24"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 bg-coffee-500 hover:bg-coffee-600 disabled:opacity-60 disabled:cursor-not-allowed text-white uppercase tracking-widest text-sm transition-colors mt-4"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Form'}
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
