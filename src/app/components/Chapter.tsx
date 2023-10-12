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

const LoadingTrigger = ({
  EventService,
  chunkId,
}: {
  EventService: EventServiceInstance;
  chunkId: string;
}) => {
  const [hasTriggeredOnce, setTriggering] = useState<boolean>(false);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const debounced = useDebouncedCallback((inView: boolean) => {
    if (inView) {
      if (!hasTriggeredOnce) {
        EventService.trigger('chunk-end', { chunkId });
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
        backgroundColor: 'steelblue',
      }}
    ></div>
  );
};

const Chunk = ({
  endLink,
  id,
  image,
  onNextChapter,
  soundLinesVisible,
  sounds,
}: {
  endLink?: string;
  id: string;
  image: string;
  onNextChapter: () => void;
  soundLinesVisible: boolean;
  sounds: Sound[];
}) => {
  const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  const EventService = useRef<EventServiceInstance>(EventServiceBuilder());

  useEffect(() => {
    EventService.current.listen<{ chunkId: string }>(
      'sounds-loaded',
      ({ chunkId }) => {
        if (chunkId === id) {
          setSoundsLoaded(true);
        }
      }
    );
  }, [id]);

  useEffect(
    () => setFullyLoaded(imageLoaded && soundsLoaded),
    [imageLoaded, soundsLoaded]
  );

  return (
    <div style={{ position: 'relative' }}>
      {!imageLoaded && (
        <Image
          className="relative"
          src={`/images/loading.svg`}
          alt="Chargement"
          width={200}
          height={1}
        />
      )}
      <Image
        key={image}
        className="relative"
        style={{ visibility: fullyLoaded ? 'visible' : 'hidden' }}
        onLoadingComplete={() => {
          setImageLoaded(true);
          EventService.current = EventServiceBuilder();
          EventService.current?.trigger('image-loaded', { image, chunkId: id });
        }}
        src={image}
        alt="une image"
        width={10000}
        height={1}
        priority
      />
      <LoadingTrigger EventService={EventService.current} chunkId={id} />
      {endLink && fullyLoaded && (
        <LinkButton
          text="Chapitre Suivant"
          href={endLink}
          onClick={onNextChapter}
          bottom={30}
          width={50}
        />
      )}
      {fullyLoaded && soundLinesVisible && (
        <SoundLines
          sounds={flatten(sounds)}
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

export default function Chapter({ bookPath }: { bookPath: string }) {
  const EventService = useRef<EventServiceInstance>(EventServiceBuilder());
  const [chunks, setChunks] = useState<
    { chunkId: string; image: string; sounds: Sound[], endLink?: string }[]
  >([]);
  const [visible, show] = useState<boolean>(false);
  const [modalVisible, showModal] = useState<boolean>(false);
  const [soundLinesVisible, showSoundLines] = useState<boolean>(false);
  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);

  useEffect(() => {
    EventService.current.listen<{
      chunkId: string;
      image: string;
      sounds: Sound[];
      endLink?: string;
    }>('new-chunk', ({ image, chunkId, sounds, endLink }) => {
      setChunks((chunks) => [...chunks, { chunkId, image, sounds, endLink }]);
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
    EventService.current = EventServiceBuilder();
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
    EventService.current = EventServiceBuilder();
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
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('start-audiocontext', {
      activate: false,
    });
    setTimeout(() => {
      EventService.current = EventServiceBuilder();
      EventService.current.trigger('start-audiocontext', {
        activate: true,
      });
    }, HIDE_DURATION + 1000);
  };

  const onExit = () => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('kill-audio');
  };

  const modalClickHandler = () => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('start-audiocontext');
    muteAudio(false);
    sessionStorage.setItem('muted', 'no');
    setTimeout(() => showModal(false), 200);
    showSoundLines(true);
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
        {chunks.map(({ image, sounds, chunkId, endLink }, i) => (
          <Chunk
            key={i}
            id={chunkId}
            image={image}
            sounds={sounds}
            onNextChapter={onNextChapter}
            endLink={endLink}
            soundLinesVisible={soundLinesVisible}
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
