'use client';

import { useContext, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/EventService';

import Chapter from 'ballast/app/components/Chapter';

import { ReaderContext } from 'ballast/contexts/ReaderContext';

import Link from 'next/link';

export default function Reader({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const router = useRouter();
  const EventService = useRef<EventServiceInstance | null>(null);
  const { book, chapter } = useContext(ReaderContext);
  console.log('__page context', { book, chapter });

  const searchParams = useSearchParams();
  const showSoundLines = searchParams.get('soundlines') === 'true';

  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('page-params', {
      book: params.book,
      chapter: params.chapter,
      showSoundLines,
    });
  }, [params.book, params.chapter, showSoundLines]);

  return (
    <>
      {/* <Chapter
        book={book}
        chapterNumber={chapter}
        showSoundLines={showSoundLines}
      /> */}
      <Link href={`${((chapter + 1) % 3) + 1}`}>
        <button
          style={{
            position: 'absolute',
            zIndex: 100000,
            bottom: 0,
            left: 0,
            backgroundColor: 'pink',
            fontSize: '3em',
          }}
        >
          CHAPITRE
        </button>
      </Link>
    </>
  );
}
