'use client';

import { useEffect, useState } from 'react';

import { computeBoxModel } from 'ballast/utils/units';
import Link from 'next/link';

type ClickHandler = (bool?: boolean) => void;

const ICONS: { [key: string]: { active: string; inactive?: string } } = {
  sound: {
    active: 'sound-on.svg',
    inactive: 'sound-off.svg',
  },
  home: {
    active: 'home.svg',
  },
  book: {
    active: 'book-icon.svg',
  },
};

const BarButton = ({
  role,
  kind,
  width,
  height,
  onClick = () => {},
  href = '/',
  active = false,
  hide,
}: {
  width: number;
  height?: number;
  role: 'sound' | string;
  kind: 'toggle' | 'link' | 'button';
  onClick?: ClickHandler;
  href?: string;
  active?: boolean;
  hide: boolean;
}) => {
  const [dimensions, setDimensions] = useState<{
    height: string;
    width: string;
  }>();

  useEffect(() => {
    setDimensions(
      computeBoxModel({
        height: height || width,
        width,
      })
    );
  }, [width, height]);

  switch (kind) {
    case 'toggle': {
      return (
        <button
          className="button"
          onClick={() => onClick?.()}
          style={{
            opacity: hide ? 0 : 0.8,
            transition: 'opacity 1s ease',
            position: 'relative',
            height: dimensions?.height,
            width: dimensions?.width,
            boxSizing: 'border-box',
            margin: '5px',
            zIndex: 1,
            backgroundSize: 'cover',
            filter: 'hue-rotate(10)',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(/images/${
              ICONS[role][active ? 'active' : 'inactive']
            })`,
          }}
        ></button>
      );
    }
    case 'link': {
      return (
        <Link href={href}>
          <div
            className="button"
            onClick={() => onClick?.()}
            style={{
              opacity: 0.8,
              position: 'relative',
              height: dimensions?.height,
              width: dimensions?.width,
              boxSizing: 'border-box',
              margin: '5px',
              zIndex: 1,
              backgroundSize: 'cover',
              filter: 'hue-rotate(10)',
              backgroundRepeat: 'no-repeat',
              backgroundImage: `url(/images/${ICONS[role].active})`,
            }}
          />
        </Link>
      );
    }
    default: {
      return (
        <button
          className="button"
          onClick={() => onClick?.()}
          style={{
            opacity: 0.8,
            position: 'relative',
            height: dimensions?.height,
            width: dimensions?.width,
            boxSizing: 'border-box',
            margin: '5px',
            zIndex: 1,
            backgroundSize: 'cover',
            filter: 'hue-rotate(10)',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(/images/${ICONS[role].active})`,
          }}
        />
      );
    }
  }
};

export default BarButton;
