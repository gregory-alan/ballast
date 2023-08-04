import * as Tone from 'tone';
import { Howl } from 'howler';

import { AudioService } from 'ballast/services/audio';

export type SoundKind = 'toneplayer' | 'howl';
export type SoundType = 'fx' | 'music' | 'ambient';
export type SoundAction = 'play' | 'mute';

export type Sound = {
  slug: string;
  kind: SoundKind;
  type: SoundType;
  color: string;
  loop: boolean;
  start: number;
  end: number;
  sessions: [[number, number]];
};

export type Sounds = Sound[];

export type AudioResource = Sound &
  AudioResourceEventHandlers & {
    object: Howl | Tone.Player;
  };

export type AudioResourceEventHandlers = {
  onCreated?: (...args: any) => void;
  onLoaded?: (...args: any) => void;
  onPlayed?: (...args: any) => void;
  onStopped?: (...args: any) => void;
  onEnded?: (...args: any) => void;
  onMuted?: (...args: any) => void;
};

export type AudioServiceInstance = ReturnType<typeof AudioService>;

export type SoundClientStatus = { state: 'suspended' | 'running'; muted: boolean };