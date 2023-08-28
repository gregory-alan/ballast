'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Modal from 'ballast/app/components/Modal';
import Button from 'ballast/app/components/Button';
import LinkButton from 'ballast/app/components/LinkButton';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

import { Sounds } from 'ballast/types/AudioService';
import { Images } from 'ballast/types/Image';

const Chapter = ({
  book,
  chapter,
  showSoundLines,
}: {
  book: string;
  chapter: string;
  showSoundLines: boolean;
}) => {
  const router = useRouter();

  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);
  const [sounds, setSounds] = useState<Sounds>([]);
  const [images, setImages] = useState<Images>([]);
  const [soundClientActive, activeSoundClient] = useState<boolean>(true);

  // DATA IMPORT
  useEffect(() => {
    // IMAGES
    import(`ballast/data/books/${book}/${chapter}/images.json`)
      .then(({ default: images }: { default: Images }) => setImages(images))
      .catch(() => {
        router.push('/404');
      });
    // SOUNDS
    import(`ballast/data/books/${book}/${chapter}/sounds.json`)
      .then(({ default: sounds }: { default: Sounds }) => {
        setSounds(sounds);
      })
      .catch(() => {
        router.push('/404');
      });
  }, [book, chapter, router]);

  /////////////
  // Handlers
  /////////////
  const buttonsBarClickHandler = () => openButtonsBar(!isButtonsBarOpen);
  const onExit = () => activeSoundClient(false);

  // const modalClickHandler = () => {
  //   activeSoundClient(true);
  //   muteAudio(false);
  //   setTimeout(() => toggleModalVisibility(false), 200);
  //   openButtonsBar(true);
  // };

  const muteAudioHandler = () => {
    if (!soundClientActive) {
      muteAudio(false);
      activeSoundClient(true);
      // toggleModalVisibility(false);
      return;
    }
    muteAudio(!audioMuted);
  };

  return (
    <main className="flex max-w-md">
      {/* IMAGES */}
      <div className="flex-1 relative">
        {images.map((image) => (
          <Image
            key={image.source}
            className="relative"
            src={`/images/${book}/${chapter}/${image.source}`}
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
          audioMuted={audioMuted}
          muteAudioHandler={muteAudioHandler}
          isOpen={isButtonsBarOpen}
          onExit={onExit}
          clickHandler={buttonsBarClickHandler}
        />
        <LinkButton
          top={408}
          width={50}
          href={`/${book}/chapter${chapter === '2' ? 1 : 2}`}
          text="Chapitre Suivant"
          onClick={onExit}
        />
      </div>
      {/* <Modal
            top={150}
            width={93}
            height={93 * (865 / 1086)}
            backgroundSource="modal.webp"
            isVisible={modalVisible}
          >
            <Suspense fallback={<></>}>
              <Button
                top={48}
                width={60}
                onClick={modalClickHandler}
                text="activer le son"
              />
            </Suspense>
          </Modal> */}
    </main>
  );
};

export default function Home({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const book = params.book;
  const chapter = params.chapter;
  const searchParams = useSearchParams();
  const showSoundLines = searchParams.get('soundlines') === 'true';

  return (
    <Chapter book={book} chapter={chapter} showSoundLines={showSoundLines} />
  );
}
