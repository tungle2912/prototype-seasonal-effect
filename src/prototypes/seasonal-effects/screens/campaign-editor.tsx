import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  ContextualSaveBar,
  EmptyState,
  InlineGrid,
  InlineStack,
  Layout,
  Modal,
  Page,
  SkeletonBodyText,
  Tabs,
  Text,
  TextField,
} from '@shopify/polaris';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

import emptyStateImage from '../../../assets/empty-state.svg';
import { formatDate } from '../../../lib/format';
import { marketLabel } from '../../../mocks/markets';
import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { useChromeHidden } from '../../../shell/chrome-state';
import { StorefrontPreview } from '../components/preview/storefront-preview';
import { StickyPreview } from '../components/sticky-preview';
import { EmbedRequiredModal, PublishFlow } from '../components/publish-flow';
import { useApp } from '../state/app-state';
import { statusLabel, statusOf, statusTone } from '../state/campaign-status';
import { blockingIssues, campaignIssues } from '../state/validation';
import { ElementsTab } from './editor/elements-tab';
import { ScheduleTab } from './editor/schedule-tab';
import { TargetingTab } from './editor/targeting-tab';

/**
 * The campaign editor.
 *
 * Two-column, because Built for Shopify asks visual editors for exactly that: the
 * merchant edits on the left and watches the result on the right. Not two halves —
 * the editor takes the room it needs and the preview rail is the width of a phone.
 * The preview lives outside the tabs and never remounts when they switch, so the
 * snow does not restart every time they go to check the schedule.
 *
 * The rail holds the preview and nothing else. Anything stacked under it makes the
 * column taller than the window, and a sticky box taller than the window cannot
 * stay on screen — which is why the request-an-effect card is at the foot of the
 * editor instead.
 *
 * Unsaved work is reported through `ContextualSaveBar` rather than a Save button
 * parked in the header — that is how the admin does it, and it makes discarding an
 * edit a first-class action instead of a browser back button.
 */

const TABS = [
  { id: 'elements', content: 'Elements' },
  { id: 'schedule', content: 'Schedule & trigger' },
  { id: 'targeting', content: 'Targeting' },
];

const TAB_PARAM = 'tab';

