import { motion } from 'motion/react';
import {useFallbackImage} from '../lib/media';
import {useSiteContent} from '../lib/siteContentContext';

export default function Gallery() {
  const {gallery} = useSiteContent();

  return (
    <section id="gallery" className="bg-coffee-950 py-24">
      <div className="max-w-[1600px] mx-auto px-4 md:px-0">
        <div className="text-center mb-16 px-6">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-coffee-400 uppercase tracking-[0.3em] text-sm font-medium mb-4 block"
          >
            {gallery.eyebrow}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-white"
          >
            {gallery.title} <span className="italic text-coffee-200">{gallery.accent}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-white/5">
          {gallery.images.map((image, index) => (
            <motion.div
              key={image.src}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="relative overflow-hidden aspect-square md:aspect-[4/5] group bg-coffee-900"
            >
              <img 
                src={image.src}
                alt={image.alt}
                loading="lazy"
                onError={(event) => useFallbackImage(event, image.fallback)}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
