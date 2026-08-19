import { Box, Button, Checkbox, Collapsible, InlineStack } from '@shopify/polaris';
import type { ReactNode } from 'react';

/**
 * One effect inside a group card: a toggle, a summary, and settings that fold away.
 *
 * Two behaviours from the spec are enforced here rather than left to each caller,
 * because forgetting either one is what makes the screen feel wrong:
 *
 * - Switching an effect **on** opens it. Whoever just enabled something wants to
 *   see what it is; making them click a second time is a step for nothing.
 * - Switching it **off** leaves it open, since they may be comparing two effects
 *   before dropping one.
 *
 * A collapsed row still shows its configuration, so nothing has to be opened
 * just to find out what it is set to (PRD 6.0).
 */

interface EffectSectionProps {
  /** Used for `aria-controls`, so it must be unique on the page. */
  id: string;
  title: string;
  /** e.g. "Snowfall · medium · brand colour". */
  summary: ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function EffectSection({
  id,
  title,
  summary,
  enabled,
  onToggle,
  open,
  onOpenChange,
  children,
}: EffectSectionProps) {
  return (
    <Box>
      <InlineStack align="space-between" blockAlign="start" gap="400" wrap={false}>
        <Checkbox
          label={title}
          helpText={summary}
          checked={enabled}
          onChange={(next) => {
            if (next) onOpenChange(true);
            onToggle(next);
          }}
        />

        <Button
          variant="tertiary"
          disclosure={open ? 'up' : 'down'}
          ariaExpanded={open}
          ariaControls={id}
          accessibilityLabel={`${open ? 'Hide' : 'Show'} ${title} settings`}
          onClick={() => onOpenChange(!open)}
        />
      </InlineStack>

      <Collapsible id={id} open={open} transition={{ duration: '150ms', timingFunction: 'ease' }}>
        {/* Indented to sit under the checkbox label, not under the checkbox. */}
        <Box paddingBlockStart="300" paddingInlineStart="600">
          {children}
        </Box>
      </Collapsible>
    </Box>
  );
}
