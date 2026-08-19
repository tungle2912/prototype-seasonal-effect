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
  Tag,
  Text,
  TextField,
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';
import { useState } from 'react';

import { markets } from '../../../../mocks/markets';
import {
  collectionOptions,
  productOptions,
  type Campaign,
  type DeviceTarget,
  type Frequency,
  type ResourceScope,
  type ShopperType,
} from '../../../../mocks/seasonal-effects/campaigns';
import { optionsFrom } from '../../components/options';
import { ResourcePickerModal, type PickerItem } from '../../components/resource-picker-modal';
import { issueFor, type Issue } from '../../state/validation';

/** Sentinel for the "no specific market" row of the select. */
const ALL_MARKETS = 'ALL_MARKETS';

/**
 * Targeting.
 *
 * Two rules run through the whole tab. Exclusions always win over inclusions, and
 * an empty selection is never silently widened back to "everything" — if the
 * merchant picked "specific products" and then removed them all, the campaign shows
 * nowhere, and the screen says so instead of quietly showing it everywhere.
 */

const DEVICE_LABEL: Record<DeviceTarget, string> = {
  ALL: 'All devices',
  DESKTOP: 'Desktop only',
  MOBILE: 'Mobile only',
};

const SHOPPER_LABEL: Record<ShopperType, string> = {
  EVERYONE: 'Everyone',
  FIRST_TIME: 'First-time shoppers',
  RETURNING: 'Returning shoppers',
};

const FREQUENCY_LABEL: Record<Frequency, string> = {
  ONCE_PER_DAY: 'Once per shopper per day',
  EVERY_PAGE_LOAD: 'Every page load',
  FIRST_VISIT_ONLY: 'First visit only',
};

interface TargetingTabProps {
  campaign: Campaign;
  onChange: (next: Campaign) => void;
  issues: Issue[];
}

