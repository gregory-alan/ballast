type ChapterInfo = {
  title: string;
  number: number;
  slug: string;
  vignette: string;
};

const ChapterSquare = ({
  chapter,
}: {
  chapter: ChapterInfo;
}) => {
  return (
    <div
      className="chapter-square"
      style={{
        aspectRatio: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: 'Averta',
        fontWeight: 'bold',
        fontSize: '120%',
        textShadow:
          '1px 1px 0 #05050590, 1px -1px 0 #05050590, -1px 1px 0 #05050590, -1px -1px 0 #05050590, 1px 0px 0 #05050590, 0px 1px 0 #05050590, -1px 0px 0 #05050590, 0px -1px 0 #05050590',
        textTransform: 'uppercase',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '10%',
        backgroundImage: `url(${chapter.vignette})`,
        backgroundSize: 'cover',
      }}
    >
      {chapter.title}
      {/* <Ink /> buggy on mobile, but why? */}
    </div>
  );
};

export default ChapterSquare;
