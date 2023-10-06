'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Loading({ isVisible }: { isVisible: boolean }) {
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    setContainerHeight(window.innerHeight);
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#131314',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
        visibility: containerHeight ? 'visible' : 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms',
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        zIndex: isVisible ? 1000 : 0,
        width: '100%',
        height: containerHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Image
        className="relative"
        src={`/images/logo-with-catchphrase.svg`}
        alt="Ballast (logo)"
        width={200}
        height={1}
        style={{ marginTop: '-30px' }}
        priority
      />
      <Image
        className="relative"
        src={`/images/loading.svg`}
        alt="Chargement"
        style={{ marginTop: '30px' }}
        width={200}
        height={1}
      />
    </div>
  );
}
