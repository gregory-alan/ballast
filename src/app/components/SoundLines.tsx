import GeoPattern from 'geopattern';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

import {
  Sound,
  Sounds,
  SoundKind,
  SoundAction,
} from 'ballast/types/AudioService';
import { computeBoxModel } from 'ballast/utils/units';

const SHOW_SOUNDLINES = true;

type SoundLineHandler = (
  action: SoundAction,
  slug: string,
  kind: SoundKind
) => void;
type SoundLine = Sound & {
  action: SoundAction;
};

const SoundLine = ({
  start,
  end,
  col,
  soundSlug,
  action,
  color,
  kind,
  onEnter,
  onExit,
  isVisible,
}: {
  start: number;
  end: number;
  col: number;
  action: SoundAction;
  soundSlug: string;
  color: string;
  kind: SoundKind;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  isVisible: boolean;
}) => {
  const pattern = GeoPattern.generate(soundSlug, {
    color: action === 'play' && kind === 'toneplayer' ? '#eee' : color,
  });
  const [preventFirstExitCall, setPreventFirstExitCall] =
    useState<boolean>(true);
  const [dimensions, setDimensions] = useState<{
    top: string;
    left: string;
    width: string;
    height: string;
  }>();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    setDimensions(
      computeBoxModel({
        top: start,
        width: 10,
        height: end - start,
        left: 10 * col,
      })
    );
  }, [start, end, col]);

  useEffect(() => {
    if (inView) {
      onEnter(action, soundSlug, kind);
    } else {
      if (!preventFirstExitCall) {
        onExit(action, soundSlug, kind);
      }
      setPreventFirstExitCall(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div
      ref={ref}
      className="soundline"
      style={{
        position: 'absolute',
        top: dimensions?.top,
        height: dimensions?.height,
        left: dimensions?.left,
        width: dimensions?.width,
        backgroundColor: 'transparent',
        background: isVisible ? pattern.toDataUrl() : 'transparent',
        padding: '10px',
        boxSizing: 'border-box',
        color: isVisible ? 'white' : 'transparent',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        zIndex: 100,
        display: SHOW_SOUNDLINES ? 'block' : 'none',
      }}
    >
      {start}-{end}&nbsp;&nbsp;&nbsp;{soundSlug}
    </div>
  );
};

const SoundLinesColumn = ({
  soundLines,
  n,
  onEnter,
  onExit,
  isVisible,
}: {
  soundLines: SoundLine[];
  n: number;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  isVisible: boolean;
}) => {
  return (
    <div className="soundlines-column relative top-0">
      {soundLines.map(({ start, end, color, kind, slug, action }, i) => (
        <SoundLine
          key={i}
          start={start}
          end={end}
          col={n}
          action={action}
          kind={kind}
          soundSlug={slug}
          color={color}
          onEnter={onEnter}
          onExit={onExit}
          isVisible={isVisible}
        />
      ))}
    </div>
  );
};

export default function SoundLines({
  sounds,
  onEnter,
  onExit,
  isVisible,
}: {
  sounds: Sounds;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  isVisible: boolean;
}) {
  const createSoundLines = (sounds: Sounds): SoundLine[][] => {
    const soundLines = Array.from(
      new Array(10),
      () => [] as unknown as SoundLine[]
    );

    sounds.forEach((sound) => {
      const { start, end } = sound;
      for (let i = 0; i < soundLines.length; i++) {
        const column = soundLines[i] as SoundLine[];
        if (!column.find(({ end }) => start < end)) {
          column.push({
            ...sound,
            action: 'play',
          });
          sound.sessions.forEach((session) => {
            if (session[0] < start || session[1] > end) {
              throw new Error(
                `sound ${sound.slug}'s data is incorrect: one or more sessions is out of bounds.`
              );
            }
            if (sound.kind === 'toneplayer') {
              column.push({
                ...{ ...sound, start: session[0], end: session[1] },
                action: 'mute',
              });
            }
          });
          return;
        }
      }
    });
    console.log('🖍️', soundLines);
    return soundLines;
  };

  return (
    <main className="absolute top-0 left-0 flex flex-row content-start items-start">
      {createSoundLines(sounds).map((column, n) => (
        <SoundLinesColumn
          key={n}
          soundLines={column}
          n={n}
          onEnter={onEnter}
          onExit={onExit}
          isVisible={isVisible}
        />
      ))}
    </main>
  );
}
