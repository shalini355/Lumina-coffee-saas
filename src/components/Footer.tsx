import {useState, type FormEvent} from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import {postJson} from '../lib/api';
import {useSiteContent} from '../lib/siteContentContext';

export default function Footer() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {brand, footer} = useSiteContent();

  async function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await postJson('/api/newsletter', {
        email: String(formData.get('email') || ''),
        source: 'footer',
      });
      setMessage(response.message);
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not subscribe.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="bg-black pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="lg:col-span-2">
             <a href="#home" className="text-3xl font-serif font-bold tracking-wider text-white mb-6 block">
              {brand.name}
              <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-coffee-400 mt-1 font-sans font-medium">{brand.subtitle}</span>
            </a>
            <p className="text-coffee-100/60 font-light text-sm max-w-sm mb-8 leading-relaxed">
              {footer.description}
            </p>
            <div className="flex gap-4">
              <a href={footer.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-coffee-500 hover:bg-coffee-500/20 transition-all">
                <Instagram size={18} />
              </a>
              <a href={footer.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-coffee-500 hover:bg-coffee-500/20 transition-all">
                <Facebook size={18} />
              </a>
              <a href={footer.socials.x} target="_blank" rel="noreferrer" aria-label="X" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-coffee-500 hover:bg-coffee-500/20 transition-all">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium tracking-widest uppercase text-sm mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm font-light text-coffee-100/60">
              <li><a href="#home" className="hover:text-coffee-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-coffee-400 transition-colors">About Us</a></li>
              <li><a href="#menu" className="hover:text-coffee-400 transition-colors">Our Menu</a></li>
              <li><a href="#gallery" className="hover:text-coffee-400 transition-colors">Gallery</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium tracking-widest uppercase text-sm mb-6">Newsletter</h4>
            <p className="text-coffee-100/60 font-light text-sm mb-4">{footer.newsletterText}</p>
            <form onSubmit={handleNewsletter} className="flex border-b border-white/20 pb-2">
              <input 
                name="email"
                type="email" 
                required
                placeholder="Enter your email" 
                className="bg-transparent flex-grow text-white text-sm focus:outline-none font-light"
              />
              <button disabled={isSubmitting} className="text-coffee-400 hover:text-white disabled:opacity-60 uppercase tracking-widest text-xs font-medium transition-colors">
                {isSubmitting ? 'Sending' : 'Subscribe'}
              </button>
            </form>
            {message && <p aria-live="polite" className="text-sage-300 text-xs mt-3">{message}</p>}
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest uppercase text-coffee-100/40">
          <p>&copy; {new Date().getFullYear()} {brand.name} Coffee. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#contact" className="hover:text-coffee-400 transition-colors">Privacy Policy</a>
            <a href="#contact" className="hover:text-coffee-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
