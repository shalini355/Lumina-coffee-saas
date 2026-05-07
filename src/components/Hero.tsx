import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import {useFallbackImage} from '../lib/media';
import {useSiteContent} from '../lib/siteContentContext';

export default function Hero() {
  const {hero} = useSiteContent();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 scale-105 select-none pointer-events-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-950/80 via-coffee-950/60 to-coffee-950 z-10" />
        <img 
          src={hero.image}
          alt="Coffee Background"
          onError={(event) => useFallbackImage(event, hero.fallbackImage)}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-coffee-400 uppercase tracking-[0.4em] text-sm font-medium mb-6 block">
            {hero.eyebrow}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
            {hero.title} <br className="hidden md:block"/>
            <span className="italic text-coffee-200">{hero.accent}</span>
          </h1>
          <p className="text-coffee-100/80 max-w-2xl mx-auto text-lg md:text-xl font-light mb-12">
            {hero.description}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href={hero.primaryHref}
              className="group px-8 py-4 bg-coffee-500 text-white uppercase tracking-widest text-sm transition-all duration-300 hover:bg-coffee-600 flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              {hero.primaryCta}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href={hero.secondaryHref}
              className="px-8 py-4 bg-transparent border border-white/20 text-white uppercase tracking-widest text-sm transition-all duration-300 hover:border-coffee-500 hover:bg-white/5 backdrop-blur-sm w-full sm:w-auto text-center"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-coffee-300">Scroll</span>
        <div className="w-[1px] h-12 bg-white/20 overflow-hidden relative">
          <motion.div 
            className="w-full h-1/2 bg-coffee-400 absolute top-0"
            animate={{ y: ['0%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
