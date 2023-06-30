'use client';

import { useEffect, useState } from 'react';
import Ink from 'react-ink';

import { computeBoxModel } from 'ballast/utils/units';

type ClickHandler = () => void;

const Button = ({
  top,
  width,
  text,
  onClick,
}: {
  top: number;
  width: number;
  text: string;
  onClick: ClickHandler;
  loading?: boolean;
}) => {
  const [dimensions, setDimensions] = useState<{
    top: string;
    left: string;
    fontSize: string;
    lineHeight: string;
  }>();

  useEffect(() => {
    setDimensions(
      computeBoxModel({
        top,
        left: (100 - width) / 2,
        fontSize: 5,
        lineHeight: 5,
      })
    );
  }, [top, width]);
  
  return (
    <button
      className="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: dimensions?.top,
        height: 'auto',
        left: dimensions?.left,
        width: `${width}%`,
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
        borderRadius: '2px',
        color: 'black',
        padding: '10px',
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
