import GeoPattern from 'geopattern';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import {
  Sound,
  Sounds,
  SoundAction,
} from 'ballast/types/AudioService';
import { computeBoxModel } from 'ballast/utils/units';

const SHOW_SOUNDLINES = true;

type SoundLineHandler = (action: SoundAction, slug: string) => void;
type SoundLine = Sound & {
  action: SoundAction[];
};

const SoundLine = ({
  start,
  end,
  col,
  soundSlug,
  actions,
  color,
  onEnter,
  onExit,
  onClick,
  isVisible,
}: {
  start: number;
  end: number;
  col: number;
  actions: SoundAction[];
  soundSlug: string;
  color: string;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  onClick: (slug: string) => void;
  isVisible: boolean;
}) => {
  const pattern = GeoPattern.generate(soundSlug, {
    color:
      actions.includes(SoundAction.TONEPLAYER_IN) ||
      actions.includes(SoundAction.HOWL_IN)
        ? color
        : '#eee',
  });
  const [dimensions, setDimensions] = useState<{
    top: string;
    left: string;
    width: string;
    height: string;
  }>();
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const debounced = useDebouncedCallback((inView: boolean) => {
    if (inView) {
      onEnter(actions[0], soundSlug);
    } else {
      onExit(actions[1], soundSlug);
    }
  }, 100);

  // intersection observable effect
  useEffect(() => {
    debounced(inView);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // box model effect
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

  return (
    <div
      ref={ref}
      className="soundline"
      onClick={() => onClick(soundSlug)}
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
        userSelect: 'none',
        color: !isVisible
          ? 'transparent'
          : actions.includes(SoundAction.TONEPLAYER_GHOST_IN)
          ? 'black'
          : 'white',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        zIndex: 5000,
        display: SHOW_SOUNDLINES ? 'block' : 'none',
      }}
    >
      <strong>{soundSlug}</strong> ({start} {`->`} {end},{' '}
      {actions.includes(SoundAction.HOWL_IN) && '𝗛𝗣'}
      {actions.includes(SoundAction.TONEPLAYER_IN) && '𝗧𝗣𝗣'}
      {actions.includes(SoundAction.TONEPLAYER_GHOST_IN) && '𝗧𝗣𝗠'})
    </div>
  );
};

const SoundLinesColumn = ({
  soundLines,
  n,
  onEnter,
  onExit,
  onClick,
  isVisible,
}: {
  soundLines: SoundLine[];
  n: number;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  onClick: (slug: string) => void;
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
          actions={action}
          soundSlug={slug}
          color={color}
          onEnter={onEnter}
          onExit={onExit}
          onClick={onClick}
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
  onClick,
  isVisible,
}: {
  sounds: Sounds;
  onEnter: SoundLineHandler;
  onExit: SoundLineHandler;
  onClick: (slug: string) => void;
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
            action:
              sound.kind === 'howl'
                ? [SoundAction.HOWL_IN, SoundAction.HOWL_OUT]
                : [
                    SoundAction.TONEPLAYER_GHOST_IN,
                    SoundAction.TONEPLAYER_GHOST_OUT,
                  ],
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
                action: [SoundAction.TONEPLAYER_IN, SoundAction.TONEPLAYER_OUT],
              });
            }
          });
          return;
        }
      }
    });

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
          onClick={onClick}
          isVisible={isVisible}
        />
      ))}
    </main>
  );
}
