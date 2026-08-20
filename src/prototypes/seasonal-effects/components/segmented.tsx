import { BlockStack, Text } from '@shopify/polaris';

import type { SegmentedOption } from './options';

/**
 * A field with two to four visible choices.
 *
 * Drawn rather than built from `ButtonGroup`: a row of full buttons reads as four
 * competing actions, when what this actually is is one field with its options laid
 * out. A single recessed track with the selected option raised out of it says
 * "pick one of these" at a glance, and still costs one click instead of the two a
 * dropdown would (PRD 6.0.1).
 */

interface SegmentedProps<T extends string> {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  helpText?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  /** For a track whose options name themselves — Mobile/Desktop, Home/Cart. */
  labelHidden?: boolean;
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  helpText,
  disabled,
  fullWidth,
  labelHidden,
}: SegmentedProps<T>) {
  return (
    <BlockStack gap="150">
      {labelHidden ? null : (
        <Text as="span" variant="bodySm" tone={disabled ? 'disabled' : 'subdued'}>
          {label}
        </Text>
      )}

      {/* The visible label belongs to no single option, so the group carries a name. */}
      <div
        role="group"
        aria-label={label}
        style={{
          display: fullWidth ? 'flex' : 'inline-flex',
          // BlockStack lays its children out in a grid, which stretches them, so
          // the track has to state its own width or it spans the whole card.
          width: fullWidth ? '100%' : 'fit-content',
          gap: '2px',
          padding: '3px',
          borderRadius: 'var(--p-border-radius-200)',
          background: 'var(--p-color-bg-surface-secondary)',
          border: 'var(--p-border-width-025) solid var(--p-color-border)',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              style={{
                flex: fullWidth ? 1 : undefined,
                padding: 'var(--p-space-150) var(--p-space-300)',
                border: 'none',
                borderRadius: 'var(--p-border-radius-150)',
                background: selected ? 'var(--p-color-bg-surface)' : 'transparent',
                boxShadow: selected ? 'var(--p-shadow-100)' : 'none',
                color: selected ? 'var(--p-color-text)' : 'var(--p-color-text-secondary)',
                fontSize: 'var(--p-font-size-325)',
                fontWeight: selected ? 600 : 450,
                lineHeight: 'var(--p-font-line-height-400)',
                whiteSpace: 'nowrap',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'background .12s, color .12s',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {helpText ? (
        <Text as="span" variant="bodySm" tone="subdued">
          {helpText}
        </Text>
      ) : null}
    </BlockStack>
  );
}
