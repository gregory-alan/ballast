'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import Chapter from 'ballast/app/components/Chapter';
import Loading from 'ballast/app/components/Loading';

import { ReaderContext } from 'ballast/contexts/ReaderContext';
import { config } from 'ballast/config';

const SPLASH_DURATION = config.splashDuration;

export default function Reader() {
  const [splashShown, showSplash] = useState<boolean>(true);
  const EventService = useRef<EventServiceInstance>(
    EventServiceBuilder('Page')
  );
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

  useEffect(() => {
    setTimeout(() => showSplash(false), SPLASH_DURATION);
  }, []);

  return (
    <>
      <Loading isVisible={splashShown} />
      <Chapter
        bookPath={`/${book}`}
        chapter={chapter}
        isVisible={!splashShown}
      />
    </>
  );
}
