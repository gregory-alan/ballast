'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

type ChapterInfo = { title: string; number: number; slug: string };

export default function Book({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const book = params.book;
  const [buttonsBarShown, toggleButtonsBar] = useState<boolean>(true);

  return (
    <main className="flex max-w-md relative flex-col">
      <ButtonsBar
        top={4}
        right={5}
        width={10}
        bookPath={book} // TODO
        audioMuted={false}
        muteAudioHandler={() => {}}
        isOpen={buttonsBarShown}
        onExit={() => {}}
        clickHandler={() => toggleButtonsBar(!buttonsBarShown)}
        hide={{ sound: true, book: true }}
      />

      <Image
        className="relative"
        src={`/images/HOME.webp`}
        alt="main"
        width={10000}
        height={1}
        priority
      />
    </main>
  );
}
