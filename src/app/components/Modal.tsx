'use client';

import { PropsWithChildren, useEffect, useState } from 'react';

import { computeBoxModel } from 'ballast/utils/units';

type ClickHandler = () => void;

const Modal = ({
  top,
  width,
  height,
  backgroundSource,
  isVisible,
  onClick,
  children,
}: PropsWithChildren<{
  top: number;
  width: number;
  height: number;
  backgroundSource: string;
  isVisible: boolean;
  onClick?: ClickHandler;
}>) => {
  const [dimensions, setDimensions] = useState<{
    top: string;
    left: string;
    width: string;
    height: string;
  }>();

  useEffect(() => {
    setDimensions(
      computeBoxModel({
        top,
        width,
        height,
        left: (100 - width) / 2,
      })
    );
  }, [top, width, height]);

  return (
    <div
      className="modal"
      onClick={onClick}
      style={{
        position: 'relative',
        top: dimensions?.top,
        width: dimensions?.width,
        height: dimensions?.height,
        backgroundImage: `url(/images/${backgroundSource})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        borderRadius: '2px',
        zIndex: 1500,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default Modal;
