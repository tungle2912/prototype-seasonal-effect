import { BlockStack, Modal, ResourceItem, ResourceList, Text, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';

/**
 * Stands in for App Bridge's resource picker.
 *
 * The real app opens Shopify's own picker, which returns GIDs; this reproduces the
 * shape of that interaction — search, multi-select, a count — so the screen around
 * it is designed against the right constraints.
 */

export interface PickerItem {
  id: string;
  title: string;
  detail: string;
}

interface ResourcePickerModalProps {
  open: boolean;
  title: string;
  items: PickerItem[];
  selectedIds: string[];
  resourceName: { singular: string; plural: string };
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

export function ResourcePickerModal({
  open,
  title,
  items,
  selectedIds,
  resourceName,
  onClose,
  onConfirm,
}: ResourcePickerModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedIds);

  // Re-seed each time it opens, so cancelling really discards.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSelected(selectedIds);
      setQuery('');
    }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.title.toLowerCase().includes(term));
  }, [items, query]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: selected.length > 0 ? `Select ${selected.length}` : 'Select',
        disabled: selected.length === 0,
        onAction: () => onConfirm(selected),
      }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <TextField
            label={`Search ${resourceName.plural}`}
            labelHidden
            value={query}
            onChange={setQuery}
            autoComplete="off"
            prefix={<SearchIcon width={16} height={16} />}
            placeholder={`Search ${resourceName.plural}`}
            clearButton
            onClearButtonClick={() => setQuery('')}
          />

          <ResourceList
            resourceName={resourceName}
            items={visible}
            selectable
            selectedItems={selected}
            onSelectionChange={(next) => setSelected(next === 'All' ? items.map((i) => i.id) : next)}
            emptyState={
              <Text as="p" variant="bodySm" tone="subdued">
                {`No ${resourceName.singular} matches “${query}”.`}
              </Text>
            }
            renderItem={(item) => (
              <ResourceItem id={item.id} onClick={() => {}} accessibilityLabel={item.title}>
                <BlockStack gap="050">
                  <Text as="span" fontWeight="semibold">
                    {item.title}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {item.detail}
                  </Text>
                </BlockStack>
              </ResourceItem>
            )}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
