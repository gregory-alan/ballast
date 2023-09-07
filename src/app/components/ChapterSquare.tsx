
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
        boxSizing: 'border-box',
        aspectRatio: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.85,
        fontFamily: 'Averta, Arial',
        fontWeight: 'bold',
        fontSize: '250%',
        textShadow:
          '1px 1px 0 #05050590, 1px -1px 0 #05050590, -1px 1px 0 #05050590, -1px -1px 0 #05050590, 1px 0px 0 #05050590, 0px 1px 0 #05050590, -1px 0px 0 #05050590, 0px -1px 0 #05050590',
        textTransform: 'uppercase',
        border: '1px solid rgba(0, 0, 0, 0.4)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '10%',
        filter: invert ? 'grayscale(1) contrast(1.3)' : 'grayscale(1) contrast(1.2)',
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
