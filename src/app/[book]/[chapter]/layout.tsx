'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SoundClient from 'ballast/app/components/SoundClient';
import Cover from 'ballast/app/components/Cover';
import Splash from 'ballast/app/components/Splash';
import { Sounds } from 'ballast/types/AudioService';

export default function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { book: string; chapter: string };
}) {
  const book = params.book;
  const chapter = params.chapter;
  const [sounds, setSounds] = useState<Sounds>([]);
  const [pristine, setPristine] = useState<boolean | undefined>();

  const pristineChecker = () => {
    const pristine = sessionStorage.getItem('pristine') === null ? true : false;
    if (pristine) {
      sessionStorage.setItem('pristine', 'no');
    }
    return pristine;
  };

  useEffect(() => {
    const pristine = pristineChecker();
    setPristine(pristine);
  }, []);

  // DATA IMPORT
  useEffect(() => {
    // SOUNDS
    import(`ballast/data/books/${book}/${chapter}/sounds.json`)
      .then(({ default: sounds }: { default: any }) => {
        setSounds(sounds);
      })
      .catch(() => {
        // router.push('/404');
      });
  }, [book, chapter]);

  return (
    <>
      <Splash />
      {children}
    </>
  );

  /* <SoundClient
      sounds={sounds}
      muted={false}
      showSoundLines={true}
      activeSoundClient={() => console.log('ok')}
    /> */
}
