import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  EmptyState,
  IndexFilters,
  IndexTable,
  InlineStack,
  Layout,
  Modal,
  Page,
  SkeletonBodyText,
  Text,
  Tooltip,
  useIndexResourceState,
  useSetIndexFiltersMode,
  type IndexFiltersProps,
} from '@shopify/polaris';
import { AlertTriangleIcon, DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';

import emptyStateImage from '../../../assets/empty-state.svg';
import { formatDate } from '../../../lib/format';
import { marketLabel } from '../../../mocks/markets';
import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import { toDate } from '../../../mocks/seasonal-effects/today';
import { EmbedRequiredModal, PublishFlow } from '../components/publish-flow';
import { useApp } from '../state/app-state';
import {
  campaignTabs,
  findConflicts,
  inTab,
  isDimmed,
  statusLabel,
  statusOf,
  statusTone,
  whenSummary,
  type CampaignTab,
} from '../state/campaign-status';

/**
 * The campaign index.
 *
 * Full-width, as Built for Shopify asks for a resource index with this many
 * columns. One rule shapes the whole screen: there is exactly one way to switch a
 * campaign on or off — tick it and use Activate or Deactivate. A toggle in the
 * Status column as well would be two code paths to keep in step and two places
 * for the publish confirmation to be forgotten.
 */

const SORT_OPTIONS: IndexFiltersProps['sortOptions'] = [
  { label: 'Last updated', value: 'updatedAt desc', directionLabel: 'Newest first' },
  { label: 'Last updated', value: 'updatedAt asc', directionLabel: 'Oldest first' },
  { label: 'Created', value: 'createdAt desc', directionLabel: 'Newest first' },
  { label: 'Created', value: 'createdAt asc', directionLabel: 'Oldest first' },
  { label: 'Campaign', value: 'name asc', directionLabel: 'A–Z' },
  { label: 'Campaign', value: 'name desc', directionLabel: 'Z–A' },
];

export function CampaignsScreen() {
  const {
    campaigns,
    loading,
    error,
    embed,
    goTo,
    openEditor,
    createCampaign,
    setEnabled,
    duplicate,
    remove,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<CampaignTab>('ALL');
  const [query, setQuery] = useState('');
  const [sortSelected, setSortSelected] = useState(['updatedAt desc']);
  const { mode, setMode } = useSetIndexFiltersMode();

  const [pendingPublish, setPendingPublish] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const rows = useMemo(
    () =>
      sortCampaigns(filterCampaigns(campaigns, tab, query), sortSelected[0] ?? 'updatedAt desc'),
    [campaigns, tab, query, sortSelected],
  );

  // useIndexResourceState only needs ids, and typing it to the Campaign record
  // would force an index signature onto the fixture shape.
  const rowIds = useMemo(() => rows.map((campaign) => ({ id: campaign.id })), [rows]);
  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } =
    useIndexResourceState(rowIds);

  const conflicts = useMemo(() => findConflicts(campaigns), [campaigns]);

  const tabs: IndexFiltersProps['tabs'] = campaignTabs.map((entry) => ({
    id: entry.id,
    content: entry.label,
    badge: String(campaigns.filter((campaign) => inTab(statusOf(campaign), entry.id)).length),
  }));

  const runBulk = (action: 'ACTIVATE' | 'DEACTIVATE' | 'DUPLICATE', ids: string[]) => {
    if (action === 'ACTIVATE') {
      setPendingPublish(ids);
      return;
    }
    if (action === 'DEACTIVATE') {
      setEnabled(ids, false);
      showToast(
        ids.length === 1 ? '1 campaign deactivated.' : `${ids.length} campaigns deactivated.`,
      );
    }
    if (action === 'DUPLICATE') {
      duplicate(ids);
      showToast(
        ids.length === 1
          ? 'Copy created as a draft. It will not go live on its own.'
          : `${ids.length} copies created as drafts. They will not go live on their own.`,
      );
    }
    clearSelection();
  };

  if (error) {
    return (
      <Page title="Campaigns" backAction={{ content: 'Home', onAction: () => goTo('HOME') }}>
        <Layout>
          <Layout.Section>
            <Banner
              tone="critical"
              title="Could not load your campaigns"
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
    <Page
      backAction={{ content: 'Home', onAction: () => goTo('HOME') }}
      title="Campaigns"
      primaryAction={{ content: 'Create campaign', onAction: createCampaign }}
      secondaryActions={
        embed.enabled
          ? undefined
          : [
              {
                content: 'Embed required',
                icon: AlertTriangleIcon,
                onAction: () => setEmbedModalOpen(true),
              },
            ]
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {!embed.enabled ? (
              <Banner
                tone="warning"
                title="Nothing is showing on your storefront"
                action={{ content: 'Turn it on', onAction: () => setEmbedModalOpen(true) }}
              >
                <p>
                  The app embed is off, so every campaign below is inactive no matter what its
                  status says.
                </p>
              </Banner>
            ) : null}

            {conflicts.length > 0 ? (
              <Banner tone="warning" title="Two campaigns overlap">
                <BlockStack gap="200">
                  {conflicts.map((conflict) => (
                    <Text as="p" key={`${conflict.winner.id}-${conflict.suppressed.id}`}>
                      <b>{conflict.winner.name}</b> and <b>{conflict.suppressed.name}</b> both run{' '}
                      {conflict.overlap
                        ? conflict.overlap.start.slice(0, 10) === conflict.overlap.end.slice(0, 10)
                          ? `on ${formatDate(conflict.overlap.start)}`
                          : `from ${formatDate(conflict.overlap.start)} to ${formatDate(conflict.overlap.end)}`
                        : 'at the same time'}{' '}
                      for the same market. For those days the later start date wins, so{' '}
                      <b>{conflict.suppressed.name}</b> steps aside — nothing it is set to is lost.
                    </Text>
                  ))}
                </BlockStack>
              </Banner>
            ) : null}

            <Card padding="0">
              <IndexFilters
                queryValue={query}
                queryPlaceholder="Search campaigns by name"
                onQueryChange={setQuery}
                onQueryClear={() => setQuery('')}
                tabs={tabs}
                selected={campaignTabs.findIndex((entry) => entry.id === tab)}
                onSelect={(index) => {
                  const next = campaignTabs[index];
                  if (next) setTab(next.id);
                  clearSelection();
                }}
                sortOptions={SORT_OPTIONS}
                sortSelected={sortSelected}
                onSort={setSortSelected}
                filters={[]}
                appliedFilters={[]}
                onClearAll={() => setQuery('')}
                hideFilters
                canCreateNewView={false}
                loading={loading}
                mode={mode}
                setMode={setMode}
              />

              {loading ? (
                <div style={{ padding: 'var(--p-space-400)' }}>
                  <SkeletonBodyText lines={8} />
                </div>
              ) : (
                <IndexTable
                  resourceName={{ singular: 'campaign', plural: 'campaigns' }}
                  itemCount={rows.length}
                  selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                  onSelectionChange={handleSelectionChange}
                  emptyState={
                    <EmptyState
                      heading={
                        query
                          ? `No campaign matches “${query}”`
                          : 'Nothing scheduled for this season yet'
                      }
                      image={emptyStateImage}
                      action={
                        query
                          ? { content: 'Clear search', onAction: () => setQuery('') }
                          : { content: 'Create campaign', onAction: createCampaign }
                      }
                    >
                      <p>
                        {query
                          ? 'Search matches campaign names only. Try a shorter word.'
                          : 'Start from a holiday template, set the dates once, and the campaign turns itself on and off.'}
                      </p>
                    </EmptyState>
                  }
                  promotedBulkActions={[
                    { content: 'Activate', onAction: () => runBulk('ACTIVATE', selectedResources) },
                    {
                      content: 'Deactivate',
                      onAction: () => runBulk('DEACTIVATE', selectedResources),
                    },
                  ]}
                  bulkActions={[
                    {
                      content: 'Duplicate',
                      onAction: () => runBulk('DUPLICATE', selectedResources),
                    },
                    {
                      items: [
                        {
                          content: 'Delete',
                          destructive: true,
                          onAction: () => setPendingDelete(selectedResources),
                        },
                      ],
                    },
                  ]}
                  headings={[
                    { title: 'Campaign' },
                    { title: 'When' },
                    { title: 'Audience' },
                    { title: 'Created' },
                    { title: 'Updated' },
                    { title: 'Status' },
                    { title: 'Actions' },
                  ]}
                >
                  {rows.map((campaign, index) => (
                    <CampaignRow
                      key={campaign.id}
                      campaign={campaign}
                      index={index}
                      selected={selectedResources.includes(campaign.id)}
                      onOpen={() => openEditor(campaign.id)}
                      onDelete={() => setPendingDelete([campaign.id])}
                    />
                  ))}
                </IndexTable>
              )}
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <PublishFlow
        ids={pendingPublish}
        onClose={() => {
          setPendingPublish([]);
          clearSelection();
        }}
      />

      <EmbedRequiredModal open={embedModalOpen} onClose={() => setEmbedModalOpen(false)} />

      <DeleteConfirmModal
        ids={pendingDelete}
        campaigns={campaigns}
        onClose={() => setPendingDelete([])}
        onConfirm={(ids) => {
          remove(ids);
          showToast(ids.length === 1 ? '1 campaign deleted.' : `${ids.length} campaigns deleted.`);
          setPendingDelete([]);
          clearSelection();
        }}
      />
    </Page>
  );
}

function CampaignRow({
  campaign,
  index,
  selected,
  onOpen,
  onDelete,
}: {
  campaign: Campaign;
  index: number;
  selected: boolean;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const status = statusOf(campaign);
  const { start, end, visibilityEnabled } = campaign.schedule;

  return (
    <IndexTable.Row
      id={campaign.id}
      position={index}
      selected={selected}
      onClick={onOpen}
      disabled={false}
      tone={isDimmed(status) ? 'subdued' : undefined}
    >
      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span" fontWeight="semibold">
            {campaign.name || 'Untitled campaign'}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {effectSummary(campaign)}
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <BlockStack gap="050">
          <Text as="span">
            {visibilityEnabled && start && end
              ? `${formatDate(start)} – ${formatDate(end)}`
              : 'No end date'}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {whenSummary(campaign)}
          </Text>
        </BlockStack>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span">{marketLabel(campaign.targeting.marketIds)}</Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodySm" tone="subdued">
          {formatDate(campaign.createdAt)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Text as="span" variant="bodySm" tone="subdued">
          {formatDate(campaign.updatedAt)}
        </Text>
      </IndexTable.Cell>

      <IndexTable.Cell>
        <Badge tone={statusTone[status]}>{statusLabel[status]}</Badge>
      </IndexTable.Cell>

      <IndexTable.Cell>
        {/* Row actions have to stop the click reaching the row, or every delete
            would also open the editor behind the confirmation. */}
        <div
          onClick={(event) => event.stopPropagation()}
          onKeyUp={(event) => event.stopPropagation()}
          role="presentation"
        >
          <InlineStack gap="100" wrap={false}>
            <Tooltip content="Edit campaign">
              <Button
                variant="tertiary"
                icon={EditIcon}
                accessibilityLabel={`Edit ${campaign.name || 'untitled campaign'}`}
                onClick={onOpen}
              />
            </Tooltip>
            <Tooltip content="Delete campaign">
              <Button
                variant="tertiary"
                tone="critical"
                icon={DeleteIcon}
                accessibilityLabel={`Delete ${campaign.name || 'untitled campaign'}`}
                onClick={onDelete}
              />
            </Tooltip>
          </InlineStack>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}

function DeleteConfirmModal({
  ids,
  campaigns,
  onClose,
  onConfirm,
}: {
  ids: string[];
  campaigns: Campaign[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const targets = campaigns.filter((campaign) => ids.includes(campaign.id));
  const live = targets.filter((campaign) => statusOf(campaign) === 'LIVE');

  return (
    <Modal
      open={ids.length > 0}
      onClose={onClose}
      title={targets.length === 1 ? 'Delete this campaign?' : `Delete ${targets.length} campaigns?`}
      primaryAction={{
        content: 'Delete',
        destructive: true,
        onAction: () => onConfirm(ids),
      }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p">
            This cannot be undone. {targets.length === 1 ? 'It' : 'They'} will be removed from your
            store for good.
          </Text>

          <BlockStack gap="100">
            {targets.map((campaign) => (
              <InlineStack key={campaign.id} gap="200" blockAlign="center">
                <Text as="span" fontWeight="semibold">
                  {campaign.name || 'Untitled campaign'}
                </Text>
                <Badge tone={statusTone[statusOf(campaign)]}>
                  {statusLabel[statusOf(campaign)]}
                </Badge>
              </InlineStack>
            ))}
          </BlockStack>

          {live.length > 0 ? (
            <Banner tone="warning">
              <p>
                {live.length === 1
                  ? `${live[0]?.name} is live right now. Deleting it removes the effects from your storefront immediately.`
                  : `${live.length} of these are live right now. Deleting them removes the effects from your storefront immediately.`}
              </p>
            </Banner>
          ) : null}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function filterCampaigns(campaigns: Campaign[], tab: CampaignTab, query: string): Campaign[] {
  const term = query.trim().toLowerCase();
  return campaigns.filter(
    (campaign) =>
      inTab(statusOf(campaign), tab) && (!term || campaign.name.toLowerCase().includes(term)),
  );
}

function sortCampaigns(campaigns: Campaign[], sort: string): Campaign[] {
  const [key = 'updatedAt', direction = 'desc'] = sort.split(' ');
  const sorted = [...campaigns].sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name);
    const left = key === 'createdAt' ? a.createdAt : a.updatedAt;
    const right = key === 'createdAt' ? b.createdAt : b.updatedAt;
    return toDate(left).getTime() - toDate(right).getTime();
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

function effectSummary(campaign: Campaign): string {
  const { falling, decorations, cursor, bar, skin, moments, music } = campaign.elements;
  const count = [falling, decorations, cursor, bar, skin, moments, music].filter(
    (element) => element.enabled,
  ).length;
  if (count === 0) return 'No effect on yet';
  return count === 1 ? '1 effect on' : `${count} effects on`;
}
