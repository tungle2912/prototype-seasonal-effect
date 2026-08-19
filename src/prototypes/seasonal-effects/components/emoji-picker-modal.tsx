import { BlockStack, Modal, Text, TextField } from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';
import { useMemo, useState } from 'react';

import { searchEmoji } from '../../../mocks/seasonal-effects/emoji';

/**
 * Emoji picker.
 *
 * Polaris has no emoji grid, so each option is a plain `<button>` — the character
 * itself is the label, which is why the accessible name comes from the keywords.
 */

interface EmojiPickerModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onPick: (emoji: string) => void;
}

export function EmojiPickerModal({
  open,
  title = 'Pick an emoji',
  onClose,
  onPick,
}: EmojiPickerModalProps) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchEmoji(query), [query]);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <Modal.Section>
        <BlockStack gap="300">
          <TextField
            label="Search emoji"
            labelHidden
            value={query}
            onChange={setQuery}
            autoComplete="off"
            prefix={<SearchIcon width={16} height={16} />}
            placeholder="Search — gift, snow, fire…"
            clearButton
            onClearButtonClick={() => setQuery('')}
          />

          {results.length === 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">
              {`No emoji matches “${query}”.`}
            </Text>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
                gap: 'var(--p-space-100)',
                maxHeight: '18rem',
                overflowY: 'auto',
              }}
            >
              {results.map((option) => (
                <button
                  key={option.emoji}
                  type="button"
                  aria-label={option.keywords}
                  onClick={() => {
                    onPick(option.emoji);
                    onClose();
                  }}
                  style={{
                    fontSize: 'var(--p-font-size-450)',
                    lineHeight: 1,
                    padding: 'var(--p-space-150)',
                    border: 'var(--p-border-width-025) solid transparent',
                    borderRadius: 'var(--p-border-radius-200)',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
