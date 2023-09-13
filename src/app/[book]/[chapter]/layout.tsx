'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// import SoundClient from 'ballast/app/components/SoundClient';
import Cover from 'ballast/app/components/Cover';
import Splash from 'ballast/app/components/Splash';
import { Sounds } from 'ballast/types/AudioService';
import { ReaderContext } from 'ballast/contexts/ReaderContext';

export default function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { book: string; chapter: string };
}) {
  const router = useRouter();
  const book = params.book;
  const chapter = parseInt(params.chapter, 10);
  const [sounds, setSounds] = useState<Sounds>([]);

  if (isNaN(chapter)) {
    router.push('/404');
  }

  console.log('__layout context', { book, chapter });


  // PRISTINE (NOT USED RIGHT NOW)
  // const [pristine, setPristine] = useState<boolean | undefined>();

  // const pristineChecker = () => {
  //   const pristine = sessionStorage.getItem('pristine') === null ? true : false;
  //   if (pristine) {
  //     sessionStorage.setItem('pristine', 'no');
  //   }
  //   return pristine;
  // };

  // useEffect(() => {
  //   const pristine = pristineChecker();
  //   setPristine(pristine);
  // }, []);

  // DATA IMPORT
  useEffect(() => {
    // SOUNDS
    import(`ballast/data/books/${book}/sounds.json`)
      .then(({ default: sounds }: { default: any }) => {
        console.log(sounds);
        setSounds(sounds);
      })
      .catch(() => {
        // router.push('/404');
      });
  }, [book]);

  return (
    <>
      <Splash />
      <ReaderContext.Provider value={{ chapter, book }}>
        {/* <SoundClient
          // sounds={sounds}
          // muted={false}
          // showSoundLines={false}
          // activeSoundClient={() => console.log('ok')}
        /> */}
        {children}
      </ReaderContext.Provider>
    </>
  );
}
