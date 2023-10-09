import { useEffect, useRef, useState } from 'react';
import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
} from 'ballast/types/services/Audio';
import { Chunks, Sound, LoadingStatus, Chunk } from 'ballast/types/data/Chunks';
import flatten from 'lodash.flatten';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import SoundLines from 'ballast/app/components/SoundLines';
import { isMobile } from 'ballast/utils/isMobile';

const SAFE_SOUNDLINES_ACTIVATION = 500;
const MAX_CHUNKS_TO_LOAD = 1;

async function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const triggerAudioContextStatus =
  (ES: EventServiceInstance, running: boolean) => () =>
    ES.trigger('audiocontext-status', { running });

const createSounds =
  (
    AS: AudioServiceInstance,
    ES: EventServiceInstance,
    bookSlug: string,
    updateChunksMap: () => void
  ) =>
  (chunk: Chunk) => {
    AS.createAudioResources(
      chunk.sounds,
      bookSlug,
      () => {
        // console.log('💿  loaded');
        ES.trigger('sounds-loaded', { chunkId: chunk.id });
        updateChunksMap();
      },
      {
        // onLoad: (sound) => console.log('💿 loaded', sound),
        onLoad: () => {},
        // onError: (error) => alert(error),
      }
    );
  };

const createImage =
  (ES: EventServiceInstance, bookSlug: string) =>
  (image: string, chunkId: string) => {
    ES.trigger('new-chunk-image', {
      image: `/images/${bookSlug}/${image}`,
      chunkId,
    });
  };

const dynamicChunksImport = async (book: string) => {
  try {
    const data = (await import(`ballast/data/books/${book}/chunks.json`)) as {
      default: Chunks;
    };
    // console.log('⬆️ load:', data);
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
  // const chapterCursor = useRef<number>(0);

  // 🪝: AudioService initialization
  useEffect(() => {
    AudioService.current = AudioServiceBuilder();
  }, []);

  // 🪝: Chunk end has been reached, let's see if we need to load other chunks
  useEffect(() => {
    EventService.current.listen<{ chunkId: string }>(
      'chunk-end',
      ({ chunkId }) => {
        console.log('new chunk end', chunkId, chunksMap);
        const chunks = Array.from(chunksMap.current.values());
        const chunksStillLoading = chunks.filter(
          ({ loadingStatus }) =>
            loadingStatus.image === LoadingStatus.LOADING ||
            loadingStatus.sounds === LoadingStatus.LOADING
        );

        const nextChunksToLoad = chunks
          .filter(
            ({ loadingStatus }) =>
              loadingStatus.image === LoadingStatus.INIT &&
              loadingStatus.sounds === LoadingStatus.INIT
          )
          .slice(0, MAX_CHUNKS_TO_LOAD);
          // .slice(0, MAX_CHUNKS_TO_LOAD - chunksStillLoading.length);
        console.log({ chunks, chunksStillLoading, nextChunksToLoad });
        EventService.current.trigger('load-next-chunks', {
          chunks: nextChunksToLoad,
        });
      }
    );
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
    setTimeout(() => {
      const chunks = Array.from(chunksMap.current.values());
      const nextChunksToLoad = chunks
        .filter(
          ({ loadingStatus }) =>
            loadingStatus.image === LoadingStatus.INIT &&
            loadingStatus.sounds === LoadingStatus.INIT
        )
        .slice(0, MAX_CHUNKS_TO_LOAD);
      EventService.current.trigger('load-next-chunks', {
        chunks: nextChunksToLoad,
      });
    }, 2000);
  }, []);

  // 🪝: Chunks image and sounds creation
  useEffect(() => {
    EventService.current.listen<{ chunks: Chunk[] }>(
      'load-next-chunks',
      async ({ chunks }) => {
        if (!chunks?.length || !bookSlug) {
          return;
        }
        console.log('👾 CHUNKS TO LOAD', chunks);

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          // console.log('⬆️ loading chunk', chunk);
          if (AudioService.current) {
            createSounds(
              AudioService.current,
              EventService.current,
              bookSlug,
              () => {
                const myChunk = chunksMap.current?.get(chunk.id);
                if (myChunk) {
                  chunksMap.current.set(chunk.id, {
                    ...myChunk,
                    loadingStatus: {
                      image: myChunk.loadingStatus.image,
                      sounds: LoadingStatus.LOADED,
                    },
                  });
                }
              }
            )(chunk);
          }
          createImage(EventService.current, bookSlug)(chunk.image, chunk.id);
          chunksMap.current.set(chunk.id, {
            ...chunk,
            loadingStatus: {
              image: LoadingStatus.LOADING,
              sounds: LoadingStatus.LOADING,
            },
          });
          await wait(100); // 🧐 Why am I forced to delay here to respect the Chunks array order?
        }
        // AudioService.current?.removeAudioResources(toDelete);
      }
    );
  }, [bookSlug]);

  // 🪝: Chunks Image loaded event
  useEffect(() => {
    EventService.current.listen<{ image: string; chunkId: string }>(
      'image-loaded',
      ({ image, chunkId }) => {
        const myChunk = chunksMap.current?.get(chunkId);
        // console.log('🌄 image loaded', image, myChunk);
        if (myChunk) {
          chunksMap.current.set(myChunk.id, {
            ...myChunk,
            loadingStatus: {
              sounds: myChunk.loadingStatus.sounds,
              image: LoadingStatus.LOADED,
            },
          });
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
        <SoundLines
          sounds={flatten(
            Array.from(chunksMap.current.values()).map((chunk) => chunk.sounds)
          )}
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