export function TargetingTab({ campaign, onChange, issues }: TargetingTabProps) {
  const [picker, setPicker] = useState<'PRODUCTS' | 'COLLECTIONS' | null>(null);
  const targeting = campaign.targeting;

  const patch = (value: Partial<Campaign['targeting']>) =>
    onChange({ ...campaign, targeting: { ...targeting, ...value } });

  const productIssue = issueFor(issues, 'products');
  const collectionIssue = issueFor(issues, 'collections');
  const deviceIssue = issueFor(issues, 'device');

  const allMarkets = targeting.marketIds.length === 0;

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Display pages
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Effects never run on checkout — Shopify does not allow it, and it should not.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="200">
            <Checkbox
              label="All pages"
              checked={targeting.allPages}
              onChange={(next) =>
                patch(
                  next
                    ? { allPages: true, homePage: false, productPages: false, collectionPages: false }
                    : { allPages: false },
                )
              }
            />

            <Checkbox
              label="Home page"
              checked={targeting.homePage}
              onChange={(next) => patch({ homePage: next, allPages: false })}
            />

            <Checkbox
              label="Product pages"
              checked={targeting.productPages}
              onChange={(next) => patch({ productPages: next, allPages: false })}
            />

            {targeting.productPages ? (
              <Box paddingInlineStart="600">
                <BlockStack gap="200">
                  <ChoiceList
                    title="Which products"
                    titleHidden
                    selected={[targeting.productScope]}
                    choices={[
                      { label: 'All products', value: 'ALL' },
                      {
                        label: 'Specific products',
                        value: 'SPECIFIC',
                        renderChildren: (selected: boolean) =>
                          selected ? (
                            <SelectedResources
                              items={productOptions}
                              selectedIds={targeting.productIds}
                              buttonLabel="Select products"
                              emptyLabel="No product selected yet"
                              onOpen={() => setPicker('PRODUCTS')}
                              onRemove={(id) =>
                                patch({
                                  productIds: targeting.productIds.filter((entry) => entry !== id),
                                })
                              }
                            />
                          ) : null,
                      },
                    ]}
                    onChange={(selected) => {
                      const next = selected[0];
                      if (next) patch({ productScope: next as ResourceScope });
                    }}
                  />

                  {productIssue ? (
                    <Banner tone="warning">
                      <p>{productIssue.message}</p>
                    </Banner>
                  ) : null}
                </BlockStack>
              </Box>
            ) : null}

            <Checkbox
              label="Collection pages"
              checked={targeting.collectionPages}
              onChange={(next) => patch({ collectionPages: next, allPages: false })}
            />

            {targeting.collectionPages ? (
              <Box paddingInlineStart="600">
                <BlockStack gap="200">
                  <ChoiceList
                    title="Which collections"
                    titleHidden
                    selected={[targeting.collectionScope]}
                    choices={[
                      { label: 'All collections', value: 'ALL' },
                      {
                        label: 'Specific collections',
                        value: 'SPECIFIC',
                        renderChildren: (selected: boolean) =>
                          selected ? (
                            <SelectedResources
                              items={collectionOptions}
                              selectedIds={targeting.collectionIds}
                              buttonLabel="Select collections"
                              emptyLabel="No collection selected yet"
                              onOpen={() => setPicker('COLLECTIONS')}
                              onRemove={(id) =>
                                patch({
                                  collectionIds: targeting.collectionIds.filter(
                                    (entry) => entry !== id,
                                  ),
                                })
                              }
                            />
                          ) : null,
                      },
                    ]}
                    onChange={(selected) => {
                      const next = selected[0];
                      if (next) patch({ collectionScope: next as ResourceScope });
                    }}
                  />

                  {collectionIssue ? (
                    <Banner tone="warning">
                      <p>{collectionIssue.message}</p>
                    </Banner>
                  ) : null}
                </BlockStack>
              </Box>
            ) : null}

            {!targeting.allPages &&
            !targeting.homePage &&
            !targeting.productPages &&
            !targeting.collectionPages ? (
              <Banner tone="warning">
                <p>
                  No page type is selected, so the campaign has nowhere to show. Tick at least one, or
                  go back to all pages.
                </p>
              </Banner>
            ) : null}
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Exclude pages
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              A full URL or a path. Matched on the path, ignoring the query string and any trailing
              slash. An exclusion always beats everything above.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="200">
            {targeting.excludeUrls.map((url, index) => (
              <InlineStack key={index} gap="200" blockAlign="end" wrap={false}>
                <Box width="100%">
                  <TextField
                    label={`Excluded page ${index + 1}`}
                    labelHidden
                    value={url}
                    autoComplete="off"
                    placeholder="/pages/wholesale"
                    onChange={(next) =>
                      patch({
                        excludeUrls: targeting.excludeUrls.map((entry, position) =>
                          position === index ? next : entry,
                        ),
                      })
                    }
                  />
                </Box>
                <Button
                  variant="tertiary"
                  tone="critical"
                  icon={DeleteIcon}
                  accessibilityLabel={`Remove excluded page ${index + 1}`}
                  onClick={() =>
                    patch({
                      excludeUrls: targeting.excludeUrls.filter((_, position) => position !== index),
                    })
                  }
                />
              </InlineStack>
            ))}

            <InlineStack>
              <Button onClick={() => patch({ excludeUrls: [...targeting.excludeUrls, ''] })}>
                Add page URL
              </Button>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Audience
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Markets come from Shopify, so one store can run Diwali for shoppers in India and
              Christmas for shoppers in Germany on the same day.
            </Text>
          </BlockStack>

          <Divider />

          <BlockStack gap="300">
            {/* Full width rather than half of a two-up grid: the other half would be
                an empty hole beside it. */}
            <Select
              label="Market"
              options={[
                { label: 'All markets', value: ALL_MARKETS },
                ...markets.map((market) => ({
                  label: market.primary ? `${market.name} (primary)` : market.name,
                  value: market.id,
                  disabled: !market.enabled,
                })),
              ]}
              value={allMarkets ? ALL_MARKETS : (targeting.marketIds[0] ?? ALL_MARKETS)}
              onChange={(next) => patch({ marketIds: next === ALL_MARKETS ? [] : [next] })}
              helpText="Managed in Shopify. Add or remove markets there, then re-sync in Settings."
            />

            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <div>
                <Select
                  label="Shoppers"
                  options={optionsFrom(SHOPPER_LABEL, [
                    'EVERYONE',
                    'FIRST_TIME',
                    'RETURNING',
                  ]).map((option) => ({ label: option.label, value: option.value }))}
                  value={targeting.shopperType}
                  onChange={(next) => patch({ shopperType: next as ShopperType })}
                />
              </div>

              <div>
                <Select
                  label="How often a shopper sees it"
                  options={optionsFrom(FREQUENCY_LABEL, [
                    'ONCE_PER_DAY',
                    'EVERY_PAGE_LOAD',
                    'FIRST_VISIT_ONLY',
                  ]).map((option) => ({ label: option.label, value: option.value }))}
                  value={targeting.frequency}
                  onChange={(next) => patch({ frequency: next as Frequency })}
                  helpText={
                    targeting.frequency === 'EVERY_PAGE_LOAD'
                      ? 'Every page load is what most apps default to, and the reason regular shoppers find effects annoying.'
                      : undefined
                  }
                />
              </div>
            </InlineGrid>
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Device
          </Text>

          <Divider />

          <ChoiceList
            title="Show on"
            titleHidden
            selected={[targeting.device]}
            choices={[
              {
                label: DEVICE_LABEL.ALL,
                value: 'ALL',
                helpText: 'The default.',
              },
              {
                label: DEVICE_LABEL.DESKTOP,
                value: 'DESKTOP',
                helpText: 'Nothing renders on a phone or tablet.',
              },
              {
                label: DEVICE_LABEL.MOBILE,
                value: 'MOBILE',
                helpText: 'Nothing renders on a desktop browser.',
              },
            ]}
            onChange={(selected) => {
              const next = selected[0];
              if (next) patch({ device: next as DeviceTarget });
            }}
          />

          <Text as="p" variant="bodySm" tone="subdued">
            Decided once when the page loads, from pointer capability and viewport — it does not flip
            when a window is resized.
          </Text>

          {deviceIssue ? (
            <Banner tone="warning">
              <p>{deviceIssue.message}</p>
            </Banner>
          ) : null}
        </BlockStack>
      </Card>

      <ResourcePickerModal
        open={picker === 'PRODUCTS'}
        title="Select products"
        items={productOptions}
        selectedIds={targeting.productIds}
        resourceName={{ singular: 'product', plural: 'products' }}
        onClose={() => setPicker(null)}
        onConfirm={(ids) => {
          patch({ productIds: ids, productScope: 'SPECIFIC' });
          setPicker(null);
        }}
      />

      <ResourcePickerModal
        open={picker === 'COLLECTIONS'}
        title="Select collections"
        items={collectionOptions}
        selectedIds={targeting.collectionIds}
        resourceName={{ singular: 'collection', plural: 'collections' }}
        onClose={() => setPicker(null)}
        onConfirm={(ids) => {
          patch({ collectionIds: ids, collectionScope: 'SPECIFIC' });
          setPicker(null);
        }}
      />
    </BlockStack>
  );
}

/**
 * The picker button and what has been picked, in the place the choice was made.
 *
 * Showing the chosen records rather than a count is the difference between "3
 * selected" and knowing whether the right three are selected — and each one can be
 * dropped here without reopening the picker.
 */
function SelectedResources({
  items,
  selectedIds,
  buttonLabel,
  emptyLabel,
  onOpen,
  onRemove,
}: {
  items: PickerItem[];
  selectedIds: string[];
  buttonLabel: string;
  emptyLabel: string;
  onOpen: () => void;
  onRemove: (id: string) => void;
}) {
  const chosen = items.filter((item) => selectedIds.includes(item.id));

  return (
    <BlockStack gap="200">
      <InlineStack>
        <Button onClick={onOpen}>{buttonLabel}</Button>
      </InlineStack>

      {chosen.length === 0 ? (
        <Text as="span" variant="bodySm" tone="subdued">
          {emptyLabel}
        </Text>
      ) : (
        <InlineStack gap="150" wrap>
          {chosen.map((item) => (
            <Tag key={item.id} onRemove={() => onRemove(item.id)}>
              {item.title}
            </Tag>
          ))}
        </InlineStack>
      )}
    </BlockStack>
  );
}
