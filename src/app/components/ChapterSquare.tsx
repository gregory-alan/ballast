
type ChapterInfo = {
  title: string;
  number: number;
  slug: string;
  vignette: string;
};

const ChapterSquare = ({
  chapter,
  invert,
}: {
  chapter: ChapterInfo;
  invert: boolean;
}) => {
  return (
    <div
      className="chapter-square"
      style={{
        aspectRatio: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.9,
        fontFamily: 'Averta, Arial',
        fontWeight: 'bold',
        fontSize: '200%',
        textShadow:
          '1px 1px 0 #05050590, 1px -1px 0 #05050590, -1px 1px 0 #05050590, -1px -1px 0 #05050590, 1px 0px 0 #05050590, 0px 1px 0 #05050590, -1px 0px 0 #05050590, 0px -1px 0 #05050590',
        textTransform: 'uppercase',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '10%',
        filter: invert ? 'grayscale(1)' : 'grayscale(1) invert(75%) contrast(2)',
        backgroundImage: `url(${chapter.vignette})`,
        backgroundSize: 'cover',
      }}
    >
      {chapter.number}
      {/* <Ink /> buggy on mobile, but why? */}
    </div>
  );
};

export default ChapterSquare;
