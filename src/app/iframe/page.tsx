'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function Book({ params }: { params: { url: string } }) {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  if (!url) {
    return <h1>ERROR</h1>;
  }

  // TODO: reactiveness
  // const width = window.outerHeight < 800 ? 400 : 450;
  const width = 450;

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        position: 'relative',
        width: width,
        height: (width * 20) / 9.5,
        overflow: 'show',
      }}
    >
      <Image
        src="/images/phone.svg"
        alt="ballast"
        fill={true}
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          filter: 'brightness(100)',
        }}
      />
      <iframe
        style={{
          borderRadius: '50px',
          position: 'absolute',
          top: 5,
          left: 15,
          zIndex: 9,
        }}
        src={url}
        width="92%"
        height="99%"
      ></iframe>
    </div>
  );
}
