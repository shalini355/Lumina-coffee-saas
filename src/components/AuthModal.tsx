import {useState, type FormEvent} from 'react';
import {motion} from 'motion/react';
import {Lock, Mail, User, X} from 'lucide-react';
import {useAuth} from '../lib/authContext';

export type AuthMode = 'login' | 'signup';

type AuthModalProps = {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
};

export default function AuthModal({mode, onClose, onModeChange}: AuthModalProps) {
  const {login, signup} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const isSignup = mode === 'signup';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setMessage('');

    try {
      const email = String(formData.get('email') || '');
      const password = String(formData.get('password') || '');

      if (isSignup) {
        await signup(String(formData.get('name') || ''), email, password);
      } else {
        await login(email, password);
      }

      form.reset();
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <motion.div
        initial={{opacity: 0, y: 24, scale: 0.98}}
        animate={{opacity: 1, y: 0, scale: 1}}
        exit={{opacity: 0, y: 20, scale: 0.98}}
        className="w-full max-w-md bg-[#15100d] border border-white/10 p-6 md:p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-sage-300">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </span>
            <h2 className="text-3xl font-serif text-white mt-3">
              {isSignup ? 'Join Lumina' : 'Login'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication form"
            className="w-10 h-10 border border-white/10 text-white/70 hover:text-white hover:border-coffee-500 transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <label htmlFor="auth-name" className="block">
              <span className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Full Name</span>
              <span className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-sage-300 transition-colors">
                <User size={18} className="text-sage-300" />
                <input
                  id="auth-name"
                  name="name"
                  required
                  minLength={2}
                  className="w-full bg-transparent text-white focus:outline-none font-light"
                  placeholder="Alex Mercer"
                />
              </span>
            </label>
          )}

          <label htmlFor="auth-email" className="block">
            <span className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Email Address</span>
            <span className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-sage-300 transition-colors">
              <Mail size={18} className="text-sage-300" />
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                className="w-full bg-transparent text-white focus:outline-none font-light"
                placeholder="alex@company.com"
              />
            </span>
          </label>

          <label htmlFor="auth-password" className="block">
            <span className="block text-xs uppercase tracking-widest text-coffee-400 mb-2">Password</span>
            <span className="flex items-center gap-3 border-b border-white/20 pb-2 focus-within:border-sage-300 transition-colors">
              <Lock size={18} className="text-sage-300" />
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full bg-transparent text-white focus:outline-none font-light"
                placeholder="At least 8 characters"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-sage-500 hover:bg-sage-700 disabled:opacity-60 disabled:cursor-not-allowed text-white uppercase tracking-widest text-sm transition-colors"
          >
            {isSubmitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>

          {message && (
            <p aria-live="polite" className="text-sm text-red-300">
              {message}
            </p>
          )}
        </form>

        <button
          type="button"
          onClick={() => onModeChange(isSignup ? 'login' : 'signup')}
          className="mt-6 text-sm text-coffee-100/70 hover:text-sage-300 transition-colors"
        >
          {isSignup ? 'Already have an account? Login' : 'New here? Create an account'}
        </button>
      </motion.div>
    </div>
  );
}
