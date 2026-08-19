import { BlockStack, Box, InlineStack, List, Modal, Text } from '@shopify/polaris';
import { useEffect } from 'react';

import { formatDate } from '../../../lib/format';
import { marketLabel } from '../../../mocks/markets';
import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { TODAY, toDate } from '../../../mocks/seasonal-effects/today';
import { useApp } from '../state/app-state';
import { effectCount, statusOf } from '../state/campaign-status';

/**
 * The gate in front of going live.
 *
 * Two things have to be true before a campaign reaches a shopper, and both fail
 * silently if the app does not check them:
 *
 * 1. The theme app embed has to be on. Without it nothing renders no matter what
 *    the status says — the single biggest source of "your app is broken" tickets
 *    for any storefront app.
 * 2. A campaign that has never been published gets one confirmation, because
 *    switching a draft on by accident is a public mistake.
 *
 * Both live here so the Campaigns table and the editor cannot drift apart.
 */

interface PublishFlowProps {
  /** Ids the merchant asked to activate. Empty closes the flow. */
  ids: string[];
  onClose: () => void;
}

export function PublishFlow({ ids, onClose }: PublishFlowProps) {
  const { embed, campaigns, publish, setEnabled, showToast } = useApp();

  const targets = campaigns.filter((campaign) => ids.includes(campaign.id));
  const ended = targets.filter((campaign) => statusOf(campaign) === 'ENDED');
  const runnable = targets.filter((campaign) => statusOf(campaign) !== 'ENDED');
  const firstTime = runnable.filter((campaign) => !campaign.published);

  const open = ids.length > 0;
  const blockedByEmbed = open && !embed.enabled;
  const needsConfirm = open && !blockedByEmbed && firstTime.length > 0;

  // Nothing to confirm: activate straight away. Doing this in an effect keeps the
  // state update out of render, and the toast still reports what was skipped.
  useEffect(() => {
    if (!open || blockedByEmbed || needsConfirm) return;

    if (runnable.length > 0) {
      setEnabled(
        runnable.map((campaign) => campaign.id),
        true,
      );
    }
    showToast(activationMessage(runnable.length, ended.length));
    onClose();
  }, [
    open,
    blockedByEmbed,
    needsConfirm,
    runnable,
    ended.length,
    setEnabled,
    showToast,
    onClose,
  ]);

  if (blockedByEmbed) {
    return <EmbedRequiredModal open onClose={onClose} />;
  }

  if (!needsConfirm) return null;

  const single = runnable.length === 1 ? runnable[0] : undefined;
  const willBeScheduled = runnable.every((campaign) => startsInFuture(campaign));

  return (
    <Modal
      open
      onClose={onClose}
      title={
        single
          ? `Publish “${single.name || 'Untitled campaign'}” now?`
          : `Publish ${runnable.length} campaigns now?`
      }
      primaryAction={{
        content: 'Publish',
        onAction: () => {
          publish(runnable.map((campaign) => campaign.id));
          showToast(activationMessage(runnable.length, ended.length));
          onClose();
        },
      }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p">
            {willBeScheduled
              ? 'This schedules the campaign. It will start on its own on the start date — you will not need to come back.'
              : 'This puts the campaign on your live storefront. Shoppers will start seeing it right away.'}
          </Text>

          {single ? <CampaignSummary campaign={single} /> : <CampaignNames campaigns={runnable} />}

          {ended.length > 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">
              {ended.length === 1
                ? '1 campaign has already ended and will be skipped. Change its end date to run it again.'
                : `${ended.length} campaigns have already ended and will be skipped. Change their end dates to run them again.`}
            </Text>
          ) : null}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

/**
 * The instructions for turning the embed on. Also opened from the warning banner
 * and from the badge beside Create campaign, so it is exported on its own.
 */
export function EmbedRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setEmbedEnabled, showToast } = useApp();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Turn on the app embed first"
      primaryAction={{
        content: 'Enable now',
        onAction: () => {
          // The real app deep-links to the theme editor with the embed preselected;
          // there is no theme editor here, so the prototype flips the flag.
          setEmbedEnabled(true);
          showToast('App embed turned on. Your campaigns can reach the storefront again.');
          onClose();
        },
      }}
      secondaryActions={[{ content: 'Not now', onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p">
            Nothing this app does reaches your storefront until the embed is enabled in your theme. A
            campaign can be published without it, but shoppers will see nothing.
          </Text>

          <List type="number">
            <List.Item>Open your theme editor</List.Item>
            <List.Item>
              Go to <b>App embeds</b> in the left panel
            </List.Item>
            <List.Item>
              Switch on <b>Seasonal Effects</b>, then save
            </List.Item>
          </List>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function CampaignSummary({ campaign }: { campaign: Campaign }) {
  const { start, end, visibilityEnabled } = campaign.schedule;

  return (
    <Box
      background="bg-surface-secondary"
      borderRadius="200"
      padding="300"
    >
      <BlockStack gap="200">
        <SummaryRow
          label="Runs"
          value={
            visibilityEnabled && start && end
              ? `${formatDate(start)} – ${formatDate(end)}`
              : 'Until you switch it off'
          }
        />
        <SummaryRow
          label="Audience"
          value={`${marketLabel(campaign.targeting.marketIds)} · ${shopperLabel(campaign)}`}
        />
        <SummaryRow label="Effects on" value={String(effectCount(campaign))} />
      </BlockStack>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <InlineStack align="space-between" gap="400" wrap={false}>
      <Text as="span" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <Text as="span" variant="bodySm" fontWeight="semibold">
        {value}
      </Text>
    </InlineStack>
  );
}

function CampaignNames({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <List>
      {campaigns.map((campaign) => (
        <List.Item key={campaign.id}>{campaign.name || 'Untitled campaign'}</List.Item>
      ))}
    </List>
  );
}

const shopperLabel = (campaign: Campaign): string =>
  ({
    EVERYONE: 'everyone',
    FIRST_TIME: 'first-time shoppers',
    RETURNING: 'returning shoppers',
  })[campaign.targeting.shopperType];

function startsInFuture(campaign: Campaign): boolean {
  const start = campaign.schedule.start;
  if (!campaign.schedule.visibilityEnabled || !start) return false;
  return toDate(start).getTime() > TODAY.getTime();
}

function activationMessage(activated: number, skipped: number): string {
  const head =
    activated === 0
      ? 'Nothing was activated'
      : activated === 1
        ? '1 campaign activated'
        : `${activated} campaigns activated`;

  if (skipped === 0) return `${head}.`;
  return `${head}. ${skipped === 1 ? '1 ended campaign was' : `${skipped} ended campaigns were`} skipped — change the end date first.`;
}
