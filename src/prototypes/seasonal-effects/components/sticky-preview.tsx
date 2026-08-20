import type { ReactNode } from 'react';

import { useChromeHidden } from '../../../shell/chrome-state';

/**
 * Keeps the preview on screen while the settings column scrolls.
 *
 * Two things have to be true before `position: sticky` does anything, and both
 * were missing:
 *
 * - **The column has to be taller than this box.** Polaris' `Layout` is a flex
 *   row with `align-items: flex-start`, so its one-third rail is only as tall as
 *   its own content and a sticky child has nowhere to travel — it looked pinned
 *   and behaved like a normal card. The editor screens use `InlineGrid` instead,
 *   whose items stretch to the row height, and the outer div here takes it.
 * - **The admin top bar is `position: fixed`.** Sticking to `top: 0` would slide
 *   the preview under it, so the offset clears the bar — except with
 *   `?chrome=off`, where there is no bar to clear.
 */
export function StickyPreview({ children }: { children: ReactNode }) {
  const chromeHidden = useChromeHidden();
  const top = chromeHidden
    ? 'var(--p-space-400)'
    : 'calc(var(--pg-top-bar-height, 3.5rem) + var(--p-space-400))';

  return (
    <div style={{ height: '100%' }}>
      <div
        style={{
          position: 'sticky',
          top,
          // The safety valve: if a preview is ever taller than the window it
          // scrolls inside itself rather than dragging the page down with it.
          maxHeight: `calc(100vh - ${top} - var(--p-space-400))`,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
