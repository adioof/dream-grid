export { default as DreamGrid } from './DreamGrid';
export { useGrid } from './hooks/use-grid';
export { usePositioner } from './hooks/use-positioner';
export { useInfiniteScroll } from './hooks/use-infinite-scroll';
export { GridItem as GridItemComponent } from './components/GridItem';

// Utilities
export {
  calculateDimensions,
  calculatePositions,
  filterVisibleItems,
  filterValidItems,
  getScrollPosition,
  boundsChangedSignificantly,
} from './utils';

// Types
export type {
  DreamGridProps,
  GridItem,
  Position,
  Dimensions,
  ViewBounds,
  VisibleItem,
} from './types';

// Constants
export { GUTTER_SIZE, MIN_COLUMN_WIDTH, ITEM_HEIGHT_ESTIMATE } from './types';