export function CampaignEditorScreen() {
  const {
    editing,
    loading,
    error,
    embed,
    scrollToTop,
    settings,
    saveEditing,
    setEnabled,
    goTo,
    createCampaign,
    showToast,
  } = useApp();
  const chromeHidden = useChromeHidden();

  const [draft, setDraft] = useState<Campaign | null>(editing);
  const [loadedId, setLoadedId] = useState<string | null>(editing?.id ?? null);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = TABS.findIndex((entry) => entry.id === searchParams.get(TAB_PARAM));
  const tab = tabFromUrl >= 0 ? tabFromUrl : 0;

  const setTab = (next: number) => {
    const params = new URLSearchParams(searchParams);
    const id = TABS[next]?.id;
    if (!id || next === 0) params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, id);
    setSearchParams(params, { replace: true });
  };
  const [renameOpen, setRenameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [pendingPublish, setPendingPublish] = useState<string[]>([]);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  // Deriving the working copy from the record being edited, rather than in an
  // effect: opening another campaign has to replace the draft immediately.
  if (editing && editing.id !== loadedId) {
    setLoadedId(editing.id);
    setDraft(editing);
  }

  if (error) {
    return (
      <Page
        title="Campaign"
        backAction={{ content: 'Campaigns', onAction: () => goTo('CAMPAIGNS') }}
      >
        <Layout>
          <Layout.Section>
            <Banner
              tone="critical"
              title="Could not load this campaign"
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
      <Page
        fullWidth
        title="Campaign"
        backAction={{ content: 'Campaigns', onAction: () => goTo('CAMPAIGNS') }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <SkeletonBodyText lines={10} />
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <SkeletonBodyText lines={10} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Nothing to edit: the empty state of the whole app, reached by deep-linking the
  // editor before any campaign exists.
  if (!draft) {
    return (
      <Page
        title="Campaign"
        backAction={{ content: 'Campaigns', onAction: () => goTo('CAMPAIGNS') }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <EmptyState
                heading="No campaign to edit yet"
                image={emptyStateImage}
                action={{ content: 'Create campaign', onAction: createCampaign }}
              >
                <p>
                  A campaign holds the effects, the dates and the audience together, so the
                  decorations go up and come down on their own.
                </p>
              </EmptyState>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const saved = editing;
  const dirty = saved ? JSON.stringify(draft) !== JSON.stringify(saved) : true;
  const status = statusOf(draft);
  const issues = campaignIssues(draft);
  const blocking = blockingIssues(issues);
  const isLive = status === 'LIVE';

  const { start, end, visibilityEnabled } = draft.schedule;
  const subtitle = [
    visibilityEnabled && start && end ? dateRange(start, end) : 'No end date',
    marketLabel(draft.targeting.marketIds),
    // A live campaign has no draft state: every edit is on the storefront at once.
    isLive ? 'edits go live instantly' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const commit = (next: Campaign) => {
    saveEditing(next);
    showToast('Campaign saved.');
  };

  const publishable = status === 'DRAFT' || status === 'PAUSED';

  return (
    <>
      {dirty && !chromeHidden ? (
        <ContextualSaveBar
          message={blocking.length > 0 ? 'Fix the errors below to save' : 'Unsaved campaign'}
          saveAction={{
            onAction: () => commit(draft),
            disabled: blocking.length > 0,
          }}
          discardAction={{
            onAction: () => {
              if (saved) setDraft(saved);
              else goTo('CAMPAIGNS');
            },
          }}
        />
      ) : null}

      <Page
        fullWidth
        backAction={{ content: 'Campaigns', onAction: () => goTo('CAMPAIGNS') }}
        title={draft.name.trim() || 'Untitled campaign'}
        subtitle={subtitle}
        titleMetadata={<Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>}
        primaryAction={
          publishable
            ? {
                content: 'Publish',
                disabled: blocking.length > 0,
                onAction: () => {
                  // Save first: the publish dialog quotes the dates and effect count,
                  // and quoting numbers the merchant has not saved would be a lie.
                  if (dirty) saveEditing(draft);
                  setPendingPublish([draft.id]);
                },
              }
            : {
                content: 'Save',
                disabled: !dirty || blocking.length > 0,
                onAction: () => commit(draft),
              }
        }
        secondaryActions={[
          {
            content: 'Rename',
            onAction: () => {
              setNameDraft(draft.name);
              setRenameOpen(true);
            },
          },
          ...(status === 'LIVE' || status === 'SCHEDULED'
            ? [
                {
                  content: 'Deactivate',
                  onAction: () => {
                    setEnabled([draft.id], false);
                    showToast('Campaign deactivated. Its settings are kept.');
                  },
                },
              ]
            : []),
        ]}
      >
        {/* `InlineGrid`, not `Layout`: Polaris' flex row aligns its columns to
            `flex-start`, so the rail is only as tall as the preview and a sticky
            child inside it has nowhere to travel. Grid items stretch, which is
            what makes the preview actually stay put. The rail is a fixed 22.5rem
            — the width of a phone — and the editor takes everything else. */}
        <InlineGrid columns={{ xs: 1, lg: 'minmax(0, 1fr) 22.5rem' }} gap="400">
          <div>
            <BlockStack gap="400">
              {!embed.enabled ? (
                <Banner
                  tone="warning"
                  title="This campaign cannot reach your storefront"
                  action={{
                    content: 'Turn on the app embed',
                    onAction: () => setEmbedModalOpen(true),
                  }}
                >
                  <p>
                    The app embed is off. You can keep editing and even publish, but shoppers will
                    see nothing until it is on.
                  </p>
                </Banner>
              ) : null}

              {blocking.length > 0 ? (
                <Banner tone="critical" title="Fix these before publishing">
                  <BlockStack gap="100">
                    {blocking.map((issue) => (
                      <Text as="p" key={`${issue.field}-${issue.message}`}>
                        {issue.message}
                      </Text>
                    ))}
                  </BlockStack>
                </Banner>
              ) : null}

              {/* Tabs sit inside this column so they clearly govern only what is
                  below them — the preview beside them is not theirs to change. */}
              <Card padding="0">
                <Tabs tabs={TABS} selected={tab} onSelect={setTab} fitted={false} />
              </Card>

              {tab === 0 ? (
                <ElementsTab campaign={draft} onChange={setDraft} issues={issues} />
              ) : tab === 1 ? (
                <ScheduleTab campaign={draft} onChange={setDraft} issues={issues} />
              ) : (
                <TargetingTab campaign={draft} onChange={setDraft} issues={issues} />
              )}

              {/* At the end of the editor, not beside the preview: the rail holds
                  the preview and nothing else, or it grows past the window and
                  stops being able to stick. */}
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Missing an effect you need?
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Tell us the occasion or the artwork and we will build it.
                  </Text>
                  <InlineStack gap="200">
                    <Button
                      onClick={() =>
                        showToast(
                          'Request received. It goes into the list that decides what we build next.',
                        )
                      }
                    >
                      Request an effect
                    </Button>
                    <Button
                      variant="tertiary"
                      onClick={() => showToast('A support conversation would open here.')}
                    >
                      Ask for help
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </div>

          {/* Sticky: a preview that scrolls out of view while you edit is not a
              live preview. Only the settings column moves. */}
          <StickyPreview>
            <StorefrontPreview
              campaign={draft}
              scrollToTop={scrollToTop}
              settings={settings}
              embedEnabled={embed.enabled}
            />
          </StickyPreview>
        </InlineGrid>

        <PublishFlow ids={pendingPublish} onClose={() => setPendingPublish([])} />

        <EmbedRequiredModal open={embedModalOpen} onClose={() => setEmbedModalOpen(false)} />

        <Modal
          open={renameOpen}
          onClose={() => setRenameOpen(false)}
          title="Campaign name"
          primaryAction={{
            content: 'Save',
            onAction: () => {
              setDraft({ ...draft, name: nameDraft });
              setRenameOpen(false);
            },
          }}
          secondaryActions={[{ content: 'Cancel', onAction: () => setRenameOpen(false) }]}
        >
          <Modal.Section>
            <TextField
              label="Campaign name"
              value={nameDraft}
              onChange={setNameDraft}
              autoComplete="off"
              autoFocus
              placeholder="e.g. Christmas 2026"
              helpText="Only you see this. It never appears on your storefront, and leaving it empty is fine."
            />
          </Modal.Section>
        </Modal>
      </Page>
    </>
  );
}

/** "Dec 1 – Dec 26, 2026": the year once, so the subtitle stays on one line. */
function dateRange(start: string, end: string): string {
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  if (!sameYear) return `${formatDate(start)} – ${formatDate(end)}`;
  const startShort = new Date(start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${startShort} – ${formatDate(end)}`;
}
