import {useEffect, useState} from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Menu from './components/Menu';
import SubscriptionPlans from './components/SubscriptionPlans';
import Features from './components/Features';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import {SiteContentProvider} from './lib/siteContentContext';
import {defaultSiteContent, type SiteContent} from './lib/siteContent';
import {AuthProvider} from './lib/authContext';

type SiteContentResponse = {
  ok: boolean;
  content: SiteContent;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);

  // Simulate a luxurious loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSiteContent() {
      try {
        const response = await fetch('/api/site-content');
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SiteContentResponse;
        if (isMounted && data.ok) {
          setSiteContent(data.content);
        }
      } catch {
        // Keep bundled fallback content if the dynamic endpoint is unavailable.
      }
    }

    void loadSiteContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-100 bg-coffee-950 flex flex-col items-center justify-center text-white"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-3xl font-serif tracking-widest"
            >
              LUMINA
            </motion.div>
            <p className="mt-4 text-[0.6rem] uppercase tracking-[0.4em] text-coffee-400">Pouring perfection...</p>
            <div className="w-32 h-px bg-white/10 mt-6 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-y-0 left-0 w-1/2 bg-coffee-500"
                />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthProvider>
        <SiteContentProvider content={siteContent}>
          <div className="bg-coffee-950 min-h-screen text-coffee-50 selection:bg-coffee-500 selection:text-white">
            <Navbar />
            <main>
            <Hero />
            <Dashboard />
            <About />
              <Menu />
              <SubscriptionPlans />
              <Features />
              <Gallery />
              <Reviews />
              <Contact />
            </main>
            <Footer />
          </div>
        </SiteContentProvider>
      </AuthProvider>
    </>
  );
}
