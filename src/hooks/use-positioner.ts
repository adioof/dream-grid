import { useMemo } from 'react';
import type { Dimensions, GridItem } from '../types';
import { calculateDimensions, calculatePositions, filterValidItems } from '../utils';

interface UsePositionerOptions<T extends GridItem> {
  items: T[];
  containerWidth: number;
  maxColumnCount?: number;
}

export function usePositioner<T extends GridItem>({
  items,
  containerWidth,
  maxColumnCount = 5,
}: UsePositionerOptions<T>) {
  const dimensions = useMemo(
    () => calculateDimensions(containerWidth, maxColumnCount),
    [containerWidth, maxColumnCount],
  );

  const validItems = useMemo(() => filterValidItems(items), [items]);

  const { positions, totalHeight } = useMemo(() => {
    if (!dimensions || validItems.length === 0) {
      return { positions: [] as never[], totalHeight: 0 };
    }
    return calculatePositions(validItems, dimensions);
  }, [validItems, dimensions]);

  return { dimensions, positions, totalHeight, validItems };
}
