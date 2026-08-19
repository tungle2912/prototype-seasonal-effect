import { BlockStack, Box, InlineStack, Pagination, Text, Button } from '@shopify/polaris';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * A picker whose options are pictures.
 *
 * Polaris has no image-tile picker, so the tile is a native `<button>` styled
 * with design tokens — the one place in this prototype where that is the right
 * call, because "Sparkle" tells a merchant nothing and a `<select>` of twelve
 * effect names is the exact mistake every competing app makes (PRD 6.0.1).
 *
 * Rules kept from the spec: the grid never runs deeper than two rows, so the
 * settings below it stay on screen; the selected tile is outlined rather than
 * merely tinted; paging shows `1/2` and disables at the ends.
 */

export interface TileOption {
  value: string;
  label: string;
  /** What this option looks like. Drawn, never a word. */
  preview: ReactNode;
  /** A second, quieter line — where a decoration attaches, what a preset turns on. */
  detail?: string;
}

interface TileGridProps {
  label: string;
  options: TileOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
  perPage?: number;
  helpText?: string;
  /** The surrounding card already names it, so the field label would repeat. */
  labelHidden?: boolean;
  /** Icon tiles are square and captionless; preview tiles carry a label. */
  variant?: 'preview' | 'icon';
  /** Taller tiles with larger type, for the one grid a merchant reads first. */
  size?: 'default' | 'large';
  /** Custom artwork is a paid-plan feature, so the button is present but explains itself. */
  onUpload?: () => void;
  disabled?: boolean;
}

export function TileGrid({
  label,
  options,
  value,
  onChange,
  columns = 4,
  perPage,
  helpText,
  labelHidden,
  variant = 'preview',
  size = 'default',
  onUpload,
  disabled,
}: TileGridProps) {
  const pageSize = perPage ?? columns * 2;
  const pageCount = Math.max(1, Math.ceil(options.length / pageSize));
  const [page, setPage] = useState(0);

  // Keep the selected tile visible when the value is set from outside — picking a
  // preset can move the choice to another page.
  useEffect(() => {
    const index = options.findIndex((option) => option.value === value);
    if (index >= 0) setPage(Math.floor(index / pageSize));
  }, [value, options, pageSize]);

  const visible = options.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <BlockStack gap="200">
      {labelHidden ? null : (
        <Text as="span" variant="bodySm" tone={disabled ? 'disabled' : 'subdued'}>
          {label}
        </Text>
      )}

      <div
        role="group"
        aria-label={label}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 'var(--p-space-200)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {visible.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              title={option.label}
              style={{
                padding: 0,
                border: `var(--p-border-width-025) solid ${
                  selected ? 'var(--p-color-border-emphasis)' : 'var(--p-color-border)'
                }`,
                borderRadius: 'var(--p-border-radius-200)',
                boxShadow: selected
                  ? '0 0 0 var(--p-border-width-025) var(--p-color-border-emphasis)'
                  : 'none',
                background: 'var(--p-color-bg-surface)',
                cursor: disabled ? 'default' : 'pointer',
                overflow: 'hidden',
                display: 'block',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  display: 'block',
                  // Large tiles are wider than tall: the label is what got bigger,
                  // and 12 of them at 16/9 would push the effects off the screen.
                  aspectRatio: variant === 'icon' ? '1 / 1' : size === 'large' ? '2.4 / 1' : '4 / 3',
                  overflow: 'hidden',
                  color: 'var(--p-color-text)',
                }}
              >
                {option.preview}
              </span>

              {variant === 'preview' ? (
                <span
                  style={{
                    display: 'block',
                    padding:
                      size === 'large'
                        ? 'var(--p-space-200) var(--p-space-300)'
                        : 'var(--p-space-150) var(--p-space-200)',
                    borderTop: 'var(--p-border-width-025) solid var(--p-color-border-secondary)',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize:
                        size === 'large' ? 'var(--p-font-size-350)' : 'var(--p-font-size-325)',
                      lineHeight: 'var(--p-font-line-height-400)',
                      fontWeight: selected ? 650 : 550,
                      color: 'var(--p-color-text)',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {option.label}
                  </span>

                  {option.detail ? (
                    <span
                      style={{
                        display: 'block',
                        marginTop: '2px',
                        fontSize: 'var(--p-font-size-300)',
                        lineHeight: 'var(--p-font-line-height-300)',
                        color: 'var(--p-color-text-secondary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {option.detail}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {pageCount > 1 || onUpload ? (
        <InlineStack align="space-between" blockAlign="center">
          {onUpload ? (
            <Button size="slim" disabled={disabled} onClick={onUpload}>
              Upload artwork
            </Button>
          ) : (
            <Box />
          )}

          {pageCount > 1 ? (
            <Pagination
              label={`${page + 1} of ${pageCount}`}
              hasPrevious={page > 0}
              hasNext={page < pageCount - 1}
              onPrevious={() => setPage((current) => Math.max(0, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            />
          ) : null}
        </InlineStack>
      ) : null}

      {helpText ? (
        <Text as="span" variant="bodySm" tone="subdued">
          {helpText}
        </Text>
      ) : null}
    </BlockStack>
  );
}
