import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Collapsible,
  Divider,
  Icon,
  InlineStack,
  ProgressBar,
  Text,
} from '@shopify/polaris';
import { CheckCircleIcon, XIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

/**
 * Setup guide, following Shopify's own composition.
 *
 * The pieces that matter are the ones the onboarding guidance is specific about: a
 * progress line, steps that tick themselves rather than being claimed complete, one
 * step open at a time, and a dismiss control so the guide never blocks the work.
 * Five steps is the documented ceiling; this app needs three.
 *
 * No illustrations. A picture per step is decoration in an app this small — it
 * doubles the height of every row and says nothing the sentence does not.
 */

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  /** Detected from real state, never ticked by hand. */
  done: boolean;
  action?: { content: string; onAction: () => void };
}

interface SetupGuideProps {
  steps: SetupStep[];
  onDismiss: () => void;
}

export function SetupGuide({ steps, onDismiss }: SetupGuideProps) {
  const done = steps.filter((step) => step.done).length;
  const complete = done === steps.length;
  const firstOpen = steps.find((step) => !step.done)?.id ?? null;

  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(firstOpen);

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center" gap="200" wrap={false}>
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Setup guide
              </Text>
              {complete ? (
                <Badge tone="success">
                  Done
                </Badge>
              ) : null}
            </InlineStack>

            <InlineStack gap="100" wrap={false}>
              <Button
                variant="tertiary"
                icon={XIcon}
                accessibilityLabel="Dismiss the setup guide"
                onClick={onDismiss}
              />
              <Button
                variant="tertiary"
                disclosure={collapsed ? 'down' : 'up'}
                ariaExpanded={!collapsed}
                ariaControls="setup-guide-steps"
                accessibilityLabel={
                  collapsed ? 'Expand the setup guide' : 'Collapse the setup guide'
                }
                onClick={() => setCollapsed((current) => !current)}
              />
            </InlineStack>
          </InlineStack>

          <Text as="p" variant="bodySm" tone="subdued">
            {complete
              ? 'Your store is decorated and your campaigns run on their own. You can dismiss this guide.'
              : 'Three things stand between an installed app and effects on your storefront.'}
          </Text>
        </BlockStack>

        {/* Progress before the steps: the encouraging bit goes first. */}
        <BlockStack gap="150">
          <ProgressBar
            progress={(done / steps.length) * 100}
            size="small"
            tone={complete ? 'success' : 'primary'}
            animated={false}
          />
          <Text as="p" variant="bodySm" tone="subdued">
            {done} of {steps.length} steps completed
          </Text>
        </BlockStack>

        <Collapsible id="setup-guide-steps" open={!collapsed}>
          <BlockStack gap="0">
            <Divider />
            {steps.map((step, index) => (
              <Step
                key={step.id}
                step={step}
                index={index}
                // No rule under the last step: the card edge is already a line.
                showDivider={index < steps.length - 1}
                open={expanded === step.id}
                onToggle={() => setExpanded((current) => (current === step.id ? null : step.id))}
              />
            ))}
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

function Step({
  step,
  index,
  showDivider,
  open,
  onToggle,
}: {
  step: SetupStep;
  index: number;
  showDivider: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <BlockStack gap="0">
      <Box paddingBlockStart="300" paddingBlockEnd="300">
        <BlockStack gap="200">
          <InlineStack align="space-between" blockAlign="center" gap="300" wrap={false}>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              {step.done ? (
                <Icon source={CheckCircleIcon} tone="success" accessibilityLabel="Completed" />
              ) : (
                <StepNumber value={index + 1} />
              )}

              <Text
                as="h3"
                variant="bodyMd"
                fontWeight="semibold"
                tone={step.done ? 'subdued' : undefined}
              >
                {step.title}
              </Text>
            </InlineStack>

            <Button
              variant="tertiary"
              disclosure={open ? 'up' : 'down'}
              ariaExpanded={open}
              ariaControls={`setup-step-${step.id}`}
              accessibilityLabel={`${open ? 'Hide' : 'Show'} details for ${step.title}`}
              onClick={onToggle}
            />
          </InlineStack>

          <Collapsible id={`setup-step-${step.id}`} open={open}>
            {/* Indented to line up with the title, not the marker. */}
            <Box paddingInlineStart="800" paddingBlockStart="100">
              <BlockStack gap="300">
                <Text as="p" variant="bodySm" tone="subdued">
                  {step.description}
                </Text>

                {step.action && !step.done ? (
                  <InlineStack>
                    <Button variant="primary" onClick={step.action.onAction}>
                      {step.action.content}
                    </Button>
                  </InlineStack>
                ) : null}
              </BlockStack>
            </Box>
          </Collapsible>
        </BlockStack>
      </Box>

      {showDivider ? <Divider /> : null}
    </BlockStack>
  );
}

/** The "not done yet" marker: a numbered ring, the way admin setup guides draw it. */
function StepNumber({ value }: { value: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '20px',
        height: '20px',
        borderRadius: 'var(--p-border-radius-full)',
        border: 'var(--p-border-width-025) dashed var(--p-color-border)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 'var(--p-font-size-275)',
        color: 'var(--p-color-text-secondary)',
      }}
    >
      {value}
    </div>
  );
}
