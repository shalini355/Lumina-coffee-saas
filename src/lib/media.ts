import type {SyntheticEvent} from 'react';

export const media = {
  hero: '/assets/hero-coffee.svg',
  about: '/assets/about-roastery.svg',
  signature: '/assets/signature.svg',
  texture: '/assets/coffee-texture.svg',
  reviewBackdrop: '/assets/review-backdrop.svg',
  map: '/assets/map-location.svg',
  menu: {
    espresso: '/assets/menu-espresso.svg',
    cappuccino: '/assets/menu-cappuccino.svg',
    latte: '/assets/menu-latte.svg',
    mocha: '/assets/menu-mocha.svg',
    coldBrew: '/assets/menu-cold-brew.svg',
  },
  gallery: [
    '/assets/gallery-beans.svg',
    '/assets/gallery-cafe.svg',
    '/assets/gallery-pour.svg',
    '/assets/gallery-cups.svg',
  ],
} as const;

export const previousMedia = {
  hero: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000',
  about: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800',
  signature:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tux_Paint_johnny_automatic_signature.svg/512px-Tux_Paint_johnny_automatic_signature.svg.png',
  texture: 'https://www.transparenttextures.com/patterns/cubes.png',
  reviewBackdrop:
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=2000',
  map: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800',
  menu: {
    espresso:
      'https://images.unsplash.com/photo-1510007886470-b7449261fc4c?auto=format&fit=crop&q=80&w=600',
    cappuccino:
      'https://images.unsplash.com/photo-1572442388796-11668a67ef84?auto=format&fit=crop&q=80&w=600',
    latte:
      'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=600',
    mocha:
      'https://images.unsplash.com/photo-1578314675249-a6910e80a492?auto=format&fit=crop&q=80&w=600',
    coldBrew:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600',
  },
  gallery: [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
  ],
} as const;

export function useFallbackImage(
  event: SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string,
) {
  const image = event.currentTarget;
  if (image.src.endsWith(fallbackSrc)) {
    return;
  }

  image.src = fallbackSrc;
}
