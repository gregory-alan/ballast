'use client';

import { useSearchParams, useRouter } from 'next/navigation';

import Chapter from 'ballast/app/components/Chapter';

export default function Reader({
  params,
}: {
  params: { book: string; chapter: string };
}) {
  const router = useRouter();
  const book = params.book;
  const chapterNumber = parseInt(params.chapter.split('-')[0], 10);
  if (isNaN(chapterNumber)) {
    router.push('/404');
  }
  const searchParams = useSearchParams();
  const showSoundLines = searchParams.get('soundlines') === 'true';

  return (
    <Chapter
      book={book}
      chapterNumber={chapterNumber}
      showSoundLines={showSoundLines}
    />
  );
}
