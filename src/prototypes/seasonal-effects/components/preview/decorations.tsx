import type { DecorationStyle } from '../../../../mocks/seasonal-effects/effects';

/**
 * The static decoration layer inside the storefront preview.
 *
 * Two rules from the spec are visible here: blinking holds still for a shopper with
 * reduce-motion on (the CSS animation is wrapped in a media query, so the lights
 * stay lit but stop flashing), and the layer sits below the announcement bar rather
 * than over it.
 */

export function DecorationLayer({ style }: { style: DecorationStyle }) {
  if (style === 'STRING_LIGHTS') {
    return (
      <div aria-hidden="true" style={{ position: 'relative', height: '18px', overflow: 'hidden' }}>
        <style>{`
          @keyframes se-twinkle { 0%,100% { opacity: 1 } 50% { opacity: .45 } }
          .se-bulb { animation: se-twinkle 1.6s ease-in-out infinite }
          @media (prefers-reduced-motion: reduce) { .se-bulb { animation: none } }
        `}</style>
        <svg viewBox="0 0 400 18" preserveAspectRatio="none" style={{ width: '100%', height: '18px' }}>
          <path d="M0 4 Q50 14 100 4 T200 4 T300 4 T400 4" fill="none" stroke="#4a4a4a" strokeWidth="1" />
          {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, index) => (
            <circle
              key={x}
              className="se-bulb"
              cx={x}
              cy={index % 2 === 0 ? 9 : 6}
              r="3"
              fill={['#ff5a5a', '#ffd75a', '#5ad4ff', '#7dff8f', '#e07dff'][index % 5]}
              style={{ animationDelay: `${index * 0.18}s` }}
            />
          ))}
        </svg>
      </div>
    );
  }

  if (style === 'GARLAND') {
    return (
      <div aria-hidden="true" style={{ height: '20px', overflow: 'hidden' }}>
        <svg viewBox="0 0 400 20" preserveAspectRatio="none" style={{ width: '100%', height: '20px' }}>
          <path d="M0 6 Q200 22 400 6" fill="none" stroke="#4f7a52" strokeWidth="7" strokeLinecap="round" />
          {[70, 150, 230, 310].map((x) => (
            <circle key={x} cx={x} cy={14} r="2.6" fill="#c0392b" />
          ))}
        </svg>
      </div>
    );
  }

  if (style === 'COBWEBS') {
    return (
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        <svg viewBox="0 0 200 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <g stroke="#b6b6bd" fill="none" strokeWidth="0.8" opacity="0.8">
            <path d="M0 0 L34 26M0 0 L26 34M0 0 L30 30" />
            <path d="M0 12 Q12 12 12 0M0 22 Q22 22 22 0M0 32 Q32 32 32 0" />
            <path d="M200 0 L166 26M200 0 L174 34M200 0 L170 30" />
            <path d="M200 12 Q188 12 188 0M200 22 Q178 22 178 0" />
          </g>
        </svg>
      </div>
    );
  }

  // Snow drift sits at the foot of the page, so it renders as a bottom band.
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '26px', pointerEvents: 'none' }}
    >
      <svg viewBox="0 0 200 26" preserveAspectRatio="none" style={{ width: '100%', height: '26px' }}>
        <path d="M0 12 Q25 2 50 12 T100 12 T150 12 T200 12 L200 26 L0 26 Z" fill="#dfe8f0" />
        <path d="M0 18 Q35 9 70 18 T140 18 T210 18 L210 26 L0 26 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}
