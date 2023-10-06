export type Chunks = Chunk[];

export type Chunk = {
  id:       string;
  chapter:  number;
  sounds:   Sound[];
  image:    string;
  loadingStatus: {
    image:  LoadingStatus;
    sounds: LoadingStatus;
  };
}

export enum LoadingStatus {
  'INIT',
  'LOADING',
  'LOADED',
};

export type SoundKind = 'howl' | 'toneplayer';
export type SoundType = 'music' | 'ambient' | 'fx';

export type Sound = {
  slug:     string;
  type:     SoundType;
  kind:     SoundKind;
  color:    string;
  loop:     boolean;
  start:    number;
  end:      number;
  sessions: [number, number][];
}
