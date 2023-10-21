import { EventServiceBuilder } from 'ballast/services/events';

export type EventServiceInstance = ReturnType<typeof EventServiceBuilder>;

export type Events =
  | 'audiocontext-status'
  | 'chunk-end'
  | 'image-loaded'
  | 'kill-audio'
  | 'mute-audio'
  | 'new-chunk'
  | 'page-params'
  | 'soundline-enter'
  | 'soundline-exit'
  | 'sounds-loaded'
  | 'start-audiocontext';
