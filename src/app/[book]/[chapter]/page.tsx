'use client';

import { useContext, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import Chapter from 'ballast/app/components/Chapter';

import { ReaderContext } from 'ballast/contexts/ReaderContext';

export default function Reader({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const EventService = useRef<EventServiceInstance | null>(null);
  let { book, chapter } = useContext(ReaderContext);

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
      <Chapter
        bookPath={`/${book}`}
        nextChapterPath={`/${book}/${chapter + 1}`} // TEMP
        chunks={[{ image: `/images/${book}/${chapter}/main.webp` }]} // TEMP
      />
    </>
  );
}
