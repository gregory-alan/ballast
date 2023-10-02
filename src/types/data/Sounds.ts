export type SoundsData = {
  chapters: Chapter[];
}

export type Chapter = {
  id:     number;
  chunks: Chunk[];
}

export type Chunk = {
  id:       number;
  chapter?: number;
  sounds:   Sound[];
}

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
