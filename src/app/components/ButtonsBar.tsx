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
}: {
  top: number;
  right: number;
  width: number;
  isOpen: boolean;
  audioMuted: boolean;
  onExit: () => void;
  clickHandler: () => void;
  muteAudioHandler: () => void;
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
    setDimensions(
      computeBoxModel({
        top,
        height: width,
        right,
        width,
        containerWidth: width * 2.8,
        containerRight: right + 5,
      })
    );
  }, [top, right, width]);

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
          borderLeft: '2px solid white',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(/images/logo-icon.png)',
          filter: 'grayscale(0.3)',
        }}
      >
        <Ink />
      </button>
      <div
        className="buttons-container"
        style={{
          opacity: 1,
          overflow: 'hidden',
          position: 'fixed',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '10px',
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
          backgroundColor: '#080908',
          filter: 'grayscale(0.3)',
          transition: 'all 300ms',
        }}
      >
        <BarButton
          role="home"
          kind="link"
          href="/"
          width={BUTTON_WIDTH}
          onClick={onExit}
        />
        <BarButton
          role="sound"
          kind="toggle"
          active={audioMuted}
          onClick={muteAudioHandler}
          width={BUTTON_WIDTH}
        />
      </div>
    </>
  );
};

export default ButtonsBar;
