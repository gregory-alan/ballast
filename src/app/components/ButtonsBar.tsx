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
  bookPath,
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
  bookPath?: string;
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
        containerWidth: width * (length + 1.7) - 5,
        containerRight: right + 0.5,
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
          zIndex: 10001,
          overflow: 'visible',
          // backgroundColor: '#595959',
          backgroundColor: isOpen ? '#595959' : 'transparent',
          transition: 'background-color 500ms easeInOut',
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
          borderTopRightRadius: 180,
          borderBottomRightRadius: 180,
          color: 'white',
          boxSizing: 'border-box',
          zIndex: 10000,
          borderLeft: '0.5px solid #eee',
          borderTop: '0.5px solid #eee',
          borderBottom: '0.5px solid #eee',
          
          background:
            'linear-gradient(90deg, rgba(8,9,8,1) 0%, rgba(8,9,8,1) 85%, rgba(8,9,8,0) 86%, rgba(8,9,8,0) 100%)',
          filter: 'grayscale(0.3)',
          transition: 'all 300ms ease',
        }}
      >
        {!hide?.home && (
          <BarButton
            role="home"
            kind="link"
            href="/"
            width={BUTTON_WIDTH}
            onClick={onExit}
            hide={!isOpen}
          />
        )}
        {!hide?.book && (
          <BarButton
            role="book"
            kind="link"
            href={bookPath}
            onClick={onExit}
            width={BUTTON_WIDTH}
            height={BUTTON_WIDTH - 0.7}
            hide={!isOpen}
          />
        )}
        {!hide?.sound && (
          <BarButton
            role="sound"
            kind="toggle"
            active={audioMuted}
            onClick={muteAudioHandler}
            width={BUTTON_WIDTH}
            hide={!isOpen}
          />
        )}
      </div>
    </>
  );
};

export default ButtonsBar;
