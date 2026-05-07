import {useEffect, useState} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import {useSiteContent} from '../lib/siteContentContext';

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {reviews} = useSiteContent();
  const currentReview = reviews.items[currentIndex] || reviews.items[0];

  useEffect(() => {
    if (currentIndex >= reviews.items.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, reviews.items.length]);

  const handleNext = () => {
    if (reviews.items.length === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % reviews.items.length);
  };

  const handlePrev = () => {
    if (reviews.items.length === 0) {
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + reviews.items.length) % reviews.items.length);
  };

  if (!currentReview) {
    return null;
  }

  return (
    <section id="reviews" className="py-32 bg-[#120a05] relative overflow-hidden flex items-center">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-fixed bg-center"
        style={{
          backgroundImage: `url(${reviews.backdrop}), url(${reviews.backdropFallback})`,
        }}
      />
      <div className="absolute inset-0 bg-coffee-950/90" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <Quote size={48} className="mx-auto text-coffee-500/40 mb-10" />
        
        <div className="relative h-64 md:h-48 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute w-full"
            >
              <p className="text-xl md:text-2xl font-serif text-white italic leading-relaxed mb-8">
                "{currentReview.text}"
              </p>
              <div>
                <h4 className="text-coffee-200 tracking-wider uppercase text-sm font-medium">{currentReview.name}</h4>
                <p className="text-coffee-500 text-xs uppercase tracking-widest mt-1">{currentReview.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-6 mt-12">
          <button 
            onClick={handlePrev}
            className="p-3 border border-white/10 rounded-full text-white/50 hover:text-coffee-400 hover:border-coffee-500 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNext}
            className="p-3 border border-white/10 rounded-full text-white/50 hover:text-coffee-400 hover:border-coffee-500 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
