import { useEffect, useState } from 'react';
import Image from 'next/image';

const HIDE_DURATION = 0;
const Cover = ({
  book,
}: {
  book: string;
}) => {
  const [visible, show] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => show(true), HIDE_DURATION);
  }, []);

  return (
    <>
      <Image
        className="relative top-0 left-0"
        src={`/images/${book}/cover.webp`}
        alt="Ballast (logo)"
        width={10000}
        height={1}
        onLoadingComplete={() => {}}
        priority
      />
    </>
  );
};

export default Cover;
