import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Modal from 'ballast/app/components/Modal';
import Button from 'ballast/app/components/Button';
import LinkButton from 'ballast/app/components/LinkButton';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

import { Images } from 'ballast/types/Image';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/EventService';

const HIDE_DURATION = 3000;

export default function Chapter({
  book,
  chapterNumber,
}: {
  book: string;
  chapterNumber: number;
  showSoundLines: boolean;
}) {
  const router = useRouter();

  const EventService = useRef<EventServiceInstance | null>(null);
  const [visible, show] = useState<boolean>(false);
  const [modalVisible, showModal] = useState<boolean>(false);
  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);
  const [images, setImages] = useState<Images>([]);

  // Check for Audio muted stored status
  useEffect(() => {
    const muted = sessionStorage.getItem('muted') === null ? true : false;
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

  // Import the images
  useEffect(() => {
    // IMAGES
    import(`ballast/data/books/${book}/images.json`)
      .then(
        ({
          default: images,
        }: {
          default: { chapter: number; images: Images }[];
        }) => {
          const results =
            images.find((data) => data.chapter === chapterNumber)?.images || [];
          setImages(results);
        }
      )
      .catch(() => {
        console.error('not found');
        // router.push('/404');
      });
  }, [book, chapterNumber, router]);

  /////////////
  // Handlers
  /////////////
  const buttonsBarClickHandler = () => openButtonsBar(!isButtonsBarOpen);
  const onExit = () => {
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
      {/* IMAGES */}
      <div className="flex-1 relative">
        {images.map((image) => (
          <Image
            key={image}
            className="relative"
            src={`/images/${book}/${chapterNumber}/${image}`}
            alt="Next.js Logo"
            width={10000}
            height={1}
            priority
          />
        ))}
        {/* UI */}
        <ButtonsBar
          top={4}
          right={4}
          width={10}
          book={book}
          audioMuted={audioMuted}
          muteAudioHandler={muteAudioHandler}
          isOpen={isButtonsBarOpen}
          onExit={onExit}
          clickHandler={buttonsBarClickHandler}
        />
        <LinkButton
          top={408}
          width={50}
          href={`/${book}/${chapterNumber + 1 > 3 ? 1 : chapterNumber + 1}`}
          text="Chapitre Suivant"
          onClick={onExit}
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
