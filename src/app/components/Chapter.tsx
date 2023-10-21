import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import { useInView } from 'react-intersection-observer';
import { useDebouncedCallback } from 'use-debounce';

import Modal from 'ballast/app/components/Modal';
import Button from 'ballast/app/components/Button';
import LinkButton from 'ballast/app/components/LinkButton';
import ButtonsBar from 'ballast/app/components/ButtonsBar';
import SoundLines from 'ballast/app/components/SoundLines';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';
import { Sound, SoundAction } from 'ballast/types/services/Audio';
import flatten from 'lodash.flatten';
import { Chunk, LoadingStatus } from 'ballast/types/data/Chunks';

const HIDE_DURATION = 100;

const debug = ({ slug, action }: { slug: string; action: number }) => {
  const actions = [
    'HOWL_IN',
    'HOWL_OUT',
    'TONEPLAYER_GHOST_IN',
    'TONEPLAYER_IN',
    'TONEPLAYER_OUT',
    'TONEPLAYER_GHOST_OUT',
  ];
  const actionLabel = actions[action];
  console.log(
    `[${
      actionLabel.indexOf('_IN') !== -1 ? '🌕' : '🌑'
    } %c${actionLabel}%c] ${slug}`,
    'color: cyan; font-weight: bold',
    'color: white; font-weight: bold'
  );
};

/**
 * 📦 Invisible Loading Trigger (at the end of each Chunk)
 */
const LoadingTrigger = ({
  EventService,
  chunk,
}: {
  EventService: EventServiceInstance;
  chunk: Chunk;
}) => {
  const [hasTriggeredOnce, setTriggering] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const debounced = useDebouncedCallback((inView: boolean) => {
    if (inView) {
      if (!hasTriggeredOnce) {
        EventService.trigger('chunk-end', {
          chunkId: chunk.id,
          next: chunk.next,
        });
        setTriggering(true);
      }
    }
  }, 100);

  // intersection observable effect
  useEffect(() => {
    debounced(inView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        width: '100%',
        height: '5vh',
        bottom: '0',
        zIndex: 100,
        backgroundColor: 'transparent',
      }}
    ></div>
  );
};

/**
 * 📦 Chapter's Chunk containing Image and SoundLines (+ loading, links etc.)
 */
const ChapterChunk = ({
  currentChapter,
  onNextChapter,
  chunk,
}: {
  currentChapter: number;
  chunk: Chunk;
  onNextChapter: () => void;
}) => {
  const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(
    chunk.loadingStatus.sounds === LoadingStatus.LOADED
  );
  const EventService = useRef<EventServiceInstance>(
    EventServiceBuilder(`ChapterChunk ${chunk.id}`)
  );
  const hideChunk = parseInt(chunk.id.split('.')[0], 10) !== currentChapter;

  useEffect(() => {
    EventService.current.listen<{ chunkId: string }>(
      'sounds-loaded',
      ({ chunkId }) => {
        if (chunkId === chunk.id) {
          setSoundsLoaded(true);
        }
      }
    );
  }, [chunk.id]);

  useEffect(
    () => setFullyLoaded(imageLoaded && soundsLoaded),
    [imageLoaded, soundsLoaded]
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Image visible only when fully loaded (i.e image + sounds) */}
      <Image
        key={chunk.image}
        className="relative"
        style={{
          visibility: fullyLoaded ? 'visible' : 'hidden',
          display: hideChunk ? 'none' : 'block',
        }}
        onLoadingComplete={() => {
          setImageLoaded(true);
          EventService.current.trigger('image-loaded', {
            image: chunk.image,
            chunkId: chunk.id,
          });
        }}
        src={chunk.image}
        alt="une image"
        width={10000}
        height={1}
        priority
      />
      {/* Loader, visible till everything is loaded */}
      {!hideChunk && !fullyLoaded && (
        <Image
          className="relative"
          src={`/images/loading.svg`}
          alt="Chargement"
          width={200}
          height={1}
        />
      )}
      {/* New chunk loading trigger */}
      {!hideChunk && (
        <LoadingTrigger EventService={EventService.current} chunk={chunk} />
      )}
      {/* Next Chapter button */}
      {!hideChunk && chunk.endLink && fullyLoaded && (
        <LinkButton
          text="Chapitre Suivant"
          href={chunk.endLink}
          onClick={onNextChapter}
          bottom={30}
          width={50}
        />
      )}
      {/* Soundlines */}
      {!hideChunk && fullyLoaded && (
        <SoundLines
          sounds={flatten(chunk.sounds)}
          isVisible={true}
          onClick={() => console.log('click')}
          onEnter={(action: SoundAction, slug: string) => {
            debug({ slug, action });
            EventService.current.trigger('soundline-enter', { action, slug });
          }}
          onExit={(action: SoundAction, slug: string) => {
            debug({ slug, action });
            EventService.current.trigger('soundline-exit', { action, slug });
          }}
        />
      )}
    </div>
  );
};

