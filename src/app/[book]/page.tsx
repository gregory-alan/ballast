'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Cover from 'ballast/app/components/Cover';
import ChapterSquare from 'ballast/app/components/ChapterSquare';
import ChapterLarge from 'ballast/app/components/ChapterLarge';
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
  const [largeChapter, setLargeChapter] = useState<ChapterInfo>();

  // DATA IMPORT
  useEffect(() => {
    // SOUNDS
    import(`ballast/data/books/${book}/infos.json`)
      .then(({ default: infos }: { default: { chapters: ChapterInfo[] } }) => {
        const chapters = infos.chapters.splice(0, infos.chapters.length);
        if ((infos.chapters.length + 1) % 2 === 1) {
          setLargeChapter(chapters.pop());
        }
        setChapters(chapters);
      })
      .catch(() => {
        // router.push('/404');
      });
  }, [book]);

  return (
    <main className="flex max-w-md relative flex-col">
      <Cover book={book} />
      <div
        style={{
          position: 'relative',
          bottom: 0,
          display: 'grid',
          width: '100%',
          gridTemplateColumns: '1fr 1fr',
          zIndex: 1002,
        }}
      >
        {chapters.map((chapter, i) => (
          <Link key={i} href={`/${book}/${chapter.slug}`}>
            <ChapterSquare
              chapter={{
                ...chapter,
                vignette: `/images/${book}/${chapter.slug}/vignette.webp`,
              }}
            />
          </Link>
        ))}
      </div>
      {largeChapter && (
          <ChapterLarge
            chapter={{
              ...largeChapter,
              vignette: `/images/${book}/${largeChapter.slug}/vignette.webp`,
            }}
          />
        )}
    </main>
  );
}
