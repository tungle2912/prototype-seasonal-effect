import type { ReactNode } from 'react';

/**
 * Keeps the preview column on screen while the settings column scrolls.
 *
 * A live preview that scrolls out of view is not a live preview. Only the left
 * column moves; this one sticks to the top of the viewport, and scrolls internally
 * if it is ever taller than the window.
 */
export function StickyPreview({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 'var(--p-space-400)',
        maxHeight: 'calc(100vh - var(--p-space-800))',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}
