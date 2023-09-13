'use client';

import { useEffect, useState, createContext } from 'react';

export const ReaderContext = createContext({
  book: '',
  chapter: -1,
});