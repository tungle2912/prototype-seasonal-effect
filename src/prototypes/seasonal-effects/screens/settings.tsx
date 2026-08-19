import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  ChoiceList,
  Divider,
  InlineGrid,
  InlineStack,
  Layout,
  Modal,
  Page,
  SkeletonBodyText,
  Tag,
  Text,
} from '@shopify/polaris';
import { useMemo, useState } from 'react';

import { formatDateTime } from '../../../lib/format';
import { markets, marketsSyncedAt } from '../../../mocks/markets';
import {
  speedGuardHint,
  speedGuardLabel,
  timezoneModeLabel,
  type SpeedGuardMode,
  type TimezoneMode,
} from '../../../mocks/seasonal-effects/modules';
import {
  brandColourLabel,
  brandColoursFromTheme,
  contrastOnWhite,
  type BrandColourKey,
} from '../../../mocks/seasonal-effects/palettes';
import { ColorField } from '../components/color-field';
import { useApp } from '../state/app-state';
import { statusOf } from '../state/campaign-status';

/**
 * Settings — store-wide, never per campaign.
 *
 * Laid out with `Layout.AnnotatedSection`: each group states what it is and why it
 * matters on the left, with the controls on the right. That is Polaris' app settings
 * pattern, and it earns its keep here because three of these four groups need a
 * sentence of explanation before the control makes sense.
 */

