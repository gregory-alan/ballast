'use client';

import { createContext } from 'react';

export const ReaderContext = createContext({
  book: '',
  chapter: -1,
});