'use client';

import { useEffect, useState } from 'react';
import Ink from 'react-ink';
import Link from 'next/link';

import { computeBoxModel } from 'ballast/utils/units';

type ClickHandler = () => void;

const LinkButton = ({
  top,
  bottom,
  width,
  text,
  href,
  onClick,
  theme,
}: {
  top?: number;
  bottom?: number;
  width: number;
  text: string;
  href: string;
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
    <Link href={href}>
      <div 
        onClick={onClick}
        className="button"
        style={{
          position: 'absolute',
          top: top !== undefined ? dimensions?.top : top,
          bottom: bottom !== undefined ? dimensions?.bottom : bottom,
          height: 'auto',
          left: dimensions?.left,
          width: `${width}%`,
          backgroundColor:
            theme !== 'bright'
              ? 'rgba(255, 255, 255, 0.98)'
              : 'rgba(0, 0, 0, 0.18)',
          borderRadius: '2px',
          textAlign: 'center',
         color: 'black',
          padding: '10px',
          fontFamily: 'Averta',
          fontSize: dimensions?.fontSize,
          lineHeight: dimensions?.lineHeight,
          fontWeight: 200,
          textTransform: 'uppercase',
          boxSizing: 'border-box',
          zIndex: 2000,
        }}
      >
        {text}
        <Ink />
      </div>
    </Link>
  );
};

export default LinkButton;
