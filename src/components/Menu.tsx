import { motion } from 'motion/react';
import {useFallbackImage} from '../lib/media';
import {useSiteContent} from '../lib/siteContentContext';

export default function Menu() {
  const {menu} = useSiteContent();

  return (
    <section id="menu" className="py-24 md:py-32 bg-[#120a05] relative">
      {/* Decorative Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url(${menu.texture}), url(${menu.textureFallback})`,
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-coffee-400 uppercase tracking-[0.3em] text-sm font-medium mb-4 block"
          >
            {menu.eyebrow}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-white"
          >
            {menu.title} <span className="italic text-coffee-200">{menu.accent}</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menu.items.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white/5 backdrop-blur-md border border-white/5 overflow-hidden hover:border-coffee-500/50 transition-all duration-300"
            >
              <div className="overflow-hidden h-64 relative">
                <div className="absolute inset-0 bg-coffee-950/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img 
                  src={item.image} 
                  alt={item.name}
                  loading="lazy"
                  onError={(event) => useFallbackImage(event, item.fallbackImage)}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="text-xl font-serif text-coffee-50">{item.name}</h3>
                  <span className="text-coffee-400 font-sans tracking-wider">{item.price}</span>
                </div>
                <p className="text-coffee-100/60 text-sm font-light leading-relaxed">
                  {item.description}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <a href="#plans" className="text-xs uppercase tracking-widest text-coffee-200 hover:text-white transition-colors">Subscribe</a>
                  <div className="w-8 h-[1px] bg-coffee-400 group-hover:w-16 transition-all duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
