import { Badge, BlockStack, Button, Card, InlineStack, Text } from '@shopify/polaris';
import type { ReactNode } from 'react';

/**
 * A card whose whole subject is on or off.
 *
 * This is the composition Polaris points at now that `SettingToggle` is
 * deprecated: status as a `Badge`, the action as a plain `Button`. The badge
 * carries a word as well as a colour, because status must never be colour alone.
 */

interface CardToggleProps {
  title: string;
  description: ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  /** Overrides for cases where "On/Off" is not the honest word. */
  onLabel?: string;
  offLabel?: string;
  activateLabel?: string;
  deactivateLabel?: string;
  /** Set when switching off is destructive enough to warrant the critical tone. */
  destructive?: boolean;
  children?: ReactNode;
}

export function CardToggle({
  title,
  description,
  enabled,
  onToggle,
  onLabel = 'On',
  offLabel = 'Off',
  activateLabel = 'Turn on',
  deactivateLabel = 'Turn off',
  destructive,
  children,
}: CardToggleProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="start" gap="400" wrap={false}>
          <BlockStack gap="150">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingMd">
                {title}
              </Text>
              <Badge tone={enabled ? 'success' : 'attention'}>
                {enabled ? onLabel : offLabel}
              </Badge>
            </InlineStack>

            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          </BlockStack>

          <Button
            tone={destructive && enabled ? 'critical' : undefined}
            variant={enabled ? undefined : 'primary'}
            onClick={() => onToggle(!enabled)}
          >
            {enabled ? deactivateLabel : activateLabel}
          </Button>
        </InlineStack>

        {children}
      </BlockStack>
    </Card>
  );
}
