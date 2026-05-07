import {media, previousMedia} from './media';

export type SiteContent = {
  brand: {
    name: string;
    subtitle: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    image: string;
    fallbackImage: string;
  };
  about: {
    eyebrow: string;
    title: string;
    accent: string;
    paragraphs: string[];
    image: string;
    fallbackImage: string;
    signatureImage: string;
    signatureFallback: string;
    signatureName: string;
    statValue: string;
    statLabel: string;
  };
  menu: {
    eyebrow: string;
    title: string;
    accent: string;
    texture: string;
    textureFallback: string;
    items: MenuItem[];
  };
  plans: {
    eyebrow: string;
    title: string;
    accent: string;
    description: string;
    frequencies: string[];
    items: PlanItem[];
  };
  features: {
    items: FeatureItem[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    accent: string;
    images: GalleryImage[];
  };
  reviews: {
    backdrop: string;
    backdropFallback: string;
    items: ReviewItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    accent: string;
    address: string;
    phone: string;
    email: string;
    mapImage: string;
    mapFallback: string;
    directionsUrl: string;
  };
  footer: {
    description: string;
    newsletterText: string;
    socials: {
      instagram: string;
      facebook: string;
      x: string;
    };
  };
};

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
  fallbackImage: string;
};

export type PlanItem = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export type FeatureItem = {
  icon: 'calendar' | 'coffee' | 'package' | 'users';
  title: string;
  description: string;
};

export type GalleryImage = {
  src: string;
  fallback: string;
  alt: string;
};

export type ReviewItem = {
  id: number;
  name: string;
  role: string;
  text: string;
};

