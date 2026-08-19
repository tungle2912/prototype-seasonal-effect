import { useState } from 'react';

import {
  shapeRadius,
  sizePx,
  type ScrollToTopSettings,
} from '../../../../mocks/seasonal-effects/modules';
import { scrollIconById } from '../../../../mocks/seasonal-effects/scroll-icons';

/**
 * The scroll-to-top button as a shopper sees it.
 *
 * Every colour has a hover twin, and the preview really swaps them on hover — that
 * is the only way to catch the pairing that goes invisible, like white on white. The
 * same component draws the button in the storefront preview and on the module
 * screen, so the two can never disagree.
 */

interface ScrollButtonProps {
  settings: ScrollToTopSettings;
  /** Set when a live campaign's seasonal skin overrides the configured colours. */
  skinHex?: string | null;
  onClick?: () => void;
  /** Absolute placement is handled by the caller when it needs to differ. */
  absolute?: boolean;
  visible?: boolean;
}

export function ScrollButton({
  settings,
  skinHex,
  onClick,
  absolute = true,
  visible = true,
}: ScrollButtonProps) {
  const [hover, setHover] = useState(false);
  const icon = scrollIconById(settings.iconId);
  const size = sizePx[settings.size];

  const overridden = Boolean(skinHex) && settings.matchSeasonalSkin;
  const background = overridden
    ? (skinHex as string)
    : hover
      ? settings.backgroundHoverColour
      : settings.backgroundColour;

  const foreground = overridden
    ? '#ffffff'
    : hover
      ? settings.iconHoverColour
      : settings.iconColour;

  const border = hover ? settings.borderHoverColour : settings.borderColour;

  const showIcon = settings.content !== 'TEXT';
  const showText = settings.content !== 'ICON';

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        position: absolute ? 'absolute' : 'relative',
        ...(absolute
          ? {
              bottom: `${settings.offsetY}px`,
              ...(settings.position === 'BOTTOM_RIGHT'
                ? { right: `${settings.offsetX}px` }
                : { left: `${settings.offsetX}px` }),
            }
          : {}),
        zIndex: 4,
        minWidth: `${size}px`,
        height: `${size}px`,
        padding: showText ? '0 10px' : 0,
        display: visible ? 'inline-flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        borderRadius: shapeRadius[settings.shape],
        background: settings.transparentBackground && !overridden ? 'transparent' : background,
        color: foreground,
        border:
          settings.borderStyle === 'NONE' || settings.borderWidth === 0
            ? 'none'
            : `${settings.borderWidth}px ${settings.borderStyle.toLowerCase()} ${border}`,
        cursor: 'pointer',
        transition: 'background .15s, color .15s, border-color .15s',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '.02em',
      }}
    >
      {showIcon ? (
        <svg
          viewBox="0 0 24 24"
          width={size * 0.45}
          height={size * 0.45}
          fill="none"
          stroke="currentColor"
          strokeWidth={icon.strokeWidth || undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: icon.path }}
        />
      ) : null}
      {showText ? <span>{settings.text}</span> : null}
    </button>
  );
}
