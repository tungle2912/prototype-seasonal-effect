/**
 * What each option in a gallery actually looks like.
 *
 * These are drawings of storefront output, not admin chrome, which is why this
 * folder carries the hex exception: a snowfall tile has to look like snow on a
 * cold background, and a Polaris surface token would make every tile identical
 * grey. Nobody picks "Sparkle" from the word "Sparkle" (PRD 6.0.1).
 */

import { artworkGlyph, type CountdownStyle, type DecorationStyle } from '../../../../mocks/seasonal-effects/effects';
import type { FallingArtwork } from '../../../../mocks/seasonal-effects/effects';
import { artworkTileTint, type SeasonalPalette } from '../../../../mocks/seasonal-effects/palettes';
import type { Preset } from '../../../../mocks/seasonal-effects/presets';
import type { ScrollIcon } from '../../../../mocks/seasonal-effects/scroll-icons';

/** Where the glyphs sit, so a tile reads as "mid-fall" rather than a neat row. */
const SCATTER: [number, number, number][] = [
  [18, 22, 13],
  [52, 14, 10],
  [82, 28, 14],
  [30, 52, 11],
  [66, 58, 15],
  [14, 80, 12],
  [88, 74, 10],
  [48, 84, 13],
];

const fill: React.CSSProperties = { width: '100%', height: '100%', display: 'block' };

export function ArtworkTile({ artwork }: { artwork: FallingArtwork }) {
  const glyph = artworkGlyph(artwork);
  return (
    <span style={{ ...fill, position: 'relative', background: artworkTileTint[artwork] }}>
      {SCATTER.map(([left, top, size], index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            left: `${left}%`,
            top: `${top}%`,
            fontSize: `${size}px`,
            lineHeight: 1,
          }}
        >
          {glyph}
        </span>
      ))}
    </span>
  );
}

export function PresetTile({ preset, hex }: { preset: Preset; hex: string | null }) {
  return (
    <span
      style={{
        ...fill,
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        background: hex ?? '#f4f4f4',
        color: hex ? '#ffffff' : '#8a8a8a',
        fontSize: '22px',
      }}
    >
      <span aria-hidden="true">{preset.glyph}</span>
    </span>
  );
}

export function PaletteTile({ palette }: { palette: SeasonalPalette }) {
  if (!palette.hex) {
    return (
      <span
        style={{
          ...fill,
          display: 'grid',
          placeItems: 'center',
          background: '#f4f4f4',
          color: '#8a8a8a',
          fontSize: '10px',
        }}
      >
        theme
      </span>
    );
  }

  // A block of the colour, with the shapes it actually recolours: a heading bar,
  // a primary button and a sale badge.
  return (
    <span style={{ ...fill, position: 'relative', background: palette.hex }}>
      <i
        style={{
          position: 'absolute',
          left: '8px',
          top: '9px',
          width: '52%',
          height: '6px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,.55)',
        }}
      />
      <i
        style={{
          position: 'absolute',
          left: '8px',
          bottom: '9px',
          width: '32px',
          height: '11px',
          borderRadius: '4px',
          background: '#ffffff',
        }}
      />
      <i
        style={{
          position: 'absolute',
          right: '7px',
          bottom: '11px',
          width: '13px',
          height: '7px',
          borderRadius: '3px',
          background: 'rgba(255,255,255,.75)',
        }}
      />
    </span>
  );
}

