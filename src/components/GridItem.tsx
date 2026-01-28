import React, { memo } from 'react';

export const GridItem = memo(
  function GridItem({
    children,
    transform,
    width,
    height,
  }: {
    children: React.ReactNode;
    transform: string;
    width: number;
    height: number;
  }) {
    return (
      <div
        style={{
          position: 'absolute',
          contain: 'layout style paint',
          willChange: 'transform',
          transform,
          width,
          height,
        }}
      >
        {children}
      </div>
    );
  },
  (prev, next) =>
    prev.transform === next.transform &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.children === next.children,
);
