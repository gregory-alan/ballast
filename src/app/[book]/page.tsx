'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Cover from 'ballast/app/components/Cover';
import ChapterSquare from 'ballast/app/components/ChapterSquare';
import Splash from 'ballast/app/components/Splash';
import { Sounds } from 'ballast/types/AudioService';
import Link from 'next/link';

type ChapterInfo = { title: string; number: number; slug: string };

export default function Book({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const book = params.book;
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);

  // DATA IMPORT
  useEffect(() => {
    // SOUNDS
    import(`ballast/data/books/${book}/infos.json`)
      .then(({ default: infos }: { default: any }) => {
        setChapters(infos.chapters);
      })
      .catch(() => {
        // router.push('/404');
      });
  }, [book]);

  return (
    <>
      <Cover book={book} />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          display: 'grid',
          gridGap: '3px',
          width: '100vw',
          gridTemplateColumns: '1fr 1fr 1fr',
          zIndex: 1002,
        }}
      >
        {chapters.map((chapter, i) => (
          <Link key={i} href={`/${book}/${chapter.slug}`}>
            <ChapterSquare
              book={book}
              chapter={{
                ...chapter,
                vignette: `/images/${book}/${chapter.slug}/vignette.webp`,
              }}
            />
          </Link>
        ))}
      </div>
    </>
  );
}
