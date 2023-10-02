import * as Tone from 'tone';
import { Howl } from 'howler';

import { AudioServiceBuilder } from 'ballast/services/audio';

export type SoundKind = 'toneplayer' | 'howl';
export type SoundType = 'fx' | 'music' | 'ambient';
export enum SoundAction {
  HOWL_IN,
  HOWL_OUT,
  TONEPLAYER_GHOST_IN,
  TONEPLAYER_IN,
  TONEPLAYER_OUT,
  TONEPLAYER_GHOST_OUT,
}

export type Sound = {
  slug: string;
  kind: SoundKind;
  type: SoundType;
  color: string;
  loop: boolean;
  start: number;
  end: number;
  sessions: [number, number][];
};

export type Sounds = Sound[];

export type AudioResource = Sound &
  AudioResourceEventHandlers & {
    object: Howl | Tone.Player;
    inView: boolean;
  };

export type AudioResourceEventHandlers = {
  onCreated?: (...args: any) => void;
  onLoad?: (...args: any) => void;
  onPlay?: (...args: any) => void;
  onStop?: (...args: any) => void;
  onEnded?: (...args: any) => void;
  onMuted?: (...args: any) => void;
};

export type AudioServiceInstance = ReturnType<typeof AudioServiceBuilder>;

export type SoundClientStatus = {
  state: 'suspended' | 'running';
  muted: boolean;
};
