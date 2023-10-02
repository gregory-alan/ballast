export type Images = {
  chapters: Chapter[];
}

export type Chapter = {
  id:     number;
  chunks: Chunk[];
}

export type Chunk = {
  id:    number;
  image: string;
}
