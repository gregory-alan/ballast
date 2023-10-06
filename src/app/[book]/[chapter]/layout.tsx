'use client';

import { useRouter } from 'next/navigation';

import { ReaderContext } from 'ballast/contexts/ReaderContext';

export default function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { book: string; chapter: string };
}) {
  const router = useRouter();
  const book = params.book;
  const chapter = parseInt(params.chapter, 10);

  if (isNaN(chapter)) {
    router.push('/404');
  }

  return (
    <>
      <ReaderContext.Provider value={{ chapter, book }}>
        {children}
      </ReaderContext.Provider>
    </>
  );
}
