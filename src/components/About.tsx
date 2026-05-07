import { motion } from 'motion/react';
import {useFallbackImage} from '../lib/media';
import {useSiteContent} from '../lib/siteContentContext';

export default function About() {
  const {about} = useSiteContent();

  return (
    <section id="about" className="py-24 md:py-32 bg-coffee-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-coffee-500/10 -translate-x-4 translate-y-4 border border-coffee-500/20" />
            <img 
              src={about.image}
              alt="Barista brewing coffee" 
              onError={(event) => useFallbackImage(event, about.fallbackImage)}
              className="relative z-10 w-full h-[600px] object-cover filter brightness-90 contrast-110"
            />
            {/* Floating glass card */}
            <div className="absolute -bottom-8 -right-8 bg-coffee-900/80 backdrop-blur-md border border-white/10 p-8 z-20 hidden md:block">
              <h4 className="text-3xl font-serif text-coffee-200 mb-2">{about.statValue}</h4>
              <p className="text-xs uppercase tracking-widest text-coffee-100">{about.statLabel}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-coffee-400 uppercase tracking-[0.3em] text-sm font-medium mb-4 block">
              {about.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
              {about.title} <br/>
              <span className="italic text-coffee-200">{about.accent}</span>.
            </h2>
            <div className="space-y-6 text-coffee-100/80 font-light text-lg">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            
            <div className="mt-12">
              <img 
                src={about.signatureImage}
                alt="Signature" 
                onError={(event) => useFallbackImage(event, about.signatureFallback)}
                className="h-12 opacity-50 invert"
                style={{ filter: 'brightness(0) invert(1) opacity(0.5)' }}
              />
              <p className="tracking-widest uppercase text-xs text-coffee-400 mt-4">{about.signatureName}</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
