import { useEffect, useState } from 'react';
import Image from 'next/image';

import LinkButton from 'ballast/app/components/LinkButton';

const LOGO_SHOWN_DURATION = 2000;

const Cover = ({ book, chapter }: { book: string; chapter: string }) => {
  const [logoShown, showLogo] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => showLogo(false), LOGO_SHOWN_DURATION);
  }, []);

  return (
    <>
      <div
        className="absolute top-0 left-0 flex flex-col justify-center items-center w-full h-full"
        style={{
          opacity: logoShown ? 0 : 1,
          transition: 'opacity 0.5s linear',
          width: '100vw',
        }}
      >
        <Image
          className="absolute top-0 left-0"
          src={`/images/${book}/cover.webp`}
          alt="Ballast (logo)"
          width={10000}
          height={1}
          onLoadingComplete={() => {}}
          priority
        />
        <LinkButton
          bottom={0}
          width={50}
          href={`/${book}/chapter${chapter === 'chapter2' ? 1 : 2}`}
          text={`Lire le ${chapter}`}
          onClick={() => {}}
        />
      </div>
    </>
  );
};

export default Cover;
