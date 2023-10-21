'use client';

import { useEffect, useState } from 'react';
import Cover from 'ballast/app/components/Cover';
import ChapterSquare from 'ballast/app/components/ChapterSquare';
import Link from 'next/link';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

type ChapterInfo = { title: string; number: number; slug: string };

export default function Book({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const book = params.book;
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [buttonsBarShown, toggleButtonsBar] = useState<boolean>(true);

  // DATA IMPORT
  useEffect(() => {
    // CHAPTERS
    import(`ballast/data/books/${book}/infos.json`)
      .then(({ default: infos }: { default: { chapters: ChapterInfo[] } }) => {
        setChapters(infos.chapters);
      })
      .catch(() => {
        console.error('oups');
      });
  }, [book]);

  return (
    <main className="flex max-w-md relative flex-col">
      <ButtonsBar
        top={4}
        right={4}
        width={10}
        bookPath={book} // TODO
        audioMuted={false}
        muteAudioHandler={() => {}}
        isOpen={buttonsBarShown}
        onExit={() => {}}
        clickHandler={() => toggleButtonsBar(!buttonsBarShown)}
        hide={{ sound: true, book: true }}
      />
      <Cover book={book} />
      <div
        style={{
          position: 'absolute',
          bottom: '12vh',
          display: 'grid',
          width: '80%',
          marginLeft: '10%',
          rowGap: '5px',
          columnGap: '5px',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          zIndex: 1002,
        }}
      >
        {chapters.map((chapter, i) => (
          <Link key={i} href={`/${book}/${chapter.number}`}>
            <ChapterSquare
              chapter={{
                ...chapter,
                vignette: `/images/${book}/${chapter.number}/vignette.webp`,
              }}
              invert={i % 2 === 0}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
