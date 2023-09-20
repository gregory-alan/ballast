import * as Tone from 'tone';
import { Howl } from 'howler';

import { AudioResource, Sounds } from 'ballast/types/AudioService';

export const AudioServiceBuilder = () => {
  ///////////
  // GLOBALS
  ///////////
  const HOWL_FADE_IN = 200;
  const HOWL_FADE_OUT = 200;
  const TONE_FADE_IN = 0.2;
  const TONE_FADE_OUT = 0.2;

  let globalMute = false;

  ///////////////////
  // AUDIO RESOURCES
  ///////////////////
  const AudioResources = new Map<string, AudioResource>();
  const getAudioResource = (slug: string) => AudioResources.get(slug);
  const getAllAudioResources = () => AudioResources.values();
  const addAudioResource = (slug: string, resource: AudioResource) =>
    AudioResources.set(slug, resource);
  const removeAudioResource = (slug: string) => AudioResources.delete(slug);
  const audioResourceExists = (slug: string) => AudioResources.has(slug);
  const removeAllAudioResources = () => AudioResources.clear();
  const dumpAudioResources = () =>
    console.log(
      Array.from(AudioResources.entries()).reduce((obj, row) => {
        obj[row[0] as string] = row[1];
        return obj;
      }, {} as any)
    );

  ////////////
  // METHODS
  ////////////

  const _play = (resource?: AudioResource) => {
    if (resource) {
      switch (resource.kind) {
        case 'howl':
          const howl = resource.object as Howl;
          howl.play();
          if (!globalMute) {
            howl.mute(false);
            howl.mute(false); // WTF, but twice is working, once not
            howl.fade(0, 1, HOWL_FADE_IN);
          }
          if (resource.loop) {
            howl.loop(true);
          }
          break;
        case 'toneplayer':
          const player = resource.object as Tone.Player;
          if (player.loaded) {
            player.start();
          } else {
            console.error(`Can't play ${resource.slug}: not loaded`);
          }
          // we could fallback to howler for a default html5 audio for all the vertical cues?
          // else {
          //   // we fallback to howler for html5 audio
          //   resource.kind = 'howl';
          //   player.
          //   removeAudioResource(resource.slug);
          //   const fallbackResource = {
          //     ...resource,
          //     onLoaded: (resource: AudioResource) =>
          //     {
          //       muteAudioResource(resource.slug, false);
          //       playAudioResource(resource.slug);
          //     },
          //     onCreated: console.log,
          //   }
          //   createHowlerAudioResource(fallbackResource);
          // }
          break;
      }
    }
  };

  const _stop = (resource?: AudioResource, dispose?: boolean) => {
    if (resource) {
      switch (resource.kind) {
        case 'howl':
          const howl = resource.object as Howl;
          howl.fade(1, 0, HOWL_FADE_OUT);
          setTimeout(() => {
            howl.pause();
            howl.mute(true);
          }, HOWL_FADE_OUT);
          // Note: dispose is down automatically by howler
          // https://github.com/goldfire/howler.js#pool-number-5
          break;
        case 'toneplayer':
          const player = resource.object as Tone.Player;
          player.stop();
          if (dispose) {
            // https://tonejs.github.io/docs/14.7.77/Source#dispose
            player.dispose();
          }
          break;
      }
    }
  };

  const _mute = (muted: boolean, resource?: AudioResource) => {
    if (resource) {
      switch (resource.kind) {
        case 'howl':
          const howl = resource.object as Howl;
          howl.mute(muted);
          howl.volume(muted ? 0 : 1);
          break;
        case 'toneplayer':
          const player = resource.object as Tone.Player;
          if (!player.loaded) {
            console.error(`Can't (un)mute ${resource.slug}: not loaded`);
            return;
          }
          if (!muted) {
            player.volume.setValueCurveAtTime(
              [-Infinity, -6],
              Tone.now(),
              TONE_FADE_IN
            );
            // setTimeout(() => player.volume.mute = true, 200)
          } else {
            player.volume.setValueCurveAtTime(
              [-6, -Infinity],
              Tone.now(),
              TONE_FADE_OUT
            );
          }
          resource.onMuted && resource.onMuted(resource);
          break;
      }
    }
  };

  /**
   * This method checks tries to start the Audio Context and triggers one of the two callback accordingly
   * @param onAudioContextSuspended
   * @param onAudioContextRunning
   */
  const startAudioContext = (
    onAudioContextSuspended: () => void,
    onAudioContextRunning: () => void
  ) => {
    Tone.start();
    setTimeout(() => {
      if (Tone.context.state === 'running') {
        onAudioContextRunning();
      }
    }, 1000);
    if (Tone.context.state !== 'running') {
      onAudioContextSuspended();
    }
  };

  /**
   * This method creates an AudioResource with a Howler's howl object.
   * Howl is muted and volume 0 by default.
   * Loop is set to true at first play back. On end, it is set to false if global mute is on
   * @param sound
   * @param book
   * @returns AudioResource (kind = howl) | undefined
   */
  const createHowlerAudioResource = (
    sound: Omit<AudioResource, 'object'>,
    book: string
  ) => {
    const { slug, onCreated, onLoaded, onMuted } = sound;
    try {
      const howl = new Howl({
        src: [
          // `/sounds/${book}/${slug}.webm`,
          // `/sounds/${book}/${slug}.aac`,
          `/sounds/${book}/${slug}.mp3`,
        ], // 🧐 I DUNNO WHY BUT WEBM DOES NOT WORK ON MOBILE!!!!
        html5: true,
        mute: true,
        onmute: () => onMuted && onMuted(getAudioResource(slug)),
        onload: () => onLoaded?.(sound),
        // onplay: (soundId) => console.log('play', slug, soundId),
        // onpause: (soundId) => console.log('pause', slug, soundId),
        // onstop: (soundId) => console.log('stop', slug, soundId),
        // onplayerror: (e) => console.error(e, slug),
      });
      howl.volume(0);

      const resource = {
        ...sound,
        object: howl,
      };
      addAudioResource(slug, resource);
      onCreated && onCreated(getAudioResource(slug));
      return resource;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  /**
   * This method creates an AudioResource with a Tone.js Player object.
   * The player is muted by default (volume = -Infinity).
   * @param sound
   * @param book
   * @returns AudioResource (kind = toneplayer) | undefined
   */
  const createToneAudioResource = (
    sound: Omit<AudioResource, 'object'>,
    book: string
  ) => {
    const { slug, onCreated } = sound;
    // const player = new Tone.Player(`/sounds/${book}/${slug}.webm`).toDestination();
    const player = new Tone.Player(
      `/sounds/${book}/${slug}.mp3`
    ).toDestination();
    player.fadeIn = 0.5;
    player.fadeOut = 0.5;
    player.volume.value = -Infinity;
    const resource = {
      ...sound,
      object: player,
    };
    addAudioResource(slug, resource);
    onCreated && onCreated(getAudioResource(slug));
    return resource;
  };

  /**
   * This methode creates an AudioResource with a Tone.js Player or a Howler's howl.
   * @param sound
   * @param book
   * @returns AudioResource
   */
  const createAudioResource = (
    sound: Omit<AudioResource, 'object'>,
    book: string
  ): AudioResource | undefined => {
    if (audioResourceExists(sound.slug)) {
      return;
    }
    switch (sound.kind) {
      case 'howl':
        return createHowlerAudioResource(sound, book);
      case 'toneplayer':
        // TODO: here do something for groups player... should go with Players I guess?
        return createToneAudioResource(sound, book);
    }
  };

  /**
   * This method creates all AudioResources with a Tone.js Player or a Howler's howl.
   * Tone Players loading is delayed because we want to load the Howl first
   * TODO: load the sounds based on priority value
   * @param sound
   * @param book
   * @returns AudioResource
   */
  const createAudioResources = (sounds: Sounds, book: string) => {
    const howls = sounds.filter((sound) => sound.kind === 'howl');
    const toneplayers = sounds.filter((sound) => sound.kind === 'toneplayer');

    howls.forEach((sound) =>
      createAudioResource({ ...sound, onCreated: () => {} }, book)
    );

    // We delay the loading of toneplayers because we always start with a howl that should be loaded first
    setTimeout(() => {
      toneplayers.forEach((sound) =>
        createAudioResource({ ...sound, onCreated: () => {} }, book)
      );
    }, 1000);
  };

  /**
   * This method mutes all the AudioResources in memory.
   * Tone.js Player volume is set to [-Infinity, 60].
   * Howler's howl is muted and volume set to [0, -6].
   * @param muted
   */
  const muteAllAudioResources = (muted: boolean) => {
    const resources = Array.from(getAllAudioResources());
    resources.forEach((resource) => _mute(muted, resource));
    globalMute = muted;
  };

  /**
   * This method mutes one AudioResource in memory.
   * Tone.js Player volume is set to [-Infinity, 60].
   * Howler's howl is muted and volume set to [0, -6].
   * @param slug
   * @param muted
   */
  const muteAudioResource = (slug: string, muted: boolean) => {
    const resource = getAudioResource(slug);
    _mute(muted, resource);
  };

  /**
   * This method plays one AudioResource in memory.
   * @param slug
   */
  const playAudioResource = (slug: string) => {
    const resource = getAudioResource(slug);
    _play(resource);
  };

  /**
   * This method stops one AudioResource in memory.
   * @param slug
   * @param dispose
   */
  const stopAudioResource = (slug: string, dispose: boolean = false) => {
    const resource = getAudioResource(slug);
    _stop(resource);
  };

  /**
   * This method stops all AudioResources in memory.
   * @param dispose
   */
  const stopAllAudioResources = (dispose: boolean = false) => {
    const resources = Array.from(getAllAudioResources());
    resources.forEach((resource) => _stop(resource, dispose));
  };

  /**
   * This method stops the given AudioResources and clean them from memory
   * @param sounds
   */
  const removeAudioResources = (sounds: Sounds) => {
    sounds.forEach((sound) => {
      stopAudioResource(sound.slug, true);
      removeAudioResource(sound.slug);
    });
  };

  /**
   * When clicking on a <SoundLine />, log the current AudioResource
   * @param slug
   */
  const debugAudioResource = (slug: string) => {
    const resource = getAudioResource(slug);
    console.log('💿', resource);
  };

  return {
    startAudioContext,
    createAudioResource,
    createAudioResources,
    playAudioResource,
    stopAudioResource,
    stopAllAudioResources,
    muteAudioResource,
    muteAllAudioResources,
    removeAudioResources,
    removeAllAudioResources,
    dumpAudioResources,
    debugAudioResource,
    // setMusicVolume,
    // setFXVolume,
    // setGlobalVolume,
  };
};
