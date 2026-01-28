import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DreamGrid from '../DreamGrid';

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Trigger with a mock entry
    this.callback(
      [{ target, contentRect: { width: 1000 } } as any],
      this as any,
    );
  }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  // Mock offsetWidth for the container
  Object.defineProperty(HTMLDivElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return 1000;
    },
  });
});

describe('DreamGrid', () => {
  const items = [
    { id: '1', width: 200, height: 300 },
    { id: '2', width: 200, height: 200 },
    { id: '3', width: 200, height: 400 },
  ];

  it('renders items via renderItem', () => {
    render(
      <DreamGrid
        items={items}
        renderItem={(item) => <div data-testid={`item-${item.id}`}>{item.id}</div>}
      />,
    );

    expect(screen.getByTestId('item-1')).toBeInTheDocument();
    expect(screen.getByTestId('item-2')).toBeInTheDocument();
    expect(screen.getByTestId('item-3')).toBeInTheDocument();
  });

  it('renders loader when isLoading', () => {
    render(
      <DreamGrid
        items={[]}
        renderItem={() => null}
        isLoading
        renderLoader={() => <div data-testid="loader">Loading</div>}
      />,
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders empty state when no items', () => {
    render(
      <DreamGrid
        items={[]}
        renderItem={() => null}
        renderEmpty={() => <div data-testid="empty">No items</div>}
      />,
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('applies className to container', () => {
    const { container } = render(
      <DreamGrid
        items={items}
        renderItem={(item) => <div>{item.id}</div>}
        className="my-grid"
      />,
    );

    expect(container.firstElementChild).toHaveClass('dg-container');
    expect(container.firstElementChild).toHaveClass('my-grid');
  });

  it('renders nothing when items array is empty and no renderEmpty', () => {
    const { container } = render(
      <DreamGrid items={[]} renderItem={() => null} />,
    );

    // Container exists but has no children
    const gridContainer = container.querySelector('.dg-container');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer!.children).toHaveLength(0);
  });
});