export const defaultSiteContent: SiteContent = {
  brand: {
    name: 'LUMINA',
    subtitle: 'Coffee Roasters',
  },
  hero: {
    eyebrow: 'Fresh roast subscriptions',
    title: 'Lumina Coffee',
    accent: 'Subscriptions',
    description:
      'Premium recurring roast deliveries for teams, homes, and hospitality spaces that want fresher coffee without operational drag.',
    primaryCta: 'Start Subscription',
    primaryHref: '#plans',
    secondaryCta: 'Explore Roasts',
    secondaryHref: '#menu',
    image: previousMedia.hero,
    fallbackImage: media.hero,
  },
  about: {
    eyebrow: 'Our Story',
    title: 'A commitment to',
    accent: 'exceptional quality',
    paragraphs: [
      "Founded in the heart of the city, Lumina Coffee Roasters began with a simple mission: to source the world's finest coffee beans and roast them to absolute perfection. We believe that every cup tells a story of its origin.",
      'Our master roasters treat coffee brewing not just as a process, but as an art form. We partner directly with sustainable farms globally, ensuring that every bean is ethically grown and meticulously hand-picked just for you.',
    ],
    image: previousMedia.about,
    fallbackImage: media.about,
    signatureImage: previousMedia.signature,
    signatureFallback: media.signature,
    signatureName: 'Alex Mercer, Master Roaster',
    statValue: '15+',
    statLabel: 'Years of Excellence',
  },
  menu: {
    eyebrow: 'Discover',
    title: 'Popular',
    accent: 'Signatures',
    texture: previousMedia.texture,
    textureFallback: media.texture,
    items: [
      {
        name: 'Classic Espresso',
        description: 'A concentrated shot of our signature dark roast.',
        price: '$3.50',
        image: previousMedia.menu.espresso,
        fallbackImage: media.menu.espresso,
      },
      {
        name: 'Velvet Cappuccino',
        description: 'Espresso balanced with steamed milk and thick foam.',
        price: '$4.50',
        image: previousMedia.menu.cappuccino,
        fallbackImage: media.menu.cappuccino,
      },
      {
        name: 'Vanilla Latte',
        description: 'Smooth espresso with steamed milk and real vanilla bean.',
        price: '$5.00',
        image: previousMedia.menu.latte,
        fallbackImage: media.menu.latte,
      },
      {
        name: 'Dark Mocha',
        description: 'Rich espresso layered with Belgian dark chocolate.',
        price: '$5.50',
        image: previousMedia.menu.mocha,
        fallbackImage: media.menu.mocha,
      },
      {
        name: 'Signature Cold Brew',
        description: 'Steeped for 18 hours for a remarkably smooth, sweet finish.',
        price: '$4.50',
        image: previousMedia.menu.coldBrew,
        fallbackImage: media.menu.coldBrew,
      },
    ],
  },
  plans: {
    eyebrow: 'Subscription SaaS',
    title: 'Roast plans that',
    accent: 'scale cleanly',
    description:
      'Choose a plan, set cadence, and let Lumina handle recurring delivery operations while keeping every batch traceable and fresh.',
    frequencies: ['Monthly', 'Biweekly', 'Weekly'],
    items: [
      {
        name: 'Home Ritual',
        price: '$24',
        cadence: 'per month',
        description: 'Fresh seasonal roasts for personal kitchens and small households.',
        features: ['1 bag every month', 'Seasonal tasting notes', 'Pause anytime'],
      },
      {
        name: 'Team Bar',
        price: '$89',
        cadence: 'per month',
        description: 'Predictable coffee supply for studios, offices, and client lounges.',
        features: ['4 bags every month', 'Blend preference controls', 'Priority support'],
        featured: true,
      },
      {
        name: 'Hospitality',
        price: 'Custom',
        cadence: 'volume plan',
        description: 'Wholesale roast programs for cafes, hotels, and event spaces.',
        features: ['Custom roast calendar', 'Training and equipment fit', 'Dedicated account lead'],
      },
    ],
  },
  features: {
    items: [
      {
        icon: 'calendar',
        title: 'Recurring Plans',
        description: 'Weekly, biweekly, and monthly roast schedules tuned to your usage.',
      },
      {
        icon: 'coffee',
        title: 'Roasted Fresh',
        description: 'Every shipment is roasted in small batches before it leaves our floor.',
      },
      {
        icon: 'package',
        title: 'Delivery Control',
        description: 'Pause, scale, or adjust blends as your team and foot traffic change.',
      },
      {
        icon: 'users',
        title: 'Concierge Support',
        description: 'Human help for onboarding, equipment fit, and seasonal roast changes.',
      },
    ],
  },
  gallery: {
    eyebrow: 'Aesthetics',
    title: 'The Lumina',
    accent: 'Experience',
    images: [
      {src: previousMedia.gallery[0], fallback: media.gallery[0], alt: 'Roasted coffee beans'},
      {src: previousMedia.gallery[1], fallback: media.gallery[1], alt: 'Minimal coffee bar interior'},
      {src: previousMedia.gallery[2], fallback: media.gallery[2], alt: 'Pour over coffee brewing'},
      {src: previousMedia.gallery[3], fallback: media.gallery[3], alt: 'Coffee cups prepared for tasting'},
    ],
  },
  reviews: {
    backdrop: previousMedia.reviewBackdrop,
    backdropFallback: media.reviewBackdrop,
    items: [
      {
        id: 1,
        name: 'Sarah Jenkins',
        role: 'Local Guide',
        text: "The Velvet Cappuccino is truly unmatched. The atmosphere provides the perfect sanctuary for deep work, and the baristas' attention to detail makes every morning visit feel special.",
      },
      {
        id: 2,
        name: 'Marcus Thorne',
        role: 'Coffee Enthusiast',
        text: "I've traveled across Europe, but Lumina's signature dark roast easily rivals the best cafes in Rome. The depth of flavor speaks volumes about their roasting process.",
      },
      {
        id: 3,
        name: 'Elena Rodriguez',
        role: 'Interior Designer',
        text: 'Not only is the coffee exceptional, but the minimalist dark aesthetic makes it my favorite sanctuary in the city. A true masterclass in brand and flavor.',
      },
    ],
  },
  contact: {
    eyebrow: 'Visit Us',
    title: "Let's have a",
    accent: 'conversation',
    address: '123 Artisan Coffee Way,\nMetro Sector 9, NY 10012',
    phone: '+1 (555) 123-4567',
    email: 'hello@luminacoffee.com',
    mapImage: previousMedia.map,
    mapFallback: media.map,
    directionsUrl: 'https://maps.google.com/?q=123%20Artisan%20Coffee%20Way%2C%20NY%2010012',
  },
  footer: {
    description:
      'Elevating the daily ritual of coffee drinking through ethically sourced, perfectly roasted beans. Join us in celebrating the art of coffee.',
    newsletterText: 'Subscribe for updates on seasonal beans and events.',
    socials: {
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/',
      x: 'https://x.com/',
    },
  },
};
