'use client';

import { useEffect, useState } from 'react';
import Ink from 'react-ink';

import { computeBoxModel } from 'ballast/utils/units';

type ClickHandler = () => void;

const Button = ({
  top,
  bottom,
  width,
  text,
  onClick,
  theme,
}: {
  top?: number;
  bottom?: number;
  width: number;
  text: string;
  onClick: ClickHandler;
  theme?: 'dark' | 'bright';
}) => {
  const [dimensions, setDimensions] = useState<{
    top: string;
    bottom: string;
    left: string;
    fontSize: string;
    lineHeight: string;
  }>();

  useEffect(() => {
    setDimensions(
      computeBoxModel({
        top: top || 0,
        bottom: bottom || 0,
        left: (100 - width) / 2,
        fontSize: 5,
        lineHeight: 5,
      })
    );
  }, [top, bottom, width]);

  return (
    <button
      className="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: top !== undefined ? dimensions?.top : top,
        bottom: bottom !== undefined ? dimensions?.bottom : bottom,
        height: 'auto',
        left: dimensions?.left,
        width: `${width}%`,
        backgroundColor:
        theme !== 'bright'
          ? 'rgba(255, 255, 255, 0.78)'
          : 'rgba(0, 0, 0, 0.18)',
        borderRadius: '2px',
        color: 'black',
        padding: '10px',
        fontFamily: 'Averta',
        fontSize: dimensions?.fontSize,
        lineHeight: dimensions?.lineHeight,
        fontWeight: 200,
        textTransform: 'uppercase',
        boxSizing: 'border-box',
        zIndex: 100,
      }}
    >
      {text}
      <Ink />
    </button>
  );
};

export default Button;
