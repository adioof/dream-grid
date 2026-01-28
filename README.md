# DreamGrid

A high-performance virtualized masonry grid for React. Built with Float64Array-backed layout calculations, GPU-accelerated positioning, and hysteresis-based scroll updates for buttery smooth rendering of 10,000+ items.

## Features

- **Float64Array layout engine** — Column height tracking uses typed arrays for faster numeric operations than plain JavaScript arrays
- **Virtualized rendering** — Only items within the viewport (plus configurable overscan) are rendered to the DOM
- **GPU-accelerated positioning** — Items use `translate3d` transforms and CSS containment (`contain: strict` on container, `layout style paint` on items)
- **Hysteresis-based scroll updates** — 100px threshold prevents re-render thrashing during scroll (configurable)
- **RAF-throttled scroll handler** — At most one layout update per animation frame
- **Built-in infinite scroll** — Optional pagination hook with debounce and threshold control
- **Custom scroll containers** — Works with `window` or any scrollable element via ref
- **Headless hooks** — Use the layout engine without the component for fully custom rendering
- **Tiny bundle** — ~12KB with no dependencies beyond React

## Install

```bash
npm install dream-grid
```

## Quick Start

```tsx
import { DreamGrid } from 'dream-grid';

type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
};

function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <DreamGrid
      items={photos}
      maxColumnCount={4}
      renderItem={(photo) => (
        <img
          src={photo.src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    />
  );
}
```

## Infinite Scroll

```tsx
function InfiniteGallery() {
  const [items, setItems] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const next = await fetchPhotos(items.length);
    setItems((prev) => [...prev, ...next.data]);
    setHasMore(next.hasMore);
    setLoading(false);
  };

  return (
    <DreamGrid
      items={items}
      renderItem={(photo) => <img src={photo.src} alt="" />}
      hasMore={hasMore}
      isFetchingMore={loading}
      onLoadMore={loadMore}
      renderLoader={() => <div>Loading...</div>}
      renderEmpty={() => <div>No photos yet</div>}
    />
  );
}
```

## Custom Scroll Container

```tsx
function ScrollablePanel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflow: 'auto' }}>
      <DreamGrid
        items={items}
        renderItem={(item) => <Card item={item} />}
        scrollContainer={scrollRef}
      />
    </div>
  );
}
```

## Headless Usage

### `useGrid` — Full virtualization without the component

```tsx
import { useGrid } from 'dream-grid';

function CustomGrid({ items }) {
  const { containerRef, dimensions, visibleItems, totalHeight } = useGrid({
    items,
    maxColumnCount: 4,
    overscan: 800,
  });

  return (
    <div
      ref={containerRef}
      style={{ height: totalHeight, position: 'relative' }}
    >
      {visibleItems.map(({ item, pos, transform }) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            transform,
            width: dimensions!.columnWidth,
            height: pos.height,
          }}
        >
          <YourComponent item={item} />
        </div>
      ))}
    </div>
  );
}
```

### `usePositioner` — Layout math only, no DOM

```tsx
import { usePositioner } from 'dream-grid';

function LayoutDebugger({ items, width }) {
  const { positions, totalHeight, dimensions } = usePositioner({
    items,
    containerWidth: width,
    maxColumnCount: 3,
  });

  // positions is an array of { column, top, left, height } for each item
  // Use for canvas rendering, SSR, testing, or anything non-DOM
}
```

### `useInfiniteScroll` — Standalone pagination

```tsx
import { useInfiniteScroll } from 'dream-grid';

useInfiniteScroll({
  fetchNextPage: loadMore,
  hasNextPage: true,
  isFetchingNextPage: false,
  threshold: 1500,
  useWindow: true,
});
```

## API

### `<DreamGrid>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Array of items. Each must have `id: string` and optionally `width`/`height` for aspect ratio |
| `renderItem` | `(item: T, index: number) => ReactNode` | required | Render function for each grid cell |
| `maxColumnCount` | `number` | `5` | Maximum number of columns |
| `isLoading` | `boolean` | `false` | Show loader state |
| `hasMore` | `boolean` | `false` | Whether more items can be loaded |
| `isFetchingMore` | `boolean` | `false` | Whether a load is in progress |
| `onLoadMore` | `() => Promise<unknown>` | — | Called when scroll nears the bottom |
| `scrollContainer` | `MutableRefObject<HTMLElement>` | — | Custom scroll container (defaults to window) |
| `overscan` | `number` | `1000` | Pixels above/below viewport to pre-render |
| `hysteresis` | `number` | `100` | Minimum scroll distance before re-calculating visible items |
| `renderLoader` | `() => ReactNode` | — | Custom loading state |
| `renderEmpty` | `() => ReactNode` | — | Custom empty state |
| `className` | `string` | — | Container class |
| `style` | `CSSProperties` | — | Container style (merged with internal styles) |

### Item Shape

Items must satisfy:

```ts
type GridItem = {
  id: string;
  width?: number;   // intrinsic width (for aspect ratio)
  height?: number;  // intrinsic height (for aspect ratio)
};
```

If `width` and `height` are provided, the grid calculates each item's rendered height to preserve the aspect ratio. If omitted, items render as squares.

## How It Works

1. **Column calculation** — Container width is divided into columns with a minimum width of 240px (with 1.5px gutters)
2. **Masonry positioning** — Items are placed in the shortest column using Float64Array for O(items × columns) layout
3. **Viewport culling** — Only items intersecting `[scrollTop - overscan, scrollTop + viewportHeight + overscan]` are rendered
4. **Scroll throttling** — A `requestAnimationFrame` loop checks scroll position, but only triggers a React update when the viewport moves more than the hysteresis threshold (default 100px)
5. **Resize handling** — A debounced `ResizeObserver` recalculates column dimensions when the container width changes

## License

MIT
