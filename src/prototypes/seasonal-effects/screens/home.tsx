import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  EmptyState,
  Icon,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  SkeletonBodyText,
  Text,
  type IconSource,
} from '@shopify/polaris';
import { BookIcon, ChatIcon, ChevronRightIcon, LightbulbIcon, XIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

import emptyStateImage from '../../../assets/empty-state.svg';
import { formatDate } from '../../../lib/format';
import { marketLabel } from '../../../mocks/markets';
import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { daysUntil } from '../../../mocks/seasonal-effects/today';
import { CardToggle } from '../components/card-toggle';
import { EmbedRequiredModal } from '../components/publish-flow';
import { SetupGuide, type SetupStep } from '../components/setup-guide';
import { useApp } from '../state/app-state';
import { effectCount, statusOf } from '../state/campaign-status';

/**
 * Home.
 *
 * Deliberately not a dashboard: there is no KPI row, because v1 measures nothing
 * and a number nobody can trust is worse than no number. What Home does instead is
 * answer one question — is anything actually showing on my storefront right now —
 * and the app embed card sits at the very top because that is the setting that
 * decides the answer.
 */

export function HomeScreen() {
  const {
    loading,
    error,
    embed,
    setEmbedEnabled,
    campaigns,
    goTo,
    openEditor,
    createCampaign,
    setupDismissed,
    dismissSetup,
    supportDismissed,
    dismissSupport,
    showToast,
  } = useApp();

  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const live = campaigns.find((campaign) => statusOf(campaign) === 'LIVE') ?? null;
  const steps: SetupStep[] = [
    {
      id: 'embed',
      title: 'Turn on the app embed',
      description: embed.enabled
        ? `Active in theme “${embed.themeName}”. Around ${embed.bundleSizeKb} KB of JavaScript, loaded after your page is interactive.`
        : 'Nothing this app does reaches your storefront until the embed is enabled in your theme.',
      done: embed.enabled,
      action: { content: 'Turn it on', onAction: () => setEmbedModalOpen(true) },
    },
    {
      id: 'build',
      title: 'Build your first campaign',
      description:
        'Start from a holiday template, then adjust what shoppers see. The preview on the right updates as you go.',
      done: campaigns.some((campaign) => effectCount(campaign) > 0),
      action: { content: 'Set it up', onAction: createCampaign },
    },
    {
      id: 'publish',
      title: 'Publish it',
      description:
        'Publishing schedules the campaign. It starts and stops on its own, so you do not have to remember to take the decorations down.',
      done: campaigns.some((campaign) => campaign.published),
      action: { content: 'Go to campaigns', onAction: () => goTo('CAMPAIGNS') },
    },
  ];

  const subtitle = !embed.enabled
    ? live
      ? `${live.name} cannot run — the app embed is off`
      : 'Nothing can run — the app embed is off'
    : live
      ? `${live.name} is live${live.schedule.end ? ` · ${daysUntil(live.schedule.end)} days left` : ''}`
      : 'Nothing is running right now';

  if (error) {
    return (
      <Page title="Home">
        <Layout>
          <Layout.Section>
            <Banner
              tone="critical"
              title="Could not load your store"
              action={{ content: 'Retry', onAction: () => showToast('Retrying…') }}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page title="Home" subtitle={subtitle}>
      <Layout>
        {/* One column. These cards belong to the same story in the same order a
            merchant reads it, so none of them get pushed into a side rail. */}
        <Layout.Section>
          <BlockStack gap="400">
            {/* First, and above the warning banner: this is the control the
                merchant has to reach when something is not showing. */}
            <CardToggle
              title="App embed"
              enabled={embed.enabled}
              description={
                embed.enabled
                  ? `Active in theme “${embed.themeName}” · ${embed.bundleSizeKb} KB · nothing renders without this`
                  : 'Not active — the storefront is showing none of your effects'
              }
              onToggle={(next) => {
                if (next) {
                  setEmbedModalOpen(true);
                  return;
                }
                setEmbedEnabled(false);
                showToast('App embed turned off. Nothing is showing on your storefront.');
              }}
            />

            {!embed.enabled ? (
              <Banner
                tone="warning"
                title="Nothing is showing on your storefront"
                action={{ content: 'Turn it on', onAction: () => setEmbedModalOpen(true) }}
              >
                <p>
                  The app embed is off, so every campaign is inactive no matter what its status says.
                </p>
              </Banner>
            ) : null}

            {loading ? (
              <Card>
                <SkeletonBodyText lines={6} />
              </Card>
            ) : (
              <>
                {!setupDismissed ? <SetupGuide steps={steps} onDismiss={dismissSetup} /> : null}

                {campaigns.length === 0 ? (
                  <Card>
                    <EmptyState
                      heading="No campaigns yet"
                      image={emptyStateImage}
                      action={{ content: 'Create campaign', onAction: createCampaign }}
                    >
                      <p>
                        A campaign holds the effects, the dates and the audience together, so the
                        decorations go up and come down on their own.
                      </p>
                    </EmptyState>
                  </Card>
                ) : null}

                {live ? (
                  <LiveCampaignCard campaign={live} onEdit={() => openEditor(live.id)} />
                ) : null}

                {!supportDismissed ? (
                  <Card>
                    <BlockStack gap="300">
                      <InlineStack align="space-between" blockAlign="start" wrap={false}>
                        <Text as="h2" variant="headingMd">
                          Something not working as expected?
                        </Text>
                        <Button
                          variant="tertiary"
                          icon={XIcon}
                          accessibilityLabel="Dismiss"
                          onClick={dismissSupport}
                        />
                      </InlineStack>

                      <Text as="p" variant="bodySm" tone="subdued">
                        We can fix a broken effect, or match one to your brand exactly. We answer
                        within a day, and within an hour during the Black Friday week.
                      </Text>

                      <InlineStack>
                        <Button onClick={() => showToast('A support conversation would open here.')}>
                          Chat with us
                        </Button>
                      </InlineStack>
                    </BlockStack>
                  </Card>
                ) : null}

                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingMd">
                        Resources
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Somewhere to go before there is a specific problem.
                      </Text>
                    </BlockStack>

                    <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                      <ResourceTile
                        icon={ChatIcon}
                        title="Live chat"
                        detail="Get immediate assistance."
                        onAction={() => showToast('A support conversation would open here.')}
                      />
                      <ResourceTile
                        icon={LightbulbIcon}
                        title="Feature request"
                        detail="Ask for an effect or an occasion we do not have yet."
                        onAction={() =>
                          showToast(
                            'Thanks — requests are ranked by demand and decide what we build next.',
                          )
                        }
                      />
                      <ResourceTile
                        icon={BookIcon}
                        title="Help doc"
                        detail="Step-by-step setup and how-tos."
                        onAction={() => showToast('The help doc would open in a new tab.')}
                      />
                    </InlineGrid>
                  </BlockStack>
                </Card>
              </>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>

      <EmbedRequiredModal open={embedModalOpen} onClose={() => setEmbedModalOpen(false)} />
    </Page>
  );
}

function LiveCampaignCard({ campaign, onEdit }: { campaign: Campaign; onEdit: () => void }) {
  const { start, end } = campaign.schedule;

  return (
    <Card>
      <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
        <BlockStack gap="100">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h2" variant="headingMd">
              {campaign.name || 'Untitled campaign'}
            </Text>
            <Badge tone="success">
              Live
            </Badge>
          </InlineStack>

          <Text as="p" variant="bodySm" tone="subdued">
            {start && end ? `${formatDate(start)} – ${formatDate(end)}` : 'Runs until you switch it off'}{' '}
            · {effectCount(campaign)} effects · {marketLabel(campaign.targeting.marketIds)}
          </Text>
        </BlockStack>

        <Button onClick={onEdit}>Edit</Button>
      </InlineStack>
    </Card>
  );
}

/**
 * The whole tile is the control, rather than a link sitting inside a box: a click
 * target the size of the tile is what a merchant expects, and it keeps the icon,
 * the name and the sentence aligned on one left edge.
 *
 * It reads as a surface a merchant can press — a tinted panel rather than an
 * outlined box on an already-white card, the icon on its own raised chip, and a
 * chevron saying this goes somewhere. Inline styles cannot carry `:hover`, so the
 * hover and press states are held in state, which is what makes it feel pressable.
 */
function ResourceTile({
  icon,
  title,
  detail,
  onAction,
}: {
  icon: IconSource;
  title: string;
  detail: string;
  onAction: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onAction}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        height: '100%',
        padding: 'var(--p-space-400)',
        borderRadius: 'var(--p-border-radius-300)',
        border: 'none',
        background: hovered
          ? 'var(--p-color-bg-surface-secondary-hover)'
          : 'var(--p-color-bg-surface-secondary)',
        cursor: 'pointer',
        transition: 'background .12s ease',
      }}
    >
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <span
            style={{
              display: 'inline-flex',
              padding: 'var(--p-space-150)',
              borderRadius: 'var(--p-border-radius-200)',
              background: 'var(--p-color-bg-surface)',
              boxShadow: 'var(--p-shadow-100)',
            }}
          >
            <Icon source={icon} tone="base" />
          </span>

          {/* Says this goes somewhere, which a bordered box on its own does not. */}
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              transform: hovered ? 'translateX(2px)' : 'none',
              transition: 'transform .12s ease',
            }}
          >
            <Icon source={ChevronRightIcon} tone="subdued" />
          </span>
        </InlineStack>

        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">
            {title}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {detail}
          </Text>
        </BlockStack>
      </BlockStack>
    </button>
  );
}
