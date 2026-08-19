import { useEffect, useRef, useState } from 'react';

import {
  showAfterFactor,
  type ScrollToTopSettings,
} from '../../../../mocks/seasonal-effects/modules';
import { ScrollButton } from './scroll-button';

/**
 * A storefront page that really scrolls.
 *
 * The two settings that matter most here cannot be judged by reading their names:
 * how far a shopper has to scroll before the button appears, and what the easing
 * feels like on the way back up. So the preview scrolls for real, and clicking the
 * button animates with whatever easing is selected.
 */

const EASINGS = {
  LINEAR: (t: number) => t,
  EASE_OUT: (t: number) => 1 - Math.pow(1 - t, 3),
  EASE_IN_OUT: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  INSTANT: (t: number) => t,
} as const;

const ENTRANCE_CSS = `
  @keyframes se-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes se-slide { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
  @keyframes se-bounce { 0% { transform: translateY(12px) } 60% { transform: translateY(-4px) } 100% { transform: none } }
  @keyframes se-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
  .se-entrance-FADE_IN { animation: se-fade .3s ease both }
  .se-entrance-SLIDE_UP { animation: se-slide .3s ease both }
  .se-entrance-BOUNCE { animation: se-bounce .45s ease both }
  .se-entrance-PULSE { animation: se-pulse 1.6s ease-in-out infinite }
  @media (prefers-reduced-motion: reduce) {
    .se-entrance-FADE_IN, .se-entrance-SLIDE_UP, .se-entrance-BOUNCE, .se-entrance-PULSE { animation: none }
  }
`;

interface ScrollPreviewProps {
  settings: ScrollToTopSettings;
  /** Set when a live campaign's skin takes over the colours. */
  skinHex: string | null;
}

export function ScrollPreview({ settings, skinHex }: ScrollPreviewProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const animation = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const check = () => {
      const threshold = frame.clientHeight * showAfterFactor[settings.showAfter];
      setVisible(settings.enabled && frame.scrollTop > threshold);
    };

    check();
    frame.addEventListener('scroll', check, { passive: true });
    return () => frame.removeEventListener('scroll', check);
  }, [settings.showAfter, settings.enabled]);

  useEffect(() => () => cancelAnimationFrame(animation.current), []);

  const scrollBack = () => {
    const frame = frameRef.current;
    if (!frame) return;

    if (settings.easing === 'INSTANT') {
      frame.scrollTop = 0;
      return;
    }

    cancelAnimationFrame(animation.current);
    const from = frame.scrollTop;
    const start = performance.now();
    const duration = 520;
    const ease = EASINGS[settings.easing];

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      frame.scrollTop = from * (1 - ease(progress));
      if (progress < 1) animation.current = requestAnimationFrame(step);
    };

    animation.current = requestAnimationFrame(step);
  };

  return (
    <div>
      <style>{ENTRANCE_CSS}</style>

      <div
        style={{
          position: 'relative',
          borderRadius: '10px',
          border: '1px solid #d9d9d9',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        }}
      >
        <div
          ref={frameRef}
          style={{
            height: '420px',
            overflowY: 'auto',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#1f1f1f',
          }}
        >
          <div style={{ padding: '14px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '9px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eeeeee',
              }}
            >
              <b style={{ fontSize: '11px' }}>Northwind Supply</b>
              <span style={{ color: '#6b6b6b' }}>Shop · Gifts · About</span>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, padding: '14px 0 4px' }}>
              All products
            </div>
            <div style={{ fontSize: '9px', color: '#6b6b6b', paddingBottom: '12px' }}>
              Scroll down — the button appears once you pass the threshold you chose.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {Array.from({ length: 18 }, (_, index) => (
                <div key={index}>
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      background: index % 3 === 0 ? '#f2efe9' : '#f6f6f6',
                      borderRadius: '6px',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '18px',
                    }}
                    aria-hidden="true"
                  >
                    {['🕯', '☕', '🧶', '🫖', '🧺', '🪵'][index % 6]}
                  </div>
                  <div style={{ fontSize: '7.5px', marginTop: '4px' }}>Product {index + 1}</div>
                  <div style={{ fontSize: '7.5px', fontWeight: 700 }}>
                    ${22 + index * 3}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '16px',
                padding: '14px 0',
                borderTop: '1px solid #eeeeee',
                fontSize: '8.5px',
                color: '#6b6b6b',
                textAlign: 'center',
              }}
            >
              Northwind Supply · Hanoi
            </div>
          </div>
        </div>

        {/* Keyed on the entrance so switching it replays the animation. */}
        <div
          key={`${settings.entrance}-${visible}`}
          className={visible ? `se-entrance-${settings.entrance}` : undefined}
        >
          <ScrollButton
            settings={settings}
            skinHex={skinHex}
            visible={visible}
            onClick={scrollBack}
          />
        </div>
      </div>
    </div>
  );
}
