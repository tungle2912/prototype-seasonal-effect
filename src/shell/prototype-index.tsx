import {
  Badge,
  BlockStack,
  Card,
  ChoiceList,
  EmptyState,
  Filters,
  InlineStack,
  Layout,
  Page,
  ResourceItem,
  ResourceList,
  Text,
} from '@shopify/polaris';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import emptyStateImage from '../assets/empty-state.svg';
import { formatDate } from '../lib/format';
import {
  allTags,
  prototypes,
  PROTOTYPE_STATUSES,
  type PrototypeEntry,
  type PrototypeStatus,
} from '../lib/registry';

const STATUS_TONE: Record<PrototypeStatus, 'info' | 'attention' | 'success'> = {
  draft: 'info',
  'in-review': 'attention',
  approved: 'success',
};

const STATUS_LABEL: Record<PrototypeStatus, string> = {
  draft: 'Draft',
  'in-review': 'In review',
  approved: 'Approved',
};

export function PrototypeIndex() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const tagOptions = useMemo(() => allTags().map((tag) => ({ label: tag, value: tag })), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return prototypes.filter((entry) => {
      const matchesQuery =
        needle === '' ||
        entry.title.toLowerCase().includes(needle) ||
        entry.description.toLowerCase().includes(needle) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(needle));

      const matchesStatus = statuses.length === 0 || statuses.includes(entry.status);
      const matchesTags = tags.length === 0 || tags.some((tag) => entry.tags.includes(tag));

      return matchesQuery && matchesStatus && matchesTags;
    });
  }, [query, statuses, tags]);

  const appliedFilters = [
    ...(statuses.length > 0
      ? [
          {
            key: 'status',
            label: `Status: ${statuses.map((s) => STATUS_LABEL[s as PrototypeStatus]).join(', ')}`,
            onRemove: () => setStatuses([]),
          },
        ]
      : []),
    ...(tags.length > 0
      ? [{ key: 'tags', label: `Tagged: ${tags.join(', ')}`, onRemove: () => setTags([]) }]
      : []),
  ];

  const filterControl = (
    <Filters
      queryValue={query}
      queryPlaceholder="Search prototypes"
      filters={[
        {
          key: 'status',
          label: 'Status',
          shortcut: true,
          filter: (
            <ChoiceList
              title="Status"
              titleHidden
              allowMultiple
              choices={PROTOTYPE_STATUSES.map((status) => ({
                label: STATUS_LABEL[status],
                value: status,
              }))}
              selected={statuses}
              onChange={setStatuses}
            />
          ),
        },
        {
          key: 'tags',
          label: 'Tag',
          shortcut: true,
          filter: (
            <ChoiceList
              title="Tag"
              titleHidden
              allowMultiple
              choices={tagOptions}
              selected={tags}
              onChange={setTags}
            />
          ),
        },
      ]}
      appliedFilters={appliedFilters}
      onQueryChange={setQuery}
      onQueryClear={() => setQuery('')}
      onClearAll={() => {
        setQuery('');
        setStatuses([]);
        setTags([]);
      }}
    />
  );

  const hasPrototypes = prototypes.length > 0;
  const noMatches = hasPrototypes && filtered.length === 0;

  return (
    <Page
      title="Prototypes"
      subtitle={`${prototypes.length} ${prototypes.length === 1 ? 'prototype' : 'prototypes'} in this base`}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {!hasPrototypes ? (
              <EmptyState heading="No prototypes yet" image={emptyStateImage}>
                <p>
                  Run <code>pnpm new-prototype my-feature</code> to scaffold the first one.
                </p>
              </EmptyState>
            ) : noMatches ? (
              <EmptyState heading="No prototypes match those filters" image={emptyStateImage}>
                <p>Try a different search term or clear the filters.</p>
              </EmptyState>
            ) : (
              <ResourceList
                resourceName={{ singular: 'prototype', plural: 'prototypes' }}
                items={filtered}
                filterControl={filterControl}
                renderItem={(entry: PrototypeEntry) => (
                  <ResourceItem
                    id={entry.slug}
                    accessibilityLabel={`Open ${entry.title}`}
                    onClick={() => navigate(`/p/${entry.slug}`)}
                  >
                    <BlockStack gap="150">
                      <InlineStack gap="200" blockAlign="center" wrap={false}>
                        <Text as="h3" variant="bodyMd" fontWeight="semibold">
                          {entry.title}
                        </Text>
                        <Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
                      </InlineStack>

                      <Text as="p" tone="subdued">
                        {entry.description}
                      </Text>

                      <InlineStack gap="150" blockAlign="center">
                        {entry.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                        <Text as="span" tone="subdued" variant="bodySm">
                          Updated {formatDate(entry.updated)}
                          {entry.owner ? ` · ${entry.owner}` : ''}
                        </Text>
                      </InlineStack>
                    </BlockStack>
                  </ResourceItem>
                )}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
