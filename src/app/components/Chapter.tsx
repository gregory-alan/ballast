import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

import Modal from 'ballast/app/components/Modal';
import Button from 'ballast/app/components/Button';
import LinkButton from 'ballast/app/components/LinkButton';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

const HIDE_DURATION = 100;

const Chunk = ({
  image,
  nextChapterPath,
  onNextChapter,
}: {
  image: string;
  nextChapterPath?: string;
  onNextChapter: () => void;
}) => {
  const EventService = useRef<EventServiceInstance | null>(null);
  const [fullyLoaded, setFullyLoaded] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);

  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.listen('sounds-loaded', () => setSoundsLoaded(true));
  }, []);

  useEffect(
    () => setFullyLoaded(imageLoaded && soundsLoaded),
    [imageLoaded, soundsLoaded]
  );

  return (
    <>
      {!fullyLoaded && (
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
        style={{ visibility: imageLoaded ? 'hidden' : 'visible' }}
        onLoadingComplete={() => {
          console.log('image loaded');
          setImageLoaded(true);
        }}
        src={image}
        alt="une image"
        width={10000}
        height={1}
        priority
      />
      {nextChapterPath && fullyLoaded && (
        <LinkButton
          text="Chapitre Suivant"
          href={nextChapterPath}
          onClick={onNextChapter}
          top={408}
          width={50}
        />
      )}
    </>
  );
};

export default function Chapter({
  chunks,
  bookPath,
  nextChapterPath,
}: {
  chunks: { image: string }[];
  bookPath: string;
  nextChapterPath?: string;
}) {
  const EventService = useRef<EventServiceInstance | null>(null);
  const [visible, show] = useState<boolean>(false);
  const [modalVisible, showModal] = useState<boolean>(false);
  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);

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

  // // Import the images
  // useEffect(() => {
  //   // IMAGES
  //   import(`ballast/data/books/${book}/images.json`)
  //     .then(
  //       ({
  //         default: images,
  //       }: {
  //         default: Images;
  //       }) => {
  //         const results =
  //           images.chapters.find(({ id }) => chapterNumber === id);
  //         setImages(results.);
  //       }
  //     )
  //     .catch(() => {
  //       console.error('not found');
  //       // router.push('/404');
  //     });
  // }, [book, chapterNumber, router]);

  /////////////
  // Handlers
  /////////////
  const buttonsBarClickHandler = () => openButtonsBar(!isButtonsBarOpen);
  const onNextChapter = () => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('activate-soundlines', {
      activate: false,
    });
    setTimeout(() => {
      EventService.current = EventServiceBuilder();
      EventService.current.trigger('activate-soundlines', {
        activate: true,
      });
    }, HIDE_DURATION + 1000);
  };

  const onExit = () => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('kill-audio', {});
  };

  const modalClickHandler = () => {
    EventService.current = EventServiceBuilder();
    EventService.current.trigger('activate-soundlines', {
      activate: true,
    });
    muteAudio(false);
    sessionStorage.setItem('muted', 'no');
    setTimeout(() => showModal(false), 200);
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
          <Chunk
            key={i}
            image={chunk.image}
            onNextChapter={onNextChapter}
            nextChapterPath={nextChapterPath}
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
