import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
} from 'ballast/types/services/Audio';
import { SoundsData } from 'ballast/types/data/Sounds';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import SoundLines from 'ballast/app/components/SoundLines';
import { isMobile } from 'ballast/utils/isMobile';

const SAFE_SOUNDLINES_ACTIVATION = 500;
const MAX_CHUNKS_TO_LOAD = 8;

export default function Orchestrator() {
  const [bookSlug, setBookSlug] = useState<string>();
  const [sounds, setSounds] = useState<SoundsData>();
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);
  const AudioService = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance | null>(null);
  const chunkCursor = useRef<number>(0);
  const chapterCursor = useRef<number>(0);
  const chunks = useRef<
    Map<{ chapter: number; id: number }, { loaded: boolean }>
  >(new Map());

  const dynamicSoundsImport = async (book: string) => {
    try {
      const data = (await import(`ballast/data/books/${book}/sounds.json`)) as {
        default: SoundsData;
      };
      console.log('⬆️ load:', data);
      return data.default;
    } catch (e) {
      console.error(`FILE NOT FOUND: ${book}/sounds.json`);
      return null;
    }
  };

  // AudioService init
  useEffect(() => {
    AudioService.current = AudioServiceBuilder();
  }, []);

  // Page params
  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.listen<{
      book: string;
      chapter: string; // 🤔 why events convert number to string?
      showSoundLines: boolean;
    }>('page-params', async ({ book, chapter, showSoundLines }) => {
      console.log(book, chapter);
      // 1) Check if audio context is running in order to display the modal
      const triggerAudioContextStatus = (running: boolean) => () =>
        EventService.current?.trigger('audiocontext-status', { running });

      AudioService.current?.startAudioContext(
        triggerAudioContextStatus(false),
        triggerAudioContextStatus(true)
      );

      // 2) Import sounds
      const sounds = await dynamicSoundsImport(book);
      if (!sounds) {
        console.error('Failed loading sounds');
        return;
      }
      setSounds(sounds);
      setBookSlug(book);
      chapterCursor.current = parseInt(chapter, 10);
    });

    // TEMP
    setTimeout(
      () => EventService.current?.trigger('load-next-chunks', {}),
      2000
    );
  }, []);

  // Chunks
  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.listen('load-next-chunks', async () => {
      if (!bookSlug) {
        return;
      }

      const selectChunks = (
        cursor: number,
        chapterNumber: number,
        quantity: number
      ) => {
        let chapter = sounds?.chapters.find(
          (chapter) => chapter.id === chapterNumber
        );
        if (!chapter) {
          return [];
        }

        let chunks = chapter.chunks
          .filter((chunk) => chunk.id > cursor && chunk.id <= cursor + quantity)
          .map((chunk) => ({ ...chunk, chapter: chapterNumber }));
        if (chunks.length < quantity) {
          chunks = [
            ...chunks,
            ...selectChunks(0, chapterNumber + 1, quantity - chunks.length),
          ];
        }
        return chunks;
      };

      const chunksToLoad = selectChunks(
        chunkCursor.current,
        chapterCursor.current,
        MAX_CHUNKS_TO_LOAD
      );
      console.log('💿  chunks', chunksToLoad);

      // load Chunk
      // onLoad, mark chunk as loaded

      // 1) List the sound to create
      const soundsToCreate = chunksToLoad
        .map((chunk) => chunk.sounds)
        .reduce((all, sounds) => [...all, ...sounds], []);

      AudioService.current?.createAudioResources(
        soundsToCreate,
        bookSlug,
        () => {
          chunksToLoad.forEach((chunk) =>
            chunks.current.set(
              { chapter: chunk.chapter, id: chunk.id },
              { loaded: true }
            )
          );
          console.log(Array.from(chunks.current.entries()));
        },
        {
          onLoad: (sound) => console.log('💿', sound),
        }
      );
      // AudioService.current?.removeAudioResources(toDelete);
    });
  }, [sounds, bookSlug]);

  // Activate SoundLines
  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.listen<{ activate: boolean }>(
      'activate-soundlines',
      ({ activate }) => {
        if (activate) {
          AudioService.current?.startAudioContext(
            () =>
              setTimeout(
                () => activateSoundLines(activate),
                SAFE_SOUNDLINES_ACTIVATION
              ),
            () => console.warn('context coudnt be activated')
          );
        }
        activateSoundLines(activate);
      }
    );
  }, []);

  // Mute and Kill Audio
  useEffect(() => {
    EventService.current = EventServiceBuilder();
    EventService.current.listen<{ muted: boolean }>('mute-audio', ({ muted }) =>
      AudioService.current?.globalMuteResources(muted)
    );

    const stopAndRemoveAllAudioResources = () => {
      AudioService.current?.stopAllAudioResources();
      AudioService.current?.removeAllAudioResources();
    };
    EventService.current.listen('kill-audio', stopAndRemoveAllAudioResources);

    return stopAndRemoveAllAudioResources;
  }, []);

  // // TODO: better out of focus handling, but so far, we simply reload the page which will do the trick
  // // check https://github.com/serkanyersen/ifvisible.js/
  // // window.onfocus = () => alert('focus');
  // if (isMobile()) {
  //   // window.onblur = () => window.location.reload();
  // }

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
    soundLinesActivated &&
    sounds && (
      <>
        <Link href="/livre-1/2" style={{ zIndex: 1000000, color: 'white' }}>
          <div>MON LIEN</div>
        </Link>
        {/* <SoundLines
          sounds={sounds as any} // temp
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
        /> */}
      </>
    )
  );
}
