import { useContext, useEffect, useRef, useState } from 'react';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  ChapterSounds,
} from 'ballast/types/AudioService';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/EventService';

import SoundLines from 'ballast/app/components/SoundLines';

export default function SoundsClient({}: // sounds,
// muted,
// showSoundLines,
// activeSoundClient,
{
  // sounds: any;
  // muted: boolean;
  // showSoundLines: boolean;
  // activeSoundClient: (b: boolean) => void;
}) {
  const AudioService = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance | null>(null);
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);

  const dynamicSoundsImport = async (book: string) => {
    try {
      const data = (await import(`ballast/data/books/${book}/sounds.json`)) as {
        default: ChapterSounds;
      };
      return data.default;
    } catch (e) {
      console.error(`FILE NOT FOUND: ballast/data/books/${book}/sounds.json`);
      return null;
    }
  };

  // EVENTS
  useEffect(() => {
    console.log('🔊 creating Audio Service and initializing Audio Context');
    AudioService.current = AudioServiceBuilder();
    AudioService.current.startAudioContext(
      () => console.log('⏸️ suspended'),
      () => console.log('▶️ running')
    );

    EventService.current = EventServiceBuilder();
    EventService.current.listen<{
      book: string;
      chapter: string; // 🤔 why events convert number to string?
      showSoundLines: boolean;
    }>('page-params', async ({ book, chapter, showSoundLines }) => {
      const sounds = await dynamicSoundsImport(book);

      if (sounds) {
        const chapterNumber = parseInt(chapter, 10);

        // 1) List the sound to create
        const toCreate = sounds
          .filter(
            (row) =>
              row.chapter === chapterNumber || row.chapter === chapterNumber + 1
          )
          .map((row) => row.sounds)
          .reduce((all, sounds) => [...all, ...sounds], []);

        // 2) List the sound to free from memory
        const toDelete = sounds
          .filter(
            (row) =>
              row.chapter !== chapterNumber && row.chapter !== chapterNumber + 1
          )
          .map((row) => row.sounds)
          .reduce((all, sounds) => [...all, ...sounds], []);

        // console.log({toCreate, toDelete});

        AudioService.current?.createAudioResources(toCreate);
        AudioService.current?.removeAudioResources(toDelete);
        AudioService.current?.dumpAudioResources();
      }
    });
  }, []);

  return null;
  //     setTimeout(() => activateSoundLines(true), 500);
  //   };
  //   init();

  //   // on unmount
  //   return () => {
  //     AudioService.current?.stopAllAudioResources();
  //     AudioService.current?.removeAllAudioResources();
  //   };
  // }, [Audio, sounds, activateSoundLines, activeSoundClient]);

  // useEffect(() => {
  //   AudioService.current && AudioService.current.muteAllAudioResources(muted);
  // }, [Audio, muted]);

  // return (
  //   soundLinesActivated && (
  //     <>
  //       <SoundLines
  //         sounds={sounds}
  //         isVisible={showSoundLines}
  //         onEnter={(action: SoundAction, slug: string, kind: SoundKind) => {
  //           // console.log(
  //           //   `enter: ${
  //           //     action === 'play' ? 'play' : 'unmute'
  //           //   } the ${kind} ${slug}`
  //           // );
  //           if (action === 'play') {
  //             AudioService.current?.playAudioResource(slug);
  //           } else if (action === 'mute' && !muted) {
  //             AudioService.current?.muteAudioResource(slug, false);
  //           }
  //         }}
  //         onExit={(action: SoundAction, slug: string, kind: SoundKind) => {
  //           // console.log(
  //           //   `exit: ${action === 'play' ? 'stop' : 'mute'} the ${kind} ${slug}`
  //           // );
  //           if (action === 'play') {
  //             AudioService.current?.stopAudioResource(slug);
  //           } else if (action === 'mute' && !muted) {
  //             AudioService.current?.muteAudioResource(slug, true);
  //           }
  //         }}
  //       />
  //     </>
  //   )
  // );
}
