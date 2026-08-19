import { Box, Checkbox, InlineStack } from '@shopify/polaris';
import type { ReactNode } from 'react';

/**
 * One on/off row with a summary and an optional action.
 *
 * Polaris React 13 has no `Switch`, and hand-drawing one would break both the
 * "never rebuild what Polaris has" rule and keyboard support. A `Checkbox` with
 * `helpText` carries the same meaning, reads correctly to a screen reader, and
 * puts the control where the admin puts it: on the left, before the label.
 */

interface ToggleRowProps {
  title: string;
  summary?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Usually a "Configure" button. */
  action?: ReactNode;
  disabled?: boolean;
}

export function ToggleRow({
  title,
  summary,
  checked,
  onChange,
  action,
  disabled,
}: ToggleRowProps) {
  return (
    <InlineStack align="space-between" blockAlign="start" gap="400" wrap={false}>
      <Checkbox
        label={title}
        helpText={summary}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {action ? <Box paddingBlockStart="050">{action}</Box> : null}
    </InlineStack>
  );
}
