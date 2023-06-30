'use client';

import { useEffect, useState } from 'react';
import Ink from 'react-ink';
import Link from 'next/link';

import { computeBoxModel } from 'ballast/utils/units';

type ClickHandler = () => void;

const LinkButton = ({
  top,
  width,
  text,
  href,
  onClick,
  theme,
}: {
  top: number;
  width: number;
  text: string;
  href: string;
  onClick: ClickHandler;
  theme?: 'dark' | 'bright';
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
    <Link href={href}>
      <div 
        onClick={onClick}
        className="button"
        style={{
          position: 'absolute',
          top: dimensions?.top,
          height: 'auto',
          left: dimensions?.left,
          width: `${width}%`,
          backgroundColor:
            theme !== 'bright'
              ? 'rgba(255, 255, 255, 0.78)'
              : 'rgba(0, 0, 0, 0.18)',
          borderRadius: '2px',
          textAlign: 'center',
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
      </div>
    </Link>
  );
};

export default LinkButton;