/**
 * 📦 Chapter
 */
export default function Chapter({
  bookPath,
  chapter,
}: {
  bookPath: string;
  chapter: number;
}) {
  const EventService = useRef<EventServiceInstance>(
    EventServiceBuilder('Chapter')
  );
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [visible, show] = useState<boolean>(false);
  const [modalVisible, showModal] = useState<boolean>(false);
  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);

  useEffect(() => {
    EventService.current.listen<{
      newChunk: Chunk;
    }>('new-chunk', ({ newChunk }) => {
      setChunks((chunks) => [...chunks, newChunk]);
    });
  }, []);

  // Check for Audio muted stored status
  useEffect(() => {
    const muted = sessionStorage.getItem('muted') === 'yes' ? true : false;
    muteAudio(muted);
  }, []);

  // Show the Chapter (hidden for a fake background loading transition)
  useEffect(() => {
    setTimeout(() => show(true), HIDE_DURATION);
  }, []);

  // Check audio context and show modal accordingly
  useEffect(() => {
    EventService.current.listen<{ running: boolean }>(
      'audiocontext-status',
      ({ running }) => {
        showModal(!running);
        if (!running) {
          sessionStorage.setItem('muted', 'yes');
          muteAudio(true);
        }
      }
    );
  }, []);

  // Mute / Unmute Audio
  useEffect(() => {
    if (!audioMuted && modalVisible) {
      modalClickHandler();
    }
    EventService.current.trigger('mute-audio', {
      muted: audioMuted,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioMuted]);

  /////////////
  // Handlers
  /////////////
  const buttonsBarClickHandler = () => openButtonsBar(!isButtonsBarOpen);
  const onNextChapter = () => {
    EventService.current.trigger('start-audiocontext', {
      activate: false,
    });
    setTimeout(() => {
      EventService.current.trigger('start-audiocontext', {
        activate: true,
      });
    }, HIDE_DURATION + 1000);
  };

  const onExit = () => {
    EventService.current.trigger('kill-audio');
  };

  const modalClickHandler = () => {
    EventService.current.trigger('start-audiocontext');
    muteAudio(false);
    sessionStorage.setItem('muted', 'no');
    setTimeout(() => showModal(false), 200);
    // showSoundLines(true);
    openButtonsBar(true);
  };

  const muteAudioHandler = () => {
    const muted = !audioMuted;
    sessionStorage.setItem('muted', muted ? 'yes' : 'no');
    muteAudio(muted);
  };

  return (
    <main
      className="flex max-w-md"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s linear',
      }}
    >
      <div className="flex-1 relative">
        {/* CHUNKS */}
        {chunks.map((chunk, i) => (
          <ChapterChunk
            key={i}
            currentChapter={chapter}
            chunk={chunk}
            onNextChapter={onNextChapter}
          />
        ))}
        {/* UI */}
        <ButtonsBar
          top={4}
          right={4}
          width={10}
          bookPath={bookPath}
          audioMuted={audioMuted}
          muteAudioHandler={muteAudioHandler}
          isOpen={isButtonsBarOpen}
          onExit={onExit}
          clickHandler={buttonsBarClickHandler}
        />
      </div>
      <div
        className="absolute top-0 left-0 w-full h-full flex justify-center align-center"
        style={{ zIndex: 1500 }}
      >
        {modalVisible && (
          <Modal
            top={40}
            width={93}
            height={93 * (752 / 1090)}
            backgroundSource="modal.webp"
            isVisible={true}
          >
            <Button
              top={46}
              width={60}
              onClick={modalClickHandler}
              text="Activer le son"
            />
          </Modal>
        )}
      </div>
    </main>
  );
}
