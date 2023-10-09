import { EventServiceBuilder } from 'ballast/services/events';

export type EventServiceInstance = ReturnType<typeof EventServiceBuilder>;

export type Events =
  | 'audiocontext-status'
  | 'page-params'
  | 'mute-audio'
  | 'activate-soundlines'
  | 'kill-audio'
  | 'new-chunk-image'
  | 'image-loaded'
  | 'sounds-loaded'
  | 'chunk-end'
  | 'load-next-chunks';
