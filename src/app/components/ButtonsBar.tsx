'use client';

import { useEffect, useState } from 'react';
import Ink from 'react-ink';

import BarButton from 'ballast/app/components/BarButton';
import { computeBoxModel } from 'ballast/utils/units';

const BUTTON_WIDTH = 7;

const ButtonsBar = ({
  top,
  right,
  width,
  isOpen,
  audioMuted,
  onExit,
  clickHandler,
  muteAudioHandler,
  book,
  hide,
}: {
  top: number;
  right: number;
  width: number;
  isOpen: boolean;
  audioMuted: boolean;
  onExit: () => void;
  clickHandler: () => void;
  muteAudioHandler: () => void;
  book?: string;
  hide?: { book?: boolean; home?: boolean; sound?: boolean };
}) => {
  const [dimensions, setDimensions] = useState<{
    top: string;
    height: string;
    right: string;
    width: string;
    containerWidth: string;
    containerRight: string;
  }>();

  useEffect(() => {
    const length = 3 - Object.values(hide || {}).filter((val) => !!val).length;
    setDimensions(
      computeBoxModel({
        top,
        height: width,
        right,
        width,
        containerWidth: width * (length + 0.7),
        containerRight: right + 5,
      })
    );
  }, [top, right, width, hide]);

  return (
    <>
      <button
        className="button"
        onClick={clickHandler}
        style={{
          opacity: 1,
          position: 'fixed',
          top: dimensions?.top,
          height: dimensions?.height,
          right: dimensions?.right,
          width: dimensions?.width,
          borderRadius: 180,
          color: 'white',
          boxSizing: 'border-box',
          zIndex: 201,
          overflow: 'visible',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(/images/logo-icon.svg)',
          filter: 'grayscale(1)',
        }}
      >
        <Ink />
      </button>
      <div
        className="buttons-container"
        style={{
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          position: 'fixed',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: isOpen ? '10px' : 0,
          top: dimensions?.top,
          height: dimensions?.height,
          right: dimensions?.containerRight,
          width: isOpen ? dimensions?.containerWidth : 0,
          borderTopLeftRadius: 180,
          borderBottomLeftRadius: 180,
          color: 'white',
          boxSizing: 'border-box',
          zIndex: 200,
          border: '1px solid #eeeeeeee',
          borderRight: 'none',
          background:
            'linear-gradient(90deg, rgba(8,9,8,1) 0%, rgba(8,9,8,1) 86%, rgba(8,9,8,0) 100%)',
          filter: 'grayscale(0.3)',
          transition: 'all 300ms',
        }}
      >
        {!hide?.home && (
          <BarButton
            role="home"
            kind="link"
            href="/"
            width={BUTTON_WIDTH}
            onClick={onExit}
          />
        )}
        {!hide?.book && (
          <BarButton
            role="book"
            kind="link"
            href={`/${book}`}
            onClick={onExit}
            width={BUTTON_WIDTH}
            height={BUTTON_WIDTH - 0.7}
          />
        )}
        {!hide?.sound && (
          <BarButton
            role="sound"
            kind="toggle"
            active={audioMuted}
            onClick={muteAudioHandler}
            width={BUTTON_WIDTH}
          />
        )}
      </div>
    </>
  );
};

export default ButtonsBar;
