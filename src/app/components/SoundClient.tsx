'use client';

import { useEffect, useRef, useState } from 'react';
import { AudioService } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
  SoundKind,
} from 'ballast/types/AudioService';
import SoundLines from 'ballast/app/components/SoundLines';

export default function SoundsClient({
  sounds,
  muted,
  showSoundLines,
}: {
  sounds: any;
  muted: boolean;
  showSoundLines: boolean;
}) {
  const Audio = useRef<AudioServiceInstance | null>(null);
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      console.log('creating Audio Service and initializing Audio Context');
      Audio.current = AudioService(sounds);
      await Audio.current.startAudioContext();
      Audio.current.createAudioResources();
      setTimeout(() => activateSoundLines(true), 500);
    };
    init();

    // on unmount
    return () => {
      Audio.current?.stopAllAudioResources();
      Audio.current?.removeAllAudioResources();
    };
  }, [Audio, sounds, activateSoundLines]);

  useEffect(() => {
    Audio.current && Audio.current.muteAllAudioResources(muted);
  }, [Audio, muted]);

  return (
    soundLinesActivated && (
      <>
        <SoundLines
          sounds={sounds}
          isVisible={showSoundLines}
          onEnter={(action: SoundAction, slug: string, kind: SoundKind) => {
            console.log(
              `enter: ${
                action === 'play' ? 'play' : 'unmute'
              } the ${kind} ${slug}`
            );
            if (action === 'play') {
              Audio.current?.playAudioResource(slug);
            } else if (action === 'mute') {
              Audio.current?.muteAudioResource(slug, false);
            }
          }}
          onExit={(action: SoundAction, slug: string, kind: SoundKind) => {
            console.log(
              `exit: ${action === 'play' ? 'stop' : 'mute'} the ${kind} ${slug}`
            );
            if (action === 'play') {
              Audio.current?.stopAudioResource(slug);
            } else if (action === 'mute') {
              Audio.current?.muteAudioResource(slug, true);
            }
          }}
        />
      </>
    )
  );
}
