import {createContext, useContext, type ReactNode} from 'react';
import {defaultSiteContent, type SiteContent} from './siteContent';

const SiteContentContext = createContext<SiteContent>(defaultSiteContent);

type SiteContentProviderProps = {
  children: ReactNode;
  content: SiteContent;
};

export function SiteContentProvider({children, content}: SiteContentProviderProps) {
  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
