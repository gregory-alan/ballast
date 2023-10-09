import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
} from 'ballast/types/services/Audio';
import { Chunks, Sound, LoadingStatus, Chunk } from 'ballast/types/data/Chunks';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import SoundLines from 'ballast/app/components/SoundLines';
import { isMobile } from 'ballast/utils/isMobile';

const SAFE_SOUNDLINES_ACTIVATION = 500;
const MAX_CHUNKS_TO_LOAD = 15;

async function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const triggerAudioContextStatus =
  (ES: EventServiceInstance, running: boolean) => () =>
    ES.trigger('audiocontext-status', { running });

const createSounds =
  (AS: AudioServiceInstance, bookSlug: string) => (chunk: Chunk) => {
    AS.createAudioResources(
      chunk.sounds,
      bookSlug,
      () => {
        console.log('💿 all sounds loaded');
        // trigger
        chunk.loadingStatus.sounds = LoadingStatus.LOADED;
        if (chunk.loadingStatus.image === LoadingStatus.LOADED) {
          console.log('THIS CHUNK IS FULLY LOADED', chunk);
        }
      },
      {
        onLoad: (sound) => console.log('💿 loaded', sound),
      }
    );
  };

const createImage =
  (ES: EventServiceInstance, bookSlug: string) => (image: string) => {
    ES.trigger('new-chunk-image', {
      image: `/images/${bookSlug}/${image}`,
    });
  };

const dynamicChunksImport = async (book: string) => {
  try {
    const data = (await import(`ballast/data/books/${book}/chunks.json`)) as {
      default: Chunks;
    };
    console.log('⬆️ load:', data);
    return data.default;
  } catch (e) {
    console.error(`FILE NOT FOUND: ${book}/sounds.json`);
    return null;
  }
};

/**
 * 📦: Orchestrator
 * @returns void
 */
export default function Orchestrator() {
  const [bookSlug, setBookSlug] = useState<string>();
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);
  const chunksMap = useRef<Map<string, Chunk>>(new Map());
  const AudioService = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance>(EventServiceBuilder());
  const chunkCursor = useRef<number>(0);
  const chapterCursor = useRef<number>(0);

  // 🪝: AudioService initialization
  useEffect(() => {
    AudioService.current = AudioServiceBuilder();
  }, []);

  // 🪝: on Page params event, import Chunks data
  useEffect(() => {
    EventService.current.listen<{
      book: string;
      chapter: string; // 🤔 why events convert number to string?
      showSoundLines: boolean;
    }>('page-params', async ({ book, chapter, showSoundLines }) => {
      EventService.current = EventServiceBuilder();

      // 📕: Params
      setBookSlug(book);

      // 🔈: Audio Context
      AudioService.current?.startAudioContext(
        triggerAudioContextStatus(EventService.current, false),
        triggerAudioContextStatus(EventService.current, true)
      );

      // ⬆️ Import Chunks
      const importedChunks = await dynamicChunksImport(book);
      if (!importedChunks) {
        console.error('Failed loading chunks');
        return;
      }
      importedChunks.forEach((chunk) =>
        chunksMap.current.set(chunk.id, {
          ...chunk,
          loadingStatus: {
            image: LoadingStatus.INIT,
            sounds: LoadingStatus.INIT,
          },
        })
      );
      console.log('🗺️', chunksMap.current.entries());
      // chapterCursor.current = parseInt(chapter, 10);
    });

    // TEMP...
    setTimeout(
      () => EventService.current.trigger('load-next-chunks', {}),
      2000
    );
  }, []);

  // 🪝: Chunks image and sounds creation
  useEffect(() => {
    EventService.current.listen('load-next-chunks', async () => {
      if (!bookSlug) {
        return;
      }

      const selectChunks = (cursor: number, quantity: number) => {
        if (chunksMap.current) {
          return Array.from(chunksMap.current.values()).slice(
            cursor,
            cursor + quantity
          );
        }
        return [];
      };

      const chunksToLoad = selectChunks(
        chunkCursor.current,
        MAX_CHUNKS_TO_LOAD
      );

      console.log('👾 CHUNKS TO LOAD', chunksToLoad);

      for (let i = 0; i < chunksToLoad.length; i++) {
        const chunk = chunksToLoad[i];
        console.log('⬆️ loading chunk', chunk);
        if (AudioService.current) {
          createSounds(AudioService.current, bookSlug)(chunk);
        }
        createImage(EventService.current, bookSlug)(chunk.image);
        chunk.loadingStatus = {
          image: LoadingStatus.LOADING,
          sounds: LoadingStatus.LOADING,
        };
        await wait(100); // 🧐 Why am I forced to delay here to respect the Chunks array order?
      }
      // AudioService.current?.removeAudioResources(toDelete);
    });
  }, [bookSlug]);

  // 🪝: Chunks Image loaded event
  useEffect(() => {
    EventService.current.listen<{ image: string }>(
      'image-loaded',
      ({ image }) => {
        const [filename, chapter, chunk] =
          image.match(/(\d+).(\d+)\.webp$/) || [];
        if (
          filename !== undefined &&
          chapter !== undefined &&
          chunk !== undefined
        ) {
          const myChunk = chunksMap.current?.get([chapter, chunk].join('.'));
          console.log('🌄 image loaded', myChunk);
          if (myChunk) {
            myChunk.loadingStatus.image = LoadingStatus.LOADED;
            if (myChunk.loadingStatus.sounds === LoadingStatus.LOADED) {
              console.log('THIS CHUNK IS FULLY LOADED', myChunk);
            }
          }
        }
      }
    );
  }, []);

  // 🪝: Activate SoundLines event
  useEffect(() => {
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

  // 🪝: Mute and Kill Audio events
  useEffect(() => {
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
    soundLinesActivated && (
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
