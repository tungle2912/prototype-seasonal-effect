import {
  BlockStack,
  ColorPicker,
  hexToRgb,
  hsbToHex,
  Popover,
  rgbToHsb,
  TextField,
  type HSBColor,
} from '@shopify/polaris';
import { useCallback, useState } from 'react';

import { isValidHex } from '../state/validation';

/**
 * A colour the merchant picks: hex you can type, swatch you can click.
 *
 * `ColorPicker` speaks HSB and the app stores hex, so the conversion lives here
 * — Polaris ships `hexToRgb`, `rgbToHsb` and `hsbToHex`, which is why this needs
 * no new dependency. The swatch is a `<button>` because it opens a popover; it
 * is the one element Polaris has no equivalent for.
 */

function toHsb(hex: string): HSBColor {
  if (!isValidHex(hex)) return { hue: 0, saturation: 0, brightness: 0 };
  return rgbToHsb(hexToRgb(hex));
}

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  /** Disabled rather than hidden: the merchant should still see what it was. */
  disabled?: boolean;
  helpText?: string;
  error?: string;
}

export function ColorField({ label, value, onChange, disabled, helpText, error }: ColorFieldProps) {
  const [open, setOpen] = useState(false);

  const handleTyped = useCallback(
    (next: string) => {
      const withHash = next.startsWith('#') ? next : `#${next}`;
      onChange(withHash.slice(0, 7));
    },
    [onChange],
  );

  const swatch = (
    <button
      type="button"
      aria-label={`Change ${label.toLowerCase()}`}
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      style={{
        width: '20px',
        height: '20px',
        padding: 0,
        borderRadius: 'var(--p-border-radius-full)',
        border: 'var(--p-border-width-025) solid var(--p-color-border)',
        background: isValidHex(value) ? value : 'var(--p-color-bg-surface-secondary)',
        cursor: disabled ? 'default' : 'pointer',
      }}
    />
  );

  return (
    <BlockStack gap="100">
      <Popover
        active={open && !disabled}
        activator={
          <TextField
            label={label}
            value={value.toUpperCase()}
            onChange={handleTyped}
            disabled={disabled}
            autoComplete="off"
            maxLength={7}
            prefix={swatch}
            helpText={helpText}
            error={error}
          />
        }
        onClose={() => setOpen(false)}
        preferredAlignment="left"
      >
        <Popover.Pane>
          <div style={{ padding: 'var(--p-space-300)' }}>
            <ColorPicker color={toHsb(value)} onChange={(next) => onChange(hsbToHex(next))} />
          </div>
        </Popover.Pane>
      </Popover>
    </BlockStack>
  );
}
