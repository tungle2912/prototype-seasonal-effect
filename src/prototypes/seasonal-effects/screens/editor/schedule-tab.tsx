import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  Divider,
  InlineGrid,
  InlineStack,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useState } from 'react';

import type { Campaign, TriggerType } from '../../../../mocks/seasonal-effects/campaigns';
import { DateTimeField } from '../../components/date-time-field';
import { FixedTimeRangeModal } from '../../components/fixed-time-range-modal';
import { ToggleRow } from '../../components/toggle-row';
import { useApp } from '../../state/app-state';
import { fixedRangeSummary, momentsSummary } from '../../state/summaries';
import { issueFor, type Issue } from '../../state/validation';

/**
 * Schedule & trigger.
 *
 * Visibility time is the outer gate: the fixed range, the trigger and the countdown
 * only ever apply inside it. There is no per-campaign timezone — the whole store
 * uses one mode, chosen in Settings, so two campaigns can never disagree about what
 * "7am" means. This tab states which mode is in force rather than making the
 * merchant remember.
 *
 * The one-off bursts live here too. They are a "when", not a "what", and having
 * them in Elements made the add-to-cart trigger look like a duplicate of itself.
 */

const TRIGGER_CHOICES: { label: string; value: TriggerType; helpText: string }[] = [
  {
    label: 'As soon as the page loads',
    value: 'PAGE_LOAD',
    helpText:
      'Starts once the page is interactive. The default, and the right answer most of the time.',
  },
  {
    label: 'After a specific time on the page',
    value: 'DELAY',
    helpText: 'Nothing is drawn until the wait is over.',
  },
  {
    label: 'When an item is added to the cart',
    value: 'ADD_TO_CART',
    helpText: 'Catches add-to-cart anywhere: product page, quick add, cart drawer.',
  },
  {
    label: 'When a button or element is clicked',
    value: 'ELEMENT_CLICK',
    helpText: 'Watches for a class name you give it.',
  },
];

interface ScheduleTabProps {
  campaign: Campaign;
  onChange: (next: Campaign) => void;
  issues: Issue[];
}

