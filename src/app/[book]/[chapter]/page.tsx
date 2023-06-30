'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import Ink from 'react-ink';

import SoundClient from 'ballast/app/components/SoundClient';

import Modal from 'ballast/app/components/Modal';
import Button from 'ballast/app/components/Button';
import LinkButton from 'ballast/app/components/LinkButton';
import ButtonsBar from 'ballast/app/components/ButtonsBar';

import { Sounds } from 'ballast/types/AudioService';

export default function Home({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const [audioContextActive, activeAudioContext] = useState<boolean>(false);
  const [audioMuted, muteAudio] = useState<boolean>(true);
  const [isButtonsBarOpen, openButtonsBar] = useState<boolean>(false);
  const [modalVisible, toggleModalVisibility] = useState<boolean>(true);
  const [sounds, setSounds] = useState<Sounds>([]);
  const book = params.book;
  const chapter = params.chapter;

  useEffect(() => {
    import(`ballast/data/books/${book}/${chapter}/sounds.json`).then(
      ({ default: sounds }: { default: Sounds }) => {
        setSounds(sounds);
      }
    );
  }, [book, chapter]);

  /////////////
  // Handlers
  /////////////
  const buttonsBarClickHandler = () => openButtonsBar(!isButtonsBarOpen);
  const onExit = () => {
    console.log('audioContext', false);
    activeAudioContext(false);
  };

  const modalClickHandler = () => {
    activeAudioContext(true);
    muteAudio(false);
    setTimeout(() => toggleModalVisibility(false), 200);
    openButtonsBar(true);
  };

  const muteAudioHandler = () => {
    if (!audioContextActive) {
      muteAudio(false);
      activeAudioContext(true);
      toggleModalVisibility(false);
      return;
    }
    muteAudio(!audioMuted);
  };

  return (
    <main className="flex max-w-md">
      <div className="flex-1 relative">
        <Image
          className="relative"
          src="/images/wip.webp"
          alt="Next.js Logo"
          width={10000}
          height={1}
          priority
        />
        <Image
          className="relative"
          src="/images/wip2.webp"
          alt="Next.js Logo"
          width={10000}
          height={1}
          priority
        />
        <Image
          className="relative"
          src="/images/wip.webp"
          alt="Next.js Logo"
          width={10000}
          height={1}
          priority
        />
        <Modal
          top={150}
          width={93}
          height={90 * 0.73}
          backgroundSource="modal.webp"
          isVisible={modalVisible}
        >
          <Suspense fallback={<></>}>
            <Button
              top={38}
              width={50}
              onClick={modalClickHandler}
              text="activer le son"
            />
          </Suspense>
        </Modal>
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
          href="/"
          text="Chapitre 2"
          onClick={onExit}
        />
        {audioContextActive && (
          <SoundClient sounds={sounds} muted={audioMuted} />
        )}
      </div>
    </main>
  );
}