const DECORATION_ART: Record<DecorationStyle, React.ReactNode> = {
  STRING_LIGHTS: (
    <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{ ...fill, background: '#fdf7e8' }}>
      <path d="M0 10 Q25 24 50 10 T100 10" fill="none" stroke="#4a4a4a" strokeWidth="1.6" />
      <circle cx="16" cy="17" r="3.4" fill="#ff5a5a" />
      <circle cx="33" cy="19" r="3.4" fill="#ffd75a" />
      <circle cx="50" cy="12" r="3.4" fill="#5ad4ff" />
      <circle cx="67" cy="19" r="3.4" fill="#7dff8f" />
      <circle cx="84" cy="17" r="3.4" fill="#e07dff" />
    </svg>
  ),
  GARLAND: (
    <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{ ...fill, background: '#f0f4ee' }}>
      <path d="M0 20 Q50 40 100 20" fill="none" stroke="#4f7a52" strokeWidth="8" strokeLinecap="round" />
      <circle cx="30" cy="29" r="3" fill="#c0392b" />
      <circle cx="62" cy="31" r="3" fill="#c0392b" />
      <rect x="0" y="40" width="100" height="22" fill="#ffffff" />
    </svg>
  ),
  SNOW_DRIFT: (
    <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{ ...fill, background: '#f2f6fa' }}>
      <path d="M0 44 Q14 34 28 44 T56 44 T84 44 T112 44 L112 62 L0 62 Z" fill="#dfe8f0" />
      <path d="M0 50 Q20 42 40 50 T80 50 T120 50 L120 62 L0 62 Z" fill="#ffffff" />
    </svg>
  ),
  COBWEBS: (
    <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{ ...fill, background: '#f3f3f5' }}>
      <g stroke="#b6b6bd" fill="none" strokeWidth="1.1">
        <path d="M0 0 L34 26M0 0 L26 34M0 0 L30 30" />
        <path d="M0 12 Q12 12 12 0M0 22 Q22 22 22 0M0 32 Q32 32 32 0" />
        <path d="M100 62 L66 36M100 62 L74 28M100 62 L70 32" />
        <path d="M100 50 Q88 50 88 62M100 40 Q78 40 78 62" />
      </g>
    </svg>
  ),
};

export function DecorationTile({ style }: { style: DecorationStyle }) {
  return <>{DECORATION_ART[style]}</>;
}

/**
 * The countdown styles, drawn the way the digits will actually appear on the bar.
 *
 * On a light strip rather than the near-black block this used to be: four solid
 * dark tiles in a row read as a warning, and the thing being chosen here is the
 * *shape* of the digits — which shows better against a quiet background than
 * against a colour competing with the announcement bar it will really sit on.
 */
export function CountdownTile({ style }: { style: CountdownStyle }) {
  const shell: React.CSSProperties = {
    ...fill,
    display: 'grid',
    placeItems: 'center',
    background: '#f2f3f5',
    color: '#31333a',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.02em',
  };

  const chip: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #d5d8dd',
    borderRadius: '3px',
    padding: '2px 4px',
  };

  if (style === 'PILL') {
    return (
      <span style={shell}>
        <span style={{ ...chip, borderRadius: '999px', padding: '3px 10px' }}>02 : 14 : 33</span>
      </span>
    );
  }

  if (style === 'PLAIN') {
    return (
      <span style={shell}>
        <span style={{ fontWeight: 500 }}>ends in 2h 14m 33s</span>
      </span>
    );
  }

  if (style === 'DIGIT_BOXES') {
    return (
      <span style={shell}>
        <span style={{ display: 'flex', gap: '3px' }}>
          {['02', '14', '33'].map((value) => (
            <span key={value} style={chip}>
              {value}
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <span style={shell}>
      <span style={{ display: 'flex', gap: '5px' }}>
        {[
          ['02', 'hrs'],
          ['14', 'min'],
          ['33', 'sec'],
        ].map(([value, unit]) => (
          <span key={unit} style={{ display: 'grid', justifyItems: 'center', gap: '1px' }}>
            <span style={chip}>{value}</span>
            <span style={{ fontSize: '6px', fontWeight: 500, color: '#6b6f76' }}>{unit}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A scroll-to-top icon. The path data is a fixture string, so it goes in through
 * `dangerouslySetInnerHTML` — there is no user input anywhere near it.
 */
export function ScrollIconTile({ icon }: { icon: ScrollIcon }) {
  return (
    <span style={{ ...fill, display: 'grid', placeItems: 'center' }}>
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={icon.strokeWidth || undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: icon.path }}
      />
    </span>
  );
}
