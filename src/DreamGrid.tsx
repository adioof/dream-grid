import React, { memo } from 'react';
import { GridItem as GridItemComponent } from './components/GridItem';
import { useGrid } from './hooks/use-grid';
import { useInfiniteScroll } from './hooks/use-infinite-scroll';
import type { DreamGridProps, GridItem } from './types';

const NOOP = () => {};

const DreamGrid = <T extends GridItem>({
  items,
  renderItem,
  maxColumnCount = 5,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  scrollContainer,
  overscan = 1000,
  hysteresis = 100,
  renderLoader,
  renderEmpty,
  className,
  style,
}: DreamGridProps<T>) => {
  const {
    containerRef,
    dimensions,
    totalHeight,
    visibleItems,
  } = useGrid({
    items,
    maxColumnCount,
    overscan,
    hysteresis,
    scrollContainer,
  });

  useInfiniteScroll({
    containerRef: scrollContainer,
    fetchNextPage: onLoadMore || NOOP,
    hasNextPage: hasMore,
    isFetchingNextPage: isFetchingMore,
    enabled: !!onLoadMore && hasMore,
    threshold: 1500,
    useWindow: !scrollContainer,
    dependencies: [items.length],
  });

  if (isLoading || !dimensions) {
    return (
      <div ref={containerRef} className={className} style={{ width: '100%', ...style }}>
        {renderLoader?.()}
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div ref={containerRef} className={className} style={{ width: '100%', ...style }}>
        {renderEmpty?.()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: totalHeight,
        position: 'relative',
        contain: 'strict',
        ...style,
      }}
    >
      {visibleItems.map(({ item, pos, index, transform }) => (
        <GridItemComponent
          key={item.id}
          transform={transform}
          width={dimensions.columnWidth}
          height={pos.height}
        >
          {renderItem(item, index)}
        </GridItemComponent>
      ))}
    </div>
  );
};

export default memo(DreamGrid) as typeof DreamGrid;
