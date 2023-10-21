import { useCallback, useEffect, useRef, useState } from 'react';

import { AudioServiceBuilder } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
} from 'ballast/types/services/Audio';
import { Chunks, LoadingStatus, Chunk } from 'ballast/types/data/Chunks';

import { EventServiceBuilder } from 'ballast/services/events';
import { EventServiceInstance } from 'ballast/types/services/Events';

import { isMobile } from 'ballast/utils/isMobile';

/**
 * 🦾 HELPERS
 */
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
        ES.trigger('sounds-loaded', { chunkId: chunk.id });
        updateChunksMap();
      },
      {
        onLoad: () => {},
        onError: console.error,
      }
    );
  };

const createChunk =
  (ES: EventServiceInstance, bookSlug: string) => (chunk: Chunk) => {
    ES.trigger('new-chunk', {
      newChunk: {
        ...chunk,
        image: `/images/${bookSlug}/${chunk.image}`,
      },
    });
  };

const dynamicChunksImport = async (book: string) => {
  try {
    const data = (await import(`ballast/data/books/${book}/chunks.json`)) as {
      default: Chunks;
    };
    console.log('⬆️ load:', data.default);
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
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const chunksMap = useRef<Map<string, Chunk>>(new Map());
  const Chunks = useRef<Chunks>();
  const AudioService = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance>(
    EventServiceBuilder('Orchestrator')
  );

  /**
   * Loading Chunk, either fully (image + sounds) or only sounds
   */
  const loadChunk = useCallback(
    async (chunk: Chunk, type: 'full' | 'sound' | 'image') => {
      if (!bookSlug) {
        return;
      }
      switch (type) {
        case 'full':
          createSounds(
            AudioService.current as NonNullable<AudioServiceInstance>,
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
          createChunk(EventService.current, bookSlug)(chunk);
          chunksMap.current.set(chunk.id, {
            ...chunk,
            loadingStatus: {
              image: LoadingStatus.LOADING,
              sounds: LoadingStatus.LOADING,
            },
          });
          break;
        case 'sound':
          createSounds(
            AudioService.current as NonNullable<AudioServiceInstance>,
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
          chunksMap.current.set(chunk.id, {
            ...chunk,
            loadingStatus: {
              image: chunk.loadingStatus.image,
              sounds: LoadingStatus.LOADING,
            },
          });
          break;
        case 'image':
          createChunk(EventService.current, bookSlug)(chunk);
          chunksMap.current.set(chunk.id, {
            ...chunk,
            loadingStatus: {
              image: LoadingStatus.LOADING,
              sounds: chunk.loadingStatus.sounds,
            },
          });
          break;
      }
    },
    [bookSlug]
  );

  // 🪝: AudioService initialization
  useEffect(() => {
    AudioService.current = AudioServiceBuilder();
  }, []);

  // 🪝: Chunk end has been reached, let's see if we need to load other chunks
  // Right now we are loading chunks one by one and it seems to work
  useEffect(() => {
    EventService.current.listen<{ chunkId: string; next: Chunk['next'] }>(
      'chunk-end',
      ({ chunkId, next }) => {
        console.log(chunkId, 'ended', next);
        const chunksToLoad = next.map(async (entry) => {
          const [nextChunkId, loadType] = Object.entries(entry)[0];
          const nextChunk = chunksMap.current.get(nextChunkId);
          if (nextChunk) {
            await loadChunk(nextChunk, loadType);
            await wait(100); // IS IT NECESSARY?
          }
          return nextChunk;
        });
        // console.log({ chunksToLoad });
      }
    );
  }, [loadChunk]);

  // 🪝: on Page params event, import Chunks data
  useEffect(() => {
    EventService.current.listen<{
      book: string;
      chapter: string; // 🤔 why events convert number to string?
      showSoundLines: boolean;
    }>('page-params', async ({ book, chapter, showSoundLines }) => {
      // 📕: Params
      console.log('params: ', { book, chapter });
      setBookSlug(book);
      setCurrentChapter(parseInt(chapter, 10));
    });
  }, []);

  //🪝: on ChapterNumber and BookSlug (📕)
  useEffect(() => {
    console.log('me myself and I', bookSlug, currentChapter);
    if (!bookSlug || !currentChapter) {
      return;
    }
    const asyncFn = async () => {
      // 🔈: Audio Context
      const contextState = AudioService.current?.getAudioContextState();
      if (contextState !== 'running') {
        console.log('the context state is', contextState, ': starting...');
        AudioService.current?.startAudioContext(
          triggerAudioContextStatus(EventService.current, false),
          triggerAudioContextStatus(EventService.current, true)
        );
      } else {
        AudioService.current?.stopAllAudioResources();
      }

      // ⬆️ Import Chunks -- one day we will maybe do this with different files? and not do it every chapter change
      const importedChunks = await dynamicChunksImport(bookSlug);
      if (!importedChunks) {
        console.error('Failed loading chunks');
        return;
      }
      Chunks.current = importedChunks;
      Chunks.current
        .filter(
          (chunk) =>
            chunk.chapter === currentChapter ||
            chunk.id === `${currentChapter + 1}.1`
        )
        .forEach((chunk) => {
          const storedChunk = chunksMap.current.get(chunk.id);
          if (!storedChunk) {
            const withLoading = {
              ...chunk,
              loadingStatus: {
                image: chunk.loadingStatus?.image || LoadingStatus.INIT,
                sounds: chunk.loadingStatus?.sounds || LoadingStatus.INIT,
              },
            };
            chunksMap.current.set(chunk.id, withLoading);
          }
        });
      const firstChunk = Array.from(chunksMap.current.values()).find(
        (chunk) => chunk.chapter === currentChapter
      );
      if (firstChunk) {
        loadChunk(
          firstChunk,
          firstChunk.loadingStatus.sounds === LoadingStatus.INIT
            ? 'full'
            : 'image'
        );
      }
      // debug
      console.log('🗺️', Object.fromEntries(chunksMap.current.entries()));
    };
    asyncFn();
  }, [currentChapter, bookSlug, loadChunk]);

  // 🪝: Chunks Image loaded event
  useEffect(() => {
    EventService.current.listen<{ image: string; chunkId: string }>(
      'image-loaded',
      ({ chunkId }) => {
        const myChunk = chunksMap.current?.get(chunkId);
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

  // 🪝: Start AudioContext
  useEffect(() => {
    EventService.current.listen(
      'start-audiocontext',
      () => AudioService.current?.startAudioContext(console.log, console.log) // TODO
    );
  }, []);

  // 🪝: Soundline entering viewport
  useEffect(() => {
    EventService.current.listen<{ slug: string; action: SoundAction }>(
      'soundline-enter',
      ({ slug, action }) => {
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
      }
    );
  }, []);

  // 🪝: Soundline exiting viewport
  useEffect(() => {
    EventService.current.listen<{ slug: string; action: SoundAction }>(
      'soundline-exit',
      ({ slug, action }) => {
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

  return null;
}
