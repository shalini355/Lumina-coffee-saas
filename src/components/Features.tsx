import { motion } from 'motion/react';
import { CalendarClock, Coffee, PackageCheck, Users, type LucideIcon } from 'lucide-react';
import {useSiteContent} from '../lib/siteContentContext';
import type {FeatureItem} from '../lib/siteContent';

const icons: Record<FeatureItem['icon'], LucideIcon> = {
  calendar: CalendarClock,
  coffee: Coffee,
  package: PackageCheck,
  users: Users,
};

export default function Features() {
  const {features} = useSiteContent();

  return (
    <section className="py-20 bg-coffee-900 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          {features.items.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 rounded-full bg-coffee-800/50 flex items-center justify-center mb-6 text-sage-300 group-hover:bg-sage-500 group-hover:text-white transition-all duration-300 border border-white/5 group-hover:border-sage-300">
                {(() => {
                  const Icon = icons[feature.icon];
                  return <Icon strokeWidth={1.5} size={28} />;
                })()}
              </div>
              <h3 className="text-lg font-serif text-white mb-3">{feature.title}</h3>
              <p className="text-coffee-100/60 font-light text-sm max-w-[200px] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
