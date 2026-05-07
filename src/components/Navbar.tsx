import {useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {LogIn, LogOut, Menu, UserPlus, X} from 'lucide-react';
import {useSiteContent} from '../lib/siteContentContext';
import {useAuth} from '../lib/authContext';
import AuthModal, {type AuthMode} from './AuthModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const {brand, hero} = useSiteContent();
  const {logout, status, user} = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    ...(status === 'authenticated' ? [{ name: 'Dashboard', href: '#dashboard' }] : []),
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Plans', href: '#plans' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleAuthOpen = (mode: AuthMode) => {
    setAuthMode(mode);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    void logout();
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-coffee-950/80 backdrop-blur-lg border-white/5 shadow-2xl py-4'
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="text-2xl font-serif font-bold tracking-wider text-white">
            {brand.name}
            <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-coffee-400 mt-1 font-sans font-medium">{brand.subtitle}</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm uppercase tracking-widest text-coffee-100 hover:text-coffee-400 transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-coffee-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
            {status === 'authenticated' && user ? (
              <div className="flex items-center gap-3">
                <span className="max-w-32 truncate text-xs uppercase tracking-widest text-sage-300">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-10 h-10 border border-white/10 text-white/70 hover:text-white hover:border-coffee-500 transition-colors flex items-center justify-center"
                  aria-label="Log out"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAuthOpen('login')}
                  className="px-4 py-2 border border-white/10 text-coffee-100 hover:text-white hover:border-sage-300 transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <LogIn size={15} />
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => handleAuthOpen('signup')}
                  className="px-4 py-2 bg-sage-500 hover:bg-sage-700 text-white transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <UserPlus size={15} />
                  Signup
                </button>
              </div>
            )}
            <a
              href={hero.primaryHref}
              className="px-5 py-2.5 bg-coffee-500 text-white text-sm uppercase tracking-widest font-medium rounded-none hover:bg-coffee-600 transition-all duration-300 border border-coffee-500 hover:border-coffee-600"
            >
              {hero.primaryCta}
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-coffee-950/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
              <div className="flex flex-col items-center py-8 gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg uppercase tracking-widest text-coffee-100 hover:text-coffee-400 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
                {status === 'authenticated' && user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-lg uppercase tracking-widest text-sage-300 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <LogOut size={18} />
                    Logout {user.name}
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleAuthOpen('login')}
                      className="text-lg uppercase tracking-widest text-coffee-100 hover:text-sage-300 transition-colors flex items-center gap-3"
                    >
                      <LogIn size={18} />
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAuthOpen('signup')}
                      className="px-6 py-3 bg-sage-500 hover:bg-sage-700 text-white uppercase tracking-widest text-sm transition-colors flex items-center gap-3"
                    >
                      <UserPlus size={18} />
                      Signup
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onModeChange={setAuthMode}
          />
        )}
      </AnimatePresence>
    </>
  );
}
