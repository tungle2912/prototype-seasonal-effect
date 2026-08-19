import { useEffect, useRef, useState } from 'react';

import type { CountdownStyle } from '../../../../mocks/seasonal-effects/effects';
import { TODAY, toDate } from '../../../../mocks/seasonal-effects/today';

/**
 * The live countdown on the announcement bar.
 *
 * The remaining time is measured from the pinned demo "today" so the number always
 * starts where the demo intends, then ticks in real time so the preview is alive.
 * It never resets per session: a deadline that restarts for every visitor is
 * misleading advertising, and it is treated as such in the EU and the UK.
 */

interface CountdownProps {
  style: CountdownStyle;
  /** Local datetime the countdown ends at, or null to show a stock demo duration. */
  endsAt: string | null;
  /** Text colour on the bar. */
  colour: string;
}

const DEMO_SECONDS = 9 * 3600 + 41 * 60 + 12;

export function Countdown({ style, endsAt, colour }: CountdownProps) {
  const initial = useRef(
    endsAt
      ? Math.max(0, Math.round((toDate(endsAt).getTime() - TODAY.getTime()) / 1000))
      : DEMO_SECONDS,
  );
  const [seconds, setSeconds] = useState(initial.current);

  useEffect(() => {
    const next = endsAt
      ? Math.max(0, Math.round((toDate(endsAt).getTime() - TODAY.getTime()) / 1000))
      : DEMO_SECONDS;
    initial.current = next;
    setSeconds(next);
  }, [endsAt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  const parts: [string, string][] = days
    ? [
        [pad(days), 'days'],
        [pad(hours), 'hrs'],
        [pad(minutes), 'min'],
      ]
    : [
        [pad(hours), 'hrs'],
        [pad(minutes), 'min'],
        [pad(secs), 'sec'],
      ];

  if (style === 'PLAIN') {
    return (
      <span style={{ color: colour, fontVariantNumeric: 'tabular-nums' }}>
        {days
          ? `ends in ${days}d ${hours}h ${minutes}m`
          : `ends in ${hours}h ${minutes}m ${pad(secs)}s`}
      </span>
    );
  }

  if (style === 'PILL') {
    return (
      <span
        style={{
          background: 'rgba(255,255,255,.2)',
          color: colour,
          borderRadius: '999px',
          padding: '2px 9px',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {parts.map(([value]) => value).join(' : ')}
      </span>
    );
  }

  if (style === 'DIGIT_BOXES') {
    return (
      <span style={{ display: 'inline-flex', gap: '4px' }}>
        {parts.map(([value, unit]) => (
          <span
            key={unit}
            style={{
              background: 'rgba(255,255,255,.2)',
              color: colour,
              borderRadius: '3px',
              padding: '2px 5px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', gap: '6px' }}>
      {parts.map(([value, unit]) => (
        <span key={unit} style={{ display: 'grid', justifyItems: 'center', lineHeight: 1.1 }}>
          <span
            style={{
              background: 'rgba(255,255,255,.2)',
              color: colour,
              borderRadius: '3px',
              padding: '2px 5px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </span>
          <span style={{ color: colour, opacity: 0.75, fontSize: '7px' }}>{unit}</span>
        </span>
      ))}
    </span>
  );
}
