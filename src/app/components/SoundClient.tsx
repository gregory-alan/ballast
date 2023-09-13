import { useContext, useEffect, useRef, useState } from 'react';
import { AudioService } from 'ballast/services/audio';
import { AudioServiceInstance } from 'ballast/types/AudioService';

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
  const Audio = useRef<AudioServiceInstance | null>(null);
  const EventService = useRef<EventServiceInstance | null>(null);
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);

  // EVENTS
  useEffect(() => {
    console.log('༄ SOUND CLIENT INITIALIZATION ༄');
    EventService.current = EventServiceBuilder();
    EventService.current.listen<{ book: string; chapter: number; showSoundLines: boolean }>(
      'page-params',
      (data) => console.log('🐳', data)
    );
  }, []);

  return null;

  // useEffect(() => {
  //   const init = async () => {
  //     console.log({ audio: Audio.current });
  //     console.log('🔊 creating Audio Service and initializing Audio Context');
  //     Audio.current = AudioService(sounds);
  //     await Audio.current.startAudioContext(
  //       () => {
  //         console.log('⏸️ suspended');
  //         activeSoundClient(false);
  //       },
  //       () => {
  //         console.log('▶️ running');
  //         activeSoundClient(true);
  //       }
  //     );
  //     Audio.current.createAudioResources();
  //     setTimeout(() => activateSoundLines(true), 500);
  //   };
  //   init();

  //   // on unmount
  //   return () => {
  //     Audio.current?.stopAllAudioResources();
  //     Audio.current?.removeAllAudioResources();
  //   };
  // }, [Audio, sounds, activateSoundLines, activeSoundClient]);

  // useEffect(() => {
  //   Audio.current && Audio.current.muteAllAudioResources(muted);
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
  //             Audio.current?.playAudioResource(slug);
  //           } else if (action === 'mute' && !muted) {
  //             Audio.current?.muteAudioResource(slug, false);
  //           }
  //         }}
  //         onExit={(action: SoundAction, slug: string, kind: SoundKind) => {
  //           // console.log(
  //           //   `exit: ${action === 'play' ? 'stop' : 'mute'} the ${kind} ${slug}`
  //           // );
  //           if (action === 'play') {
  //             Audio.current?.stopAudioResource(slug);
  //           } else if (action === 'mute' && !muted) {
  //             Audio.current?.muteAudioResource(slug, true);
  //           }
  //         }}
  //       />
  //     </>
  //   )
  // );
}