export function ScheduleTab({ campaign, onChange, issues }: ScheduleTabProps) {
  const { settings } = useApp();
  const [rangeModalOpen, setRangeModalOpen] = useState(false);

  const { schedule, trigger } = campaign;
  const scheduleIssue = issueFor(issues, 'schedule');
  const rangeIssue = issueFor(issues, 'fixedRange');

  const patchSchedule = (value: Partial<Campaign['schedule']>) =>
    onChange({ ...campaign, schedule: { ...schedule, ...value } });

  const patchTrigger = (value: Partial<Campaign['trigger']>) =>
    onChange({ ...campaign, trigger: { ...trigger, ...value } });

  const patchMoments = (value: Partial<Campaign['elements']['moments']>) =>
    onChange({
      ...campaign,
      elements: { ...campaign.elements, moments: { ...campaign.elements.moments, ...value } },
    });

  const timezoneNote =
    settings.timezoneMode === 'STORE_ADMIN'
      ? `All times use your store timezone, ${settings.storeTimezone} (from Shopify admin).`
      : "All times follow each shopper's own time zone. Midnight means midnight where they are.";

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Schedule
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {timezoneNote} Change it in Settings — it applies to the whole store, not to one
              campaign.
            </Text>
          </BlockStack>

          <Divider />

          <ToggleRow
            title="Visibility time"
            summary={
              schedule.visibilityEnabled
                ? 'The campaign starts and stops on its own between these two moments.'
                : 'Off — it runs from the moment you switch it on until you switch it off. There is no Scheduled or Ended state, and nothing will remind you.'
            }
            checked={schedule.visibilityEnabled}
            onChange={(next) => patchSchedule({ visibilityEnabled: next })}
          />

          {/* Hidden rather than disabled: with no window there are no dates, and a
              greyed-out date field invites a merchant to try to fill it in. */}
          {schedule.visibilityEnabled ? (
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <DateTimeField
                label="Start time"
                value={schedule.start}
                onChange={(next) => patchSchedule({ start: next })}
              />
              <DateTimeField
                label="End time"
                value={schedule.end}
                onChange={(next) => patchSchedule({ end: next })}
                error={scheduleIssue?.message}
              />
            </InlineGrid>
          ) : null}
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Display in fixed time range
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Limit the campaign to certain days and hours inside the window above — for a weekend
              sale, or shop hours.
            </Text>
          </BlockStack>

          <Divider />

          <ToggleRow
            title="Use a fixed time range"
            summary={
              schedule.fixedRange.enabled
                ? fixedRangeSummary(schedule.fixedRange.days)
                : 'Off — shows at any hour inside the visibility window.'
            }
            checked={schedule.fixedRange.enabled}
            onChange={(next) =>
              patchSchedule({ fixedRange: { ...schedule.fixedRange, enabled: next } })
            }
            action={
              // The button only exists once the range is on: a control that cannot
              // do anything yet is noise.
              schedule.fixedRange.enabled ? (
                <Button onClick={() => setRangeModalOpen(true)}>Configure days & hours</Button>
              ) : undefined
            }
          />

          {rangeIssue ? (
            <Banner tone="warning">
              <p>{rangeIssue.message}</p>
            </Banner>
          ) : null}
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Trigger
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              What starts the effects once a shopper is on a page the campaign is allowed to run on.
            </Text>
          </BlockStack>

          <Divider />

          <ChoiceList
            title="Trigger"
            titleHidden
            selected={[trigger.type]}
            choices={TRIGGER_CHOICES.map((choice) => ({
              label: choice.label,
              value: choice.value,
              helpText: choice.helpText,
              renderChildren:
                choice.value === 'DELAY'
                  ? (selected: boolean) =>
                      selected ? (
                        <InlineStack gap="200" blockAlign="end">
                          <Box minWidth="7rem">
                            <TextField
                              label="Wait"
                              type="number"
                              min={1}
                              max={600}
                              value={String(trigger.delay)}
                              autoComplete="off"
                              onChange={(next) => patchTrigger({ delay: Number(next) || 1 })}
                            />
                          </Box>
                          <Box minWidth="9rem">
                            <Select
                              label="Unit"
                              options={[
                                { label: 'seconds', value: 'SECONDS' },
                                { label: 'minutes', value: 'MINUTES' },
                              ]}
                              value={trigger.delayUnit}
                              onChange={(next) =>
                                patchTrigger({ delayUnit: next as typeof trigger.delayUnit })
                              }
                            />
                          </Box>
                        </InlineStack>
                      ) : null
                  : choice.value === 'ELEMENT_CLICK'
                    ? (selected: boolean) =>
                        selected ? (
                          <Box minWidth="22rem">
                            <TextField
                              label="Class name"
                              value={trigger.elementClass}
                              autoComplete="off"
                              placeholder="product-form__submit"
                              helpText="No leading dot. Separate several classes with commas. A class that is not on the page simply never fires — it does not error in a shopper's console."
                              onChange={(next) => patchTrigger({ elementClass: next })}
                            />
                          </Box>
                        ) : null
                    : undefined,
            }))}
            onChange={(selected) => {
              const next = selected[0];
              if (next) patchTrigger({ type: next as TriggerType });
            }}
          />

          <Text as="p" variant="bodySm" tone="subdued">
            A trigger never makes the campaign appear outside its window, and it does not override
            an effect's own rules — a cursor trail still only runs on desktop.
          </Text>

          <Divider />

          {/* Beside the trigger, not in Elements: a merchant reading "when an item
              is added to the cart" up there and "add to cart" in another tab was
              being asked the same-looking question twice. The difference is what
              happens — the trigger starts the whole campaign, these fire one burst
              and stop. Putting them next to each other is what makes that legible. */}
          <ToggleRow
            title="One-off bursts"
            summary={
              campaign.elements.moments.enabled
                ? momentsSummary(campaign)
                : 'Off — nothing extra fires at the cart or on the thank-you page.'
            }
            checked={campaign.elements.moments.enabled}
            onChange={(next) => patchMoments({ enabled: next })}
          />

          {campaign.elements.moments.enabled ? (
            <Box paddingInlineStart="600">
              <BlockStack gap="200">
                <Checkbox
                  label="Add to cart"
                  helpText="A short burst from the button the shopper just pressed, then it stops."
                  checked={campaign.elements.moments.addToCart}
                  onChange={(next) => patchMoments({ addToCart: next })}
                />
                <Checkbox
                  label="Free shipping reached"
                  helpText="Fires once when the cart crosses the threshold, not again on the next item."
                  checked={campaign.elements.moments.freeShipping}
                  onChange={(next) => patchMoments({ freeShipping: next })}
                />
                <Checkbox
                  label="Order confirmed"
                  helpText="On the thank-you page, for at most three seconds. No preview can show it — that page belongs to checkout."
                  checked={campaign.elements.moments.orderConfirmed}
                  onChange={(next) => patchMoments({ orderConfirmed: next })}
                />
              </BlockStack>
            </Box>
          ) : null}
        </BlockStack>
      </Card>

      <FixedTimeRangeModal
        open={rangeModalOpen}
        days={schedule.fixedRange.days}
        onClose={() => setRangeModalOpen(false)}
        onApply={(days) => {
          patchSchedule({ fixedRange: { ...schedule.fixedRange, days } });
          setRangeModalOpen(false);
        }}
      />
    </BlockStack>
  );
}
