import { BlockStack, Box, DatePicker, InlineStack, Popover, TextField, Text } from '@shopify/polaris';
import { useMemo, useState } from 'react';

/**
 * A date and a time, stored as `YYYY-MM-DDTHH:mm`.
 *
 * The date half is Polaris' `DatePicker` in a popover rather than a native date
 * input, so it looks like the admin's own pickers. The time half is
 * `TextField type="time"`, which keeps values like `23:59` exact — a dropdown of
 * half-hour steps could not express the end of a day.
 */

interface DateTimeFieldProps {
  label: string;
  /** `null` renders as empty, which is what an unset schedule looks like. */
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function split(value: string | null): { date: string; time: string } {
  if (!value) return { date: '', time: '' };
  const [date = '', time = ''] = value.split('T');
  return { date, time };
}

export function DateTimeField({
  label,
  value,
  onChange,
  disabled,
  error,
  helpText,
}: DateTimeFieldProps) {
  const { date, time } = split(value);
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => (date ? new Date(`${date}T00:00`) : new Date()), [date]);
  const [{ month, year }, setMonth] = useState({
    month: selected.getMonth(),
    year: selected.getFullYear(),
  });

  const commit = (nextDate: string, nextTime: string) => {
    onChange(`${nextDate || toIsoDate(new Date())}T${nextTime || '00:00'}`);
  };

  return (
    <BlockStack gap="100">
      <Text as="span" variant="bodySm" tone={disabled ? 'disabled' : 'subdued'}>
        {label}
      </Text>

      <InlineStack gap="200" blockAlign="start" wrap={false}>
        <Box width="100%">
          <Popover
            active={open && !disabled}
            activator={
              <TextField
                label={`${label} date`}
                labelHidden
                value={date}
                placeholder="YYYY-MM-DD"
                autoComplete="off"
                disabled={disabled}
                error={error ? ' ' : undefined}
                onFocus={() => setOpen(true)}
                onChange={(next) => commit(next, time)}
              />
            }
            onClose={() => setOpen(false)}
          >
            <Popover.Pane>
              <Box padding="300">
                <DatePicker
                  month={month}
                  year={year}
                  selected={date ? selected : undefined}
                  onMonthChange={(nextMonth, nextYear) =>
                    setMonth({ month: nextMonth, year: nextYear })
                  }
                  onChange={({ start }) => {
                    commit(toIsoDate(start), time);
                    setOpen(false);
                  }}
                />
              </Box>
            </Popover.Pane>
          </Popover>
        </Box>

        <Box minWidth="8.5rem">
          <TextField
            label={`${label} time`}
            labelHidden
            type="time"
            value={time}
            autoComplete="off"
            disabled={disabled}
            error={error ? ' ' : undefined}
            onChange={(next) => commit(date, next)}
          />
        </Box>
      </InlineStack>

      {error ? (
        <Text as="span" variant="bodySm" tone="critical">
          {error}
        </Text>
      ) : helpText ? (
        <Text as="span" variant="bodySm" tone="subdued">
          {helpText}
        </Text>
      ) : null}
    </BlockStack>
  );
}
