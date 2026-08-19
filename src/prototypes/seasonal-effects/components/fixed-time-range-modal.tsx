import {
  BlockStack,
  Box,
  Checkbox,
  Divider,
  InlineError,
  InlineStack,
  Modal,
  TextField,
} from '@shopify/polaris';
import { useState } from 'react';

import { dayLabel, type DayRule } from '../../../mocks/seasonal-effects/campaigns';

/**
 * Days and hours inside the campaign window.
 *
 * Apply is blocked rather than corrected: a ticked day with no hours is a decision
 * the merchant has not finished making, and guessing 09:00–17:00 for them would put
 * a schedule on the storefront that nobody chose. Overnight ranges are out of scope
 * for v1 — split them across two days.
 */

interface FixedTimeRangeModalProps {
  open: boolean;
  days: DayRule[];
  onClose: () => void;
  onApply: (days: DayRule[]) => void;
}

export function FixedTimeRangeModal({ open, days, onClose, onApply }: FixedTimeRangeModalProps) {
  const [draft, setDraft] = useState<DayRule[]>(days);
  const [error, setError] = useState<string | null>(null);

  // Re-seed on open so Discard really discards.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(days);
      setError(null);
    }
  }

  const update = (index: number, value: Partial<DayRule>) =>
    setDraft((current) =>
      current.map((rule, position) => (position === index ? { ...rule, ...value } : rule)),
    );

  const handleApply = () => {
    const incomplete = draft.find((rule) => rule.enabled && !rule.allDay && (!rule.from || !rule.to));
    if (incomplete) {
      setError(
        `${dayLabel[incomplete.day]} is ticked but has no hours. Add a from and a to time, or tick all day.`,
      );
      return;
    }

    const inverted = draft.find(
      (rule) => rule.enabled && !rule.allDay && rule.from >= rule.to,
    );
    if (inverted) {
      setError(
        `${dayLabel[inverted.day]} ends before it starts. Overnight ranges are not supported yet — split them across two days.`,
      );
      return;
    }

    setError(null);
    onApply(draft);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Display in fixed time range"
      primaryAction={{ content: 'Apply', onAction: handleApply }}
      secondaryActions={[{ content: 'Discard', onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          {draft.map((rule, index) => (
            <BlockStack gap="300" key={rule.day}>
              {index > 0 ? <Divider /> : null}

              <InlineStack gap="400" blockAlign="center" wrap={false} align="space-between">
                <Box minWidth="7.5rem">
                  <Checkbox
                    label={dayLabel[rule.day]}
                    checked={rule.enabled}
                    onChange={(next) => update(index, { enabled: next })}
                  />
                </Box>

                <Box minWidth="6rem">
                  <Checkbox
                    label="All day"
                    checked={rule.allDay}
                    disabled={!rule.enabled}
                    onChange={(next) => update(index, { allDay: next })}
                  />
                </Box>

                <InlineStack gap="200" blockAlign="center" wrap={false}>
                  <Box minWidth="7rem">
                    <TextField
                      label={`${dayLabel[rule.day]} from`}
                      labelHidden
                      type="time"
                      value={rule.from}
                      disabled={!rule.enabled || rule.allDay}
                      autoComplete="off"
                      onChange={(next) => update(index, { from: next })}
                    />
                  </Box>
                  <Box minWidth="7rem">
                    <TextField
                      label={`${dayLabel[rule.day]} to`}
                      labelHidden
                      type="time"
                      value={rule.to}
                      disabled={!rule.enabled || rule.allDay}
                      autoComplete="off"
                      onChange={(next) => update(index, { to: next })}
                    />
                  </Box>
                </InlineStack>
              </InlineStack>
            </BlockStack>
          ))}

          {error ? <InlineError message={error} fieldID="fixed-time-range" /> : null}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
