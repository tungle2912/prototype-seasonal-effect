import { BlockStack, Icon, InlineGrid, Text, type IconSource } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { ReactNode } from 'react';

/**
 * Picking one option out of a few, where the options need showing rather than listing.
 *
 * "Blinking", "Scrolling" and "Typing" mean nothing as words in a dropdown. A card
 * each — icon, name, and the state marked with a tick — puts every option on screen
 * at once and makes choosing one read and one click.
 */

export interface ChoiceCardOption<T extends string> {
  value: T;
  label: string;
  /** Shown above the label. Use a Polaris icon for consistency with the admin. */
  icon?: IconSource;
  /** An emoji or small drawing, when no icon says it well enough. */
  media?: ReactNode;
  description?: string;
}

interface ChoiceCardsProps<T extends string> {
  label: string;
  options: ChoiceCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  labelHidden?: boolean;
  disabled?: boolean;
}

export function ChoiceCards<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
  labelHidden,
  disabled,
}: ChoiceCardsProps<T>) {
  return (
    <BlockStack gap="200">
      {labelHidden ? null : (
        <Text as="span" variant="bodySm" tone={disabled ? 'disabled' : 'subdued'}>
          {label}
        </Text>
      )}

      {/* The visible label belongs to no single card, so the group carries the name. */}
      <div role="group" aria-label={label}>
        <InlineGrid columns={columns ?? options.length} gap="300">
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
                  padding: 'var(--p-space-400) var(--p-space-300)',
                  borderRadius: 'var(--p-border-radius-300)',
                  border: 'var(--p-border-width-025) solid var(--p-color-border)',
                  background: selected
                    ? 'var(--p-color-bg-surface-secondary)'
                    : 'var(--p-color-bg-surface)',
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                  display: 'block',
                  width: '100%',
                  transition: 'background .12s',
                }}
              >
                <BlockStack gap="200" inlineAlign="center">
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--p-space-100)',
                      minHeight: '20px',
                    }}
                  >
                    {option.icon ? (
                      <Icon source={option.icon} tone={selected ? 'info' : 'subdued'} />
                    ) : option.media ? (
                      <span aria-hidden="true" style={{ fontSize: 'var(--p-font-size-450)' }}>
                        {option.media}
                      </span>
                    ) : null}

                    {/* The tick, not colour alone, is what says "this one". */}
                    {selected ? <Icon source={CheckCircleIcon} tone="success" /> : null}
                  </span>

                  <Text as="span" variant="bodyMd" fontWeight="semibold" alignment="center">
                    {option.label}
                  </Text>

                  {option.description ? (
                    <Text as="span" variant="bodySm" tone="subdued" alignment="center">
                      {option.description}
                    </Text>
                  ) : null}
                </BlockStack>
              </button>
            );
          })}
        </InlineGrid>
      </div>
    </BlockStack>
  );
}
