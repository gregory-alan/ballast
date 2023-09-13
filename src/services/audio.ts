import * as Tone from 'tone';
import { Howl } from 'howler';

import { AudioResource, Sounds } from 'ballast/types/AudioService';

export const AudioService = (sounds: Sounds) => {
  ///////////
  // GLOBALS
  ///////////
  const HOWL_FADE_IN = 200;
  const HOWL_FADE_OUT = 200;
  const TONE_FADE_IN = 0.2;
  const TONE_FADE_OUT = 0.2;

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
    JSON.stringify(AudioResources.entries(), null, 2);

  ////////////
  // METHODS
  ////////////
  const startAudioContext = (
    onAudioContextSuspended: () => void,
    onAudioContextRunning: () => void
  ) => {
    Tone.start();
    setTimeout(() => {
      // console.log(Tone.context.state);
      if (Tone.context.state === 'running') {
        onAudioContextRunning();
      }
    }, 1000)
    if (Tone.context.state !== 'running') {
      onAudioContextSuspended();
    }
  };

  const createHowlerAudioResource = (sound: Omit<AudioResource, 'object'>) => {
    const { slug, loop, onCreated, onLoaded, onMuted } = sound;
    try {
      const howl = new Howl({
        src: [
          `/sounds/${slug}.webm`,
          // `/sounds/${slug}.aac`,
          // `/sounds/${slug}.mp3`,
        ], // 🧐 I DUNNO WHY BUT WEBM DOES NOT WORK ON MOBILE!!!!
        html5: true,
        mute: false,
        loop: loop,
        onmute: () => onMuted && onMuted(getAudioResource(slug)),
        onload: () => onLoaded?.(sound),
        onplay: () => console.log('playing', slug),
        onplayerror: (e) => console.error(e, slug),
      });

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

  const createToneAudioResource = (sound: Omit<AudioResource, 'object'>) => {
    const { slug, onCreated } = sound;
    const player = new Tone.Player(`/sounds/${slug}.webm`).toDestination();
    player.fadeIn = 0.5;
    player.fadeOut = 0.5;
    player.volume.value = -60;
    const resource = {
      ...sound,
      object: player,
    };
    addAudioResource(slug, resource);
    onCreated && onCreated(getAudioResource(slug));
    return resource;
  };

  const createAudioResource = (
    sound: Omit<AudioResource, 'object'>
  ): AudioResource | undefined => {
    switch (sound.kind) {
      case 'howl':
        return createHowlerAudioResource(sound);
      case 'toneplayer':
        // TODO: here do something for groups player... should go with Players I guess?
        return createToneAudioResource(sound);
    }
  };

  const createAudioResources = () => {
    sounds.forEach((sound) => {
      createAudioResource({ ...sound, onCreated: console.log });
    });
  };

  const _mute = (muted: boolean, resource?: AudioResource) => {
    if (resource) {
      switch (resource.kind) {
        case 'howl':
          const howl = resource.object as Howl;
          howl.mute(muted);
          break;
        case 'toneplayer':
          const player = resource.object as Tone.Player;
          if (!player.loaded) {
            return;
          }
          if (!muted) {
            player.volume.setValueCurveAtTime(
              [-60, -6],
              Tone.now(),
              TONE_FADE_IN
            );
          } else {
            player.volume.setValueCurveAtTime(
              [-6, -60],
              Tone.now(),
              TONE_FADE_OUT
            );
          }
          resource.onMuted && resource.onMuted(resource);
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
          setTimeout(() => howl.stop(), HOWL_FADE_OUT);
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

  const muteAllAudioResources = (muted: boolean) => {
    const resources = Array.from(getAllAudioResources());
    resources.forEach((resource) => _mute(muted, resource));
  };

  const muteAudioResource = (slug: string, muted: boolean) => {
    const resource = getAudioResource(slug);
    _mute(muted, resource);
  };

  const playAudioResource = (slug: string) => {
    const resource = getAudioResource(slug);
    if (resource) {
      switch (resource.kind) {
        case 'howl':
          const howl = resource.object as Howl;
          howl.volume(0);
          howl.fade(0, 1, HOWL_FADE_IN);
          howl.play();
          break;
        case 'toneplayer':
          const player = resource.object as Tone.Player;
          if (player.loaded) {
            player.start();
          } else {
            console.error('not loaded', slug);
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

  const stopAudioResource = (slug: string) => {
    const resource = getAudioResource(slug);
    _stop(resource);
  };

  const stopAllAudioResources = (dispose: boolean = false) => {
    const resources = Array.from(getAllAudioResources());
    resources.forEach((resource) => _stop(resource, dispose));
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
    removeAllAudioResources,
    // dumpSoundMap,
    // setMusicVolume,
    // setFXVolume,
    // setGlobalVolume,
  };
};
