import { useEffect, useRef, useState } from 'react';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  ChapterSounds,
  SoundAction,
  Sounds,
} from 'ballast/types/AudioService';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/EventService';

import SoundLines from 'ballast/app/components/SoundLines';
import { isMobile } from 'ballast/utils/isMobile';

const SAFE_SOUNDLINES_ACTIVATION = 500;

export default function SoundsClient() {
  const [sounds, setSounds] = useState<Sounds>([]);
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
      ({ activate }) => {
        if (activate) {
          AudioService.current?.startAudioContext(
            () => setTimeout(() => activateSoundLines(activate), SAFE_SOUNDLINES_ACTIVATION),
            () => console.warn('context coudnt be activated')
          );
        }
        activateSoundLines(activate);
      }
    );

    EventService.current.listen<{ muted: boolean }>('mute-audio', ({ muted }) =>
      AudioService.current?.globalMuteResources(muted)
    );

    // TODO: better out of focus handling, but so far, we simply reload the page which will do the trick
    // check https://github.com/serkanyersen/ifvisible.js/
    // window.onfocus = () => alert('focus');
    if (isMobile()) {
      // window.onblur = () => window.location.reload();
    }

    return () => {
      AudioService.current?.stopAllAudioResources();
      AudioService.current?.removeAllAudioResources();
    };
  }, []);

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

  return (
    soundLinesActivated && (
      <>
        <SoundLines
          sounds={sounds}
          isVisible={true}
          onClick={(slug) => AudioService.current?.debugAudioResource(slug)}
          onEnter={(action: SoundAction, slug: string) => {
            debug({ slug, action });
            switch (action) {
              case SoundAction.HOWL_IN:
                AudioService.current?.setAudioResourceViewState(slug, true);
                AudioService.current?.muteAudioResource(slug, false);
                AudioService.current?.playAudioResource(slug);
                break;
              case SoundAction.TONEPLAYER_GHOST_IN:
                AudioService.current?.setAudioResourceViewState(slug, false);
                AudioService.current?.playAudioResource(slug);
                break;
              case SoundAction.TONEPLAYER_IN:
                AudioService.current?.setAudioResourceViewState(slug, true);
                AudioService.current?.muteAudioResource(slug, false);
                break;
            }
          }}
          onExit={(action: SoundAction, slug: string) => {
            debug({ slug, action });
            switch (action) {
              case SoundAction.HOWL_OUT:
                AudioService.current?.setAudioResourceViewState(slug, false);
                AudioService.current?.muteAudioResource(slug, true);
                AudioService.current?.stopAudioResource(slug);
                break;
              case SoundAction.TONEPLAYER_GHOST_OUT:
                AudioService.current?.setAudioResourceViewState(slug, false);
                AudioService.current?.stopAudioResource(slug);
                break;
              case SoundAction.TONEPLAYER_OUT:
                AudioService.current?.setAudioResourceViewState(slug, false);
                AudioService.current?.muteAudioResource(slug, true);
                break;
            }
          }}
        />
      </>
    )
  );
}
