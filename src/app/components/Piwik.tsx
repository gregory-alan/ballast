'use client';

import PiwikProProvider from '@piwikpro/next-piwik-pro';

export default function Piwik({ children }: { children: React.ReactNode }) {
  return <PiwikProProvider
    containerId="85a07859-3f95-4e21-9b88-03df53734797"
    containerUrl="https://ballast.containers.piwik.pro"
  >
    {children}
  </PiwikProProvider>;
}
