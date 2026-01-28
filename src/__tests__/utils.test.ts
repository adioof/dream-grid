import { describe, it, expect } from 'vitest';
import {
  calculateDimensions,
  calculatePositions,
  filterVisibleItems,
  filterValidItems,
  getScrollPosition,
  boundsChangedSignificantly,
} from '../utils';

describe('calculateDimensions', () => {
  it('returns null for zero width', () => {
    expect(calculateDimensions(0, 5)).toBeNull();
  });

  it('calculates correct column count and width', () => {
    const dims = calculateDimensions(1000, 5);
    expect(dims).not.toBeNull();
    expect(dims!.columnCount).toBeGreaterThanOrEqual(2);
    expect(dims!.columnCount).toBeLessThanOrEqual(5);
    expect(dims!.columnWidth).toBeGreaterThan(0);
  });

  it('respects maxColumnCount', () => {
    const dims = calculateDimensions(5000, 3);
    expect(dims!.columnCount).toBeLessThanOrEqual(3);
  });

  it('enforces minimum of 2 columns', () => {
    const dims = calculateDimensions(300, 5);
    expect(dims!.columnCount).toBeGreaterThanOrEqual(2);
  });
});

describe('calculatePositions', () => {
  it('positions items in masonry layout', () => {
    const items = [
      { width: 200, height: 300 },
      { width: 200, height: 200 },
      { width: 200, height: 400 },
      { width: 200, height: 100 },
    ];
    const dims = { columnCount: 2, columnWidth: 200 };
    const { positions, totalHeight } = calculatePositions(items, dims);

    expect(positions).toHaveLength(4);
    expect(totalHeight).toBeGreaterThan(0);

    // First two items should be in columns 0 and 1
    expect(positions[0].column).toBe(0);
    expect(positions[1].column).toBe(1);
    expect(positions[0].top).toBe(0);
    expect(positions[1].top).toBe(0);
  });

  it('places items in shortest column', () => {
    const items = [
      { width: 100, height: 300 }, // tall — col 0
      { width: 100, height: 100 }, // short — col 1
      { width: 100, height: 100 }, // should go to col 1 (shorter)
    ];
    const dims = { columnCount: 2, columnWidth: 100 };
    const { positions } = calculatePositions(items, dims);

    expect(positions[2].column).toBe(1);
  });

  it('renders square when no dimensions provided', () => {
    const items = [{}];
    const dims = { columnCount: 2, columnWidth: 250 };
    const { positions } = calculatePositions(items, dims);

    expect(positions[0].height).toBe(250); // square = columnWidth
  });

  it('uses aspectRatio when width/height not provided', () => {
    const items = [{ aspectRatio: 2 }]; // 2:1 landscape
    const dims = { columnCount: 2, columnWidth: 400 };
    const { positions } = calculatePositions(items, dims);

    expect(positions[0].height).toBe(200); // 400 / 2
  });

  it('prefers width/height over aspectRatio', () => {
    const items = [{ width: 400, height: 200, aspectRatio: 1 }];
    const dims = { columnCount: 2, columnWidth: 400 };
    const { positions } = calculatePositions(items, dims);

    expect(positions[0].height).toBe(200); // from w/h, not aspectRatio
  });
});

describe('filterVisibleItems', () => {
  it('returns only items within view bounds', () => {
    const items = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ];
    const positions = [
      { column: 0, top: 0, height: 100, left: 0 },
      { column: 0, top: 500, height: 100, left: 0 },
      { column: 0, top: 2000, height: 100, left: 0 },
    ];
    const bounds = { top: 0, bottom: 700 };

    const visible = filterVisibleItems(items, positions, bounds);

    expect(visible).toHaveLength(2);
    expect(visible[0].item.id).toBe('a');
    expect(visible[1].item.id).toBe('b');
  });

  it('returns empty array when nothing is visible', () => {
    const items = [{ id: 'a' }];
    const positions = [{ column: 0, top: 5000, height: 100, left: 0 }];
    const bounds = { top: 0, bottom: 500 };

    expect(filterVisibleItems(items, positions, bounds)).toHaveLength(0);
  });

  it('includes transform string', () => {
    const items = [{ id: 'a' }];
    const positions = [{ column: 0, top: 50, height: 100, left: 120 }];
    const bounds = { top: 0, bottom: 500 };

    const visible = filterVisibleItems(items, positions, bounds);
    expect(visible[0].transform).toBe('translate3d(120px,50px,0)');
  });
});

describe('filterValidItems', () => {
  it('filters out null and items without id', () => {
    const items = [
      { id: '1' },
      null as any,
      undefined as any,
      { id: null } as any,
      { id: '2' },
    ];
    const valid = filterValidItems(items);
    expect(valid).toHaveLength(2);
    expect(valid[0].id).toBe('1');
    expect(valid[1].id).toBe('2');
  });
});

describe('boundsChangedSignificantly', () => {
  it('returns false for small changes', () => {
    const prev = { top: 100, bottom: 800 };
    const next = { top: 130, bottom: 830 };
    expect(boundsChangedSignificantly(prev, next, 100)).toBe(false);
  });

  it('returns true when threshold exceeded', () => {
    const prev = { top: 100, bottom: 800 };
    const next = { top: 250, bottom: 950 };
    expect(boundsChangedSignificantly(prev, next, 100)).toBe(true);
  });
});

describe('getScrollPosition', () => {
  it('calculates bounds for an HTML element', () => {
    const el = {
      scrollTop: 500,
      clientHeight: 800,
    } as HTMLElement;

    const bounds = getScrollPosition(el, 100, 200);
    // relativeScrollTop = 500 - 100 = 400
    expect(bounds.top).toBe(200);   // 400 - 200
    expect(bounds.bottom).toBe(1400); // 400 + 800 + 200
  });
});
