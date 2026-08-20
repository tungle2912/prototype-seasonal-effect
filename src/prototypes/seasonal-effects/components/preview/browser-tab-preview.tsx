import { useEffect, useMemo, useRef, useState } from 'react';

import {
  speedFactor,
  STOREFRONT_TAB_TITLE,
  type TabAnimationSettings,
} from '../../../../mocks/seasonal-effects/modules';

/**
 * A fake browser window whose tab title actually animates.
 *
 * The three behaviours are not decoration — they are what the merchant is choosing
 * between, and the names alone do not tell them apart. Three rules from the spec are
 * enforced here rather than described:
 *
 * - It only runs while the shopper is looking at another tab. In the preview that is
 *   simulated by the "shopper switched away" state, because a preview that only
 *   animates when you look away could not be reviewed.
 * - The original title and favicon are captured first and restored exactly, so
 *   coming back leaves no trace.
 * - Reduce-motion shows the first message once, static, instead of cycling.
 *
 * The timers are cancelled on unmount: a hidden admin tab must not keep animating.
 */

interface BrowserTabPreviewProps {
  settings: TabAnimationSettings;
}

export function BrowserTabPreview({ settings }: BrowserTabPreviewProps) {
  const [away, setAway] = useState(true);
  const [title, setTitle] = useState(STOREFRONT_TAB_TITLE);
  const [restingBeat, setRestingBeat] = useState(false);

  const messages = useMemo(
    () => settings.messages.map((message) => message.trim()).filter(Boolean),
    [settings.messages],
  );

  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    // Not away, module off, or nothing written: show the real title and stop.
    if (!away || !settings.enabled || messages.length === 0) {
      setTitle(STOREFRONT_TAB_TITLE);
      setRestingBeat(true);
      return;
    }

    if (reduceMotion.current) {
      setTitle(messages[0] ?? STOREFRONT_TAB_TITLE);
      setRestingBeat(false);
      return;
    }

    let timer = 0;
    let index = 0;
    let step = 0;
    const factor = speedFactor(settings.speed);
    const wait = (ms: number) => Math.round(ms * factor);

    const tick = () => {
      const message = messages[index % messages.length] ?? '';

      if (settings.style === 'BLINKING') {
        // message, then the real title, then the next message.
        if (step === 0) {
          setTitle(message);
          setRestingBeat(false);
          step = 1;
          timer = window.setTimeout(tick, wait(1100));
          return;
        }
        setTitle(STOREFRONT_TAB_TITLE);
        setRestingBeat(true);
        step = 0;
        index += 1;
        timer = window.setTimeout(tick, wait(700));
        return;
      }

      if (settings.style === 'SCROLLING') {
        const ticker = `${message}   •   `;
        const offset = step % ticker.length;
        setTitle(`${ticker.slice(offset)}${ticker.slice(0, offset)}`);
        setRestingBeat(false);
        step += 1;
        if (step % ticker.length === 0) index += 1;
        timer = window.setTimeout(tick, wait(190));
        return;
      }

      // Typing: type it out, hold, delete, next.
      const typed = step <= message.length;
      const length = typed ? step : message.length - (step - message.length - 8);

      if (length < 0) {
        step = 0;
        index += 1;
        timer = window.setTimeout(tick, wait(220));
        return;
      }

      setTitle(`${message.slice(0, Math.max(0, length))}▌`);
      setRestingBeat(false);
      step += 1;
      // A pause once it is fully typed, then the delete run.
      const holding = step > message.length && step <= message.length + 8;
      timer = window.setTimeout(tick, wait(holding ? 130 : 95));
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [away, settings.enabled, settings.style, settings.speed, messages]);

  const favicon =
    settings.faviconMode === 'EMOJI' && settings.enabled && away && !restingBeat
      ? settings.emoji
      : '🕯';

  return (
    <div>
      <div
        style={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #d9d9d9',
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,.08)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Tab strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            padding: '7px 8px 0',
            background: '#dee1e6',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '62%',
              background: '#ffffff',
              borderRadius: '8px 8px 0 0',
              padding: '6px 10px',
              fontSize: '10px',
              color: '#1f1f1f',
            }}
          >
            <span aria-hidden="true">{favicon}</span>
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {title}
            </span>
            <span style={{ color: '#8a8a8a' }}>✕</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#c9ced6',
              borderRadius: '8px 8px 0 0',
              padding: '6px 10px',
              fontSize: '10px',
              color: '#41474f',
            }}
          >
            <span aria-hidden="true">🔎</span>
            <span>Search results</span>
          </div>
        </div>

        {/* Address bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            background: '#f1f3f4',
            borderBottom: '1px solid #e0e0e0',
            fontSize: '9px',
            color: '#6b6b6b',
          }}
        >
          <span
            style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '999px',
              padding: '3px 10px',
              flex: 1,
            }}
          >
            northwindsupply.com
          </span>
        </div>

        {/* Page area */}
        <div style={{ padding: '18px', minHeight: '110px', color: '#1f1f1f' }}>
          {away ? (
            <div style={{ fontSize: '10px', color: '#6b6b6b', lineHeight: 1.6 }}>
              The shopper is on another tab right now. That is the only time the title changes — while
              they are looking at your store, it never moves.
            </div>
          ) : (
            <div style={{ fontSize: '10px', lineHeight: 1.6 }}>
              <b style={{ fontSize: '12px' }}>Northwind Supply</b>
              <div style={{ color: '#6b6b6b', marginTop: '4px' }}>
                Back on your store — the title and favicon are exactly as they were.
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAway((current) => !current)}
        style={{
          marginTop: '10px',
          border: 'var(--p-border-width-025) solid var(--p-color-border)',
          background: 'var(--p-color-bg-surface)',
          color: 'var(--p-color-text)',
          borderRadius: 'var(--p-border-radius-200)',
          padding: 'var(--p-space-150) var(--p-space-300)',
          fontSize: 'var(--p-font-size-325)',
          cursor: 'pointer',
        }}
      >
        {away ? 'Shopper comes back to this tab' : 'Shopper switches to another tab'}
      </button>
    </div>
  );
}
