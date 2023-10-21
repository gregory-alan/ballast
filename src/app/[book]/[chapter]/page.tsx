'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import Chapter from 'ballast/app/components/Chapter';
import Loading from 'ballast/app/components/Loading';

import { ReaderContext } from 'ballast/contexts/ReaderContext';

export default function Reader() {
  const [isFirstChunkLoaded, setFirstChunkLoaded] = useState<boolean>(true);
  const EventService = useRef<EventServiceInstance>(EventServiceBuilder('Page'));
  let { book, chapter } = useContext(ReaderContext);

  const searchParams = useSearchParams();
  const showSoundLines = searchParams.get('soundlines') === 'true';

  useEffect(() => {
    EventService.current.trigger('page-params', {
      book,
      chapter,
      showSoundLines,
    });
  }, [book, chapter, showSoundLines]);

  return (
    <>
      {/* <Loading isVisible={!isFirstChunkLoaded} />
      {isFirstChunkLoaded && ( */}
        <Chapter bookPath={`/${book}`} chapter={chapter} />
      {/* )} */}
    </>
  );
}