export function SettingsScreen() {
  const {
    settings,
    setSettings,
    campaigns,
    tabAnimation,
    scrollToTop,
    killAll,
    loading,
    error,
    showToast,
  } = useApp();

  const [killOpen, setKillOpen] = useState(false);

  const liveCount = useMemo(
    () => campaigns.filter((campaign) => statusOf(campaign) === 'LIVE').length,
    [campaigns],
  );
  const anythingOn = liveCount > 0 || tabAnimation.enabled || scrollToTop.enabled;

  const setBrand = (key: BrandColourKey, hex: string) =>
    setSettings({ brandColours: { ...settings.brandColours, [key]: hex } });

  const lowContrast = (Object.keys(settings.brandColours) as BrandColourKey[]).filter(
    (key) => contrastOnWhite(settings.brandColours[key]) < 4.5,
  );

  if (error) {
    return (
      <Page title="Settings">
        <Layout>
          <Layout.Section>
            <Banner
              tone="critical"
              title="Could not load your settings"
              action={{ content: 'Retry', onAction: () => showToast('Retrying…') }}
            >
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (loading) {
    return (
      <Page title="Settings">
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={12} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Settings"
      subtitle="Applies to the whole store, not to a single campaign"
    >
      <Layout>
        <Layout.AnnotatedSection
          id="timezone"
          title="Time zone"
          description="One mode for every campaign, countdown and time range. Two campaigns in one store must never disagree about what 7am means."
        >
          <Card>
            <BlockStack gap="300">
              <ChoiceList
                title="How times are measured"
                titleHidden
                selected={[settings.timezoneMode]}
                choices={[
                  {
                    label: timezoneModeLabel.LOCAL,
                    value: 'LOCAL',
                    helpText:
                      "Each shopper's own time zone. Midnight means midnight where they are, so a campaign ends at a different absolute moment in each market.",
                  },
                  {
                    label: timezoneModeLabel.STORE_ADMIN,
                    value: 'STORE_ADMIN',
                    helpText:
                      '7am means 7am your time, everywhere — the same absolute moment for every shopper.',
                  },
                ]}
                onChange={(selected) => {
                  const next = selected[0];
                  if (next) setSettings({ timezoneMode: next as TimezoneMode });
                }}
              />

              {settings.timezoneMode === 'STORE_ADMIN' ? (
                <Box background="bg-surface-secondary" borderRadius="200" padding="300">
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Synced from Shopify admin
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {settings.storeTimezone} — from Settings → General in Shopify admin. Change it
                      there, then re-sync here; this app never changes it behind your back.
                    </Text>
                    <InlineStack>
                      <Button
                        onClick={() =>
                          showToast(`Time zone re-synced: ${settings.storeTimezone}.`)
                        }
                      >
                        Re-sync
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Box>
              ) : null}

              {liveCount > 0 ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  {liveCount === 1 ? '1 campaign is' : `${liveCount} campaigns are`} live right now, so
                  changing this shifts when {liveCount === 1 ? 'it shows' : 'they show'}.
                </Text>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="store-health"
          title="Store health"
          description="Speed guard throttles the effects on a weak device. It measures nothing and sends nothing anywhere — it only decides how much to draw."
        >
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <ChoiceList
                  title="Speed guard"
                  selected={[settings.speedGuard]}
                  choices={(['BALANCED', 'FULL_QUALITY', 'DESKTOP_ONLY'] as SpeedGuardMode[]).map(
                    (mode) => ({
                      label: speedGuardLabel[mode],
                      value: mode,
                      helpText: speedGuardHint[mode],
                    }),
                  )}
                  onChange={(selected) => {
                    const next = selected[0];
                    if (next) setSettings({ speedGuard: next as SpeedGuardMode });
                  }}
                />

                <Divider />

                <BlockStack gap="150">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h3" variant="headingSm">
                      Accessibility
                    </Text>
                    <Badge tone="success">Always on</Badge>
                  </InlineStack>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Reduce-motion is respected, no effect layer can intercept a click, decoration is
                    hidden from screen readers, and nothing plays sound before a shopper asks for it.
                    None of that is a setting, because none of it should be optional.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <BlockStack gap="300">
                  <BlockStack gap="150">
                    <Text as="h3" variant="headingSm">
                      Turn everything off
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Stops every effect on the storefront at once, including both always-on modules.
                      Nothing is deleted and your theme is untouched — switch things back on and the
                      setup is exactly as it was.
                    </Text>
                  </BlockStack>

                  {/* Below the text, not squeezed beside it: a two-word button that
                      wraps onto two lines reads as broken. */}
                  <InlineStack>
                    <Button tone="critical" disabled={!anythingOn} onClick={() => setKillOpen(true)}>
                      Turn everything off
                    </Button>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="markets"
          title="Markets"
          description="Read-only. Markets are added and removed in Shopify, and this app syncs the list so a campaign can target them."
        >
          <Card>
            <BlockStack gap="300">
              <InlineStack gap="150" wrap>
                {markets.map((market) => (
                  <Tag key={market.id}>
                    {market.primary ? `${market.name} · primary` : market.name}
                  </Tag>
                ))}
              </InlineStack>

              <Text as="p" variant="bodySm" tone="subdued">
                Last synced {formatDateTime(marketsSyncedAt)}. Twelve holiday campaigns for 2027 are
                waiting as drafts for these markets.
              </Text>

              <InlineStack gap="200">
                <Button onClick={() => showToast('Markets re-synced from Shopify.')}>Re-sync</Button>
                <Button
                  variant="tertiary"
                  onClick={() => showToast('This would open Shopify → Settings → Markets.')}
                >
                  Manage in Shopify
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>

        <Layout.AnnotatedSection
          id="brand"
          title="Brand colours"
          description="Read from your theme on install. Changing them here does not touch the theme — it only tells this app what your brand looks like."
        >
          <Card>
            <BlockStack gap="300">
              <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
                {(Object.keys(settings.brandColours) as BrandColourKey[]).map((key) => (
                  <ColorField
                    key={key}
                    label={brandColourLabel[key]}
                    value={settings.brandColours[key]}
                    onChange={(hex) => setBrand(key, hex)}
                  />
                ))}
              </InlineGrid>

              {lowContrast.length > 0 ? (
                <Banner tone="warning" title="White text will be hard to read">
                  <p>
                    {lowContrast.map((key) => brandColourLabel[key]).join(' and ')}{' '}
                    {lowContrast.length === 1 ? 'falls' : 'fall'} below the 4.5:1 contrast ratio against
                    white text. Darken {lowContrast.length === 1 ? 'it' : 'them'}, or the announcement
                    bar will be hard to read.
                  </p>
                </Banner>
              ) : null}

              <Text as="p" variant="bodySm" tone="subdued">
                Theme colours, then these overrides, then a seasonal skin while a campaign runs. If you
                change a colour here and see nothing on your storefront, a campaign with its skin on is
                almost certainly the reason.
              </Text>

              <InlineStack gap="200">
                <Button
                  onClick={() => {
                    setSettings({ brandColours: { ...brandColoursFromTheme } });
                    showToast('Brand colours reset to your theme.');
                  }}
                >
                  Reset to theme
                </Button>
                <Button
                  variant="tertiary"
                  onClick={() => showToast('Colours re-read from your current theme.')}
                >
                  Re-scan theme
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.AnnotatedSection>
      </Layout>

      <Modal
        open={killOpen}
        onClose={() => setKillOpen(false)}
        title="Turn every effect off?"
        primaryAction={{
          content: 'Turn everything off',
          destructive: true,
          onAction: () => {
            killAll();
            setKillOpen(false);
            showToast('Every effect is off. Nothing is deleted — switch them back on any time.');
          },
        }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setKillOpen(false) }]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">
              This deactivates every running campaign and both always-on modules straight away.
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              No configuration is lost and your theme is not modified.
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
