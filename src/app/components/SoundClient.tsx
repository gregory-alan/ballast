import { useEffect, useRef, useState } from 'react';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  AudioResourceViewStatus,
  ChapterSounds,
  SoundAction,
  SoundKind,
  Sounds,
} from 'ballast/types/AudioService';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/EventService';

import SoundLines from 'ballast/app/components/SoundLines';

export default function SoundsClient() {
  const [sounds, setSounds] = useState<Sounds>([]);
  const AudioService = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance | null>(null);
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);
  const [isAudioMuted, muteAudio] = useState<boolean>(false);

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
    AudioService.current = AudioServiceBuilder();

    EventService.current = EventServiceBuilder();
    EventService.current.listen<{
      book: string;
      chapter: string; // 🤔 why events convert number to string?
      showSoundLines: boolean;
    }>('page-params', async ({ book, chapter, showSoundLines }) => {
      // 1) Check if audio context is running
      AudioService.current?.startAudioContext(
        () => {
          EventService.current?.trigger('audiocontext-status', {
            running: false,
          });
        },
        () => {
          EventService.current?.trigger('audiocontext-status', {
            running: true,
          });
        }
      );

      // 2) Import sounds
      const sounds = await dynamicSoundsImport(book);
      if (sounds) {
        const chapterNumber = parseInt(chapter, 10);

        // 1) List the sound to create
        const toCreate = sounds
          .filter(
            (s) =>
              s.chapter === chapterNumber || s.chapter === chapterNumber + 1
          )
          .map((s) => s.sounds)
          .reduce((all, sounds) => [...all, ...sounds], []);

        // 2) List the sound to free from memory
        const toDelete = sounds
          .filter(
            (s) =>
              s.chapter !== chapterNumber && s.chapter !== chapterNumber + 1
          )
          .map((s) => s.sounds)
          .reduce((all, sounds) => [...all, ...sounds], []);

        AudioService.current?.createAudioResources(toCreate, book);
        AudioService.current?.removeAudioResources(toDelete);

        // 3) Set sounds for displaying in Soundlines
        setSounds(
          sounds
            .filter((s) => s.chapter === chapterNumber)
            .map((s) => s.sounds)
            .reduce((all, sounds) => [...all, ...sounds], [])
        );
      }
    });

    EventService.current.listen<{ activate: boolean }>(
      'activate-soundlines',
      ({ activate }) => activateSoundLines(activate)
    );

    EventService.current.listen<{ muted: boolean }>(
      'mute-audio',
      ({ muted }) => {
        AudioService.current &&
          AudioService.current.muteAllAudioResources(muted);
        muteAudio(muted);
      }
    );

    return () => {
      AudioService.current?.stopAllAudioResources();
      AudioService.current?.removeAllAudioResources();
    };
  }, []);

  return (
    soundLinesActivated && (
      <>
        <SoundLines
          sounds={sounds}
          isVisible={true}
          onClick={(slug) => AudioService.current?.debugAudioResource(slug)}
          onEnter={(action: SoundAction, slug: string, kind: SoundKind) => {
            console.log(
              `🌕 %center %c${slug} %c(${kind}) %c→ %c${
                action === 'play' ? 'PLAY ⏯️' : 'UNMUTE 🔔'
              }`,
              'color: cyan; font-weight: bold',
              'color: white',
              'color: white; font-style: italic',
              'color: white',
              'color: white; font-weight: bold'
            );

            if (action === 'play') {
              if (kind === 'toneplayer') {
                AudioService.current?.setAudioResourceViewStatus(
                  slug,
                  AudioResourceViewStatus.PARTIALLY_IN_VIEW
                );
              } else {
                AudioService.current?.setAudioResourceViewStatus(
                  slug,
                  AudioResourceViewStatus.IN_VIEW
                );
              }
              AudioService.current?.playAudioResource(slug);
            } else if (action === 'mute' && !isAudioMuted) {
              if (kind === 'toneplayer') {
                AudioService.current?.setAudioResourceViewStatus(
                  slug,
                  AudioResourceViewStatus.IN_VIEW
                );
              }
              AudioService.current?.muteAudioResource(slug, false);
            }
          }}
          onExit={(action: SoundAction, slug: string, kind: SoundKind) => {
            console.log(
              `🌑 %cexit %c${slug} %c(${kind}) %c→ %c${
                action === 'play' ? 'STOP ⏹️' : 'MUTE 🔕'
              }`,
              'color: steelblue',
              'color: white',
              'color: white; font-style: italic',
              'color: white',
              'color: white; font-weight: bold'
            );

            if (action === 'play') {
              AudioService.current?.setAudioResourceViewStatus(
                slug,
                AudioResourceViewStatus.OUT_OF_VIEW
              );
              AudioService.current?.stopAudioResource(slug);
            } else if (action === 'mute' && !isAudioMuted) {
              if (kind === 'toneplayer') {
                AudioService.current?.setAudioResourceViewStatus(
                  slug,
                  AudioResourceViewStatus.PARTIALLY_IN_VIEW
                );
              }
              AudioService.current?.muteAudioResource(slug, true);
            }
          }}
        />
      </>
    )
  );
}
