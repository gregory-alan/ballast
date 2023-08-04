import {
  useEffect,
  useRef,
  useState,
  useContext,
  Context,
  SetStateAction,
  Dispatch,
} from 'react';
import { AudioService } from 'ballast/services/audio';
import {
  AudioServiceInstance,
  SoundAction,
  SoundClientStatus,
  SoundKind,
} from 'ballast/types/AudioService';
import SoundLines from 'ballast/app/components/SoundLines';

export default function SoundsClient({
  context,
  setSoundClientStatus,
  sounds,
  muted,
  showSoundLines,
  activeSoundClient,
}: {
  context: Context<SoundClientStatus>;
  setSoundClientStatus: Dispatch<SetStateAction<SoundClientStatus>>;
  sounds: any;
  muted: boolean;
  showSoundLines: boolean;
  activeSoundClient: (b: boolean) => void;
}) {
  const Audio = useRef<AudioServiceInstance | null>(null);
  const [soundLinesActivated, activateSoundLines] = useState<boolean>(false);
  const soundClientStatus = useContext(context);
  console.log('✅', soundClientStatus);

  useEffect(() => {
    const init = async () => {
      console.log('creating Audio Service and initializing Audio Context');
      Audio.current = AudioService(sounds);
      await Audio.current.startAudioContext(
        () => {
          console.log('suspended');
          setSoundClientStatus({ ...soundClientStatus, state: 'suspended' });
        },
        () => {
          console.log('running');
          setSoundClientStatus({ ...soundClientStatus, state: 'running' });
        }
      );
      Audio.current.createAudioResources();
      setTimeout(() => activateSoundLines(true), 500);
    };
    init();

    // on unmount
    return () => {
      Audio.current?.stopAllAudioResources();
      Audio.current?.removeAllAudioResources();
    };
  }, [
    Audio,
    sounds,
    activateSoundLines,
    soundClientStatus,
    setSoundClientStatus,
  ]);

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
            // console.log(
            //   `enter: ${
            //     action === 'play' ? 'play' : 'unmute'
            //   } the ${kind} ${slug}`
            // );
            if (action === 'play') {
              Audio.current?.playAudioResource(slug);
            } else if (action === 'mute' && !muted) {
              Audio.current?.muteAudioResource(slug, false);
            }
          }}
          onExit={(action: SoundAction, slug: string, kind: SoundKind) => {
            // console.log(
            //   `exit: ${action === 'play' ? 'stop' : 'mute'} the ${kind} ${slug}`
            // );
            if (action === 'play') {
              Audio.current?.stopAudioResource(slug);
            } else if (action === 'mute' && !muted) {
              Audio.current?.muteAudioResource(slug, true);
            }
          }}
        />
      </>
    )
  );
}
