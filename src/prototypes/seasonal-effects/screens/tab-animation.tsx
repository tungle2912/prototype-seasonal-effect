import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Divider,
  InlineStack,
  Layout,
  List,
  Page,
  SkeletonBodyText,
  Text,
  TextField,
} from '@shopify/polaris';
import {
  DeleteIcon,
  ImageIcon,
  NotificationIcon,
  SmileyHappyIcon,
  TextFontIcon,
  TransferIcon,
} from '@shopify/polaris-icons';
import { useState } from 'react';

import {
  speedLabel,
  TAB_MESSAGE_LENGTH,
  TAB_MESSAGE_LIMIT,
  type AnimationSpeed,
  type FaviconMode,
  type TabAnimationStyle,
} from '../../../mocks/seasonal-effects/modules';
import { CardToggle } from '../components/card-toggle';
import { ChoiceCards } from '../components/choice-cards';
import { EmojiPickerModal } from '../components/emoji-picker-modal';
import { optionsFrom } from '../components/options';
import { BrowserTabPreview } from '../components/preview/browser-tab-preview';
import { Segmented } from '../components/segmented';
import { StickyPreview } from '../components/sticky-preview';
import { useApp } from '../state/app-state';

/**
 * Tab animation — an always-on module, not a campaign field.
 *
 * Merchants leave this on all year, so tying it to a holiday campaign would delete it
 * every January. It gets its own screen because it needs a preview of a browser tab,
 * and Settings has nowhere to put one.
 */

const FAVICON_CHOICES = [
  { value: 'EMOJI' as FaviconMode, label: 'Use emoji', icon: SmileyHappyIcon },
  { value: 'SITE_FAVICON' as FaviconMode, label: 'Use site favicon', icon: ImageIcon },
];

/** One card per animation, with the sentence that tells them apart. */
const ANIMATION_CHOICES = [
  {
    value: 'BLINKING' as TabAnimationStyle,
    label: 'Blinking',
    icon: NotificationIcon,
    description: 'Flashes in and out, swapping with your real title.',
  },
  {
    value: 'SCROLLING' as TabAnimationStyle,
    label: 'Scrolling',
    icon: TransferIcon,
    description: 'Slides across like a ticker, so a long line still reads.',
  },
  {
    value: 'TYPING' as TabAnimationStyle,
    label: 'Typing',
    icon: TextFontIcon,
    description: 'Types itself out one character at a time, then clears.',
  },
];

export function TabAnimationScreen() {
  const { tabAnimation, setTabAnimation, loading, error, embed, showToast } = useApp();
  const [emojiTarget, setEmojiTarget] = useState<'FAVICON' | number | null>(null);

  const written = tabAnimation.messages.filter((message) => message.trim().length > 0);

  const updateMessage = (index: number, value: string) =>
    setTabAnimation({
      messages: tabAnimation.messages.map((message, position) =>
        position === index ? value.slice(0, TAB_MESSAGE_LENGTH) : message,
      ),
    });

  if (error) {
    return (
      <Page title="Tab animation">
        <Layout>
          <Layout.Section>
            <Banner
              tone="critical"
              title="Could not load this module"
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
      fullWidth
      title="Tab animation"
      subtitle="Changes the browser tab title and favicon while a shopper is looking at another tab"
      titleMetadata={
        <Badge tone={tabAnimation.enabled ? 'success' : 'attention'}>
          {tabAnimation.enabled ? 'On' : 'Off'}
        </Badge>
      }
    >
      <Layout>
        <Layout.Section variant="oneHalf">
          {loading ? (
            <Card>
              <SkeletonBodyText lines={10} />
            </Card>
          ) : (
            <BlockStack gap="400">
              <CardToggle
                title="Tab animation"
                enabled={tabAnimation.enabled}
                description={
                  tabAnimation.enabled
                    ? 'Running on every page of your store, all year. It does not expire with a holiday.'
                    : 'Off — the tab title never changes.'
                }
                onToggle={(next) => setTabAnimation({ enabled: next })}
              />

              {tabAnimation.enabled && written.length === 0 ? (
                <Banner tone="warning" title="No message written yet">
                  <p>
                    The module is on but there is nothing to show, so the tab title will not change.
                    Write at least one message below.
                  </p>
                </Banner>
              ) : null}

              {!embed.enabled ? (
                <Banner tone="warning">
                  <p>The app embed is off, so this module is not running on your storefront either.</p>
                </Banner>
              ) : null}

              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Favicon
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      What appears as the tab icon while the message is showing.
                    </Text>
                  </BlockStack>

                  <Divider />

                  <ChoiceCards<FaviconMode>
                    label="Tab icon"
                    labelHidden
                    options={FAVICON_CHOICES}
                    value={tabAnimation.faviconMode}
                    onChange={(next) => setTabAnimation({ faviconMode: next })}
                  />

                  {tabAnimation.faviconMode === 'EMOJI' ? (
                    <Box background="bg-surface-secondary" borderRadius="200" padding="300">
                      <InlineStack gap="300" blockAlign="center">
                        <Box
                          background="bg-surface"
                          borderRadius="200"
                          borderWidth="025"
                          borderColor="border"
                          padding="200"
                        >
                          <div
                            style={{ fontSize: 'var(--p-font-size-500)', lineHeight: 1 }}
                            aria-hidden="true"
                          >
                            {tabAnimation.emoji}
                          </div>
                        </Box>
                        <Button onClick={() => setEmojiTarget('FAVICON')}>Change emoji</Button>
                      </InlineStack>
                    </Box>
                  ) : null}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Animation
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      How the message appears in the tab title.
                    </Text>
                  </BlockStack>

                  <Divider />

                  <ChoiceCards<TabAnimationStyle>
                    label="Style"
                    labelHidden
                    options={ANIMATION_CHOICES}
                    value={tabAnimation.style}
                    onChange={(next) => setTabAnimation({ style: next })}
                  />

                  <Segmented<AnimationSpeed>
                    label="Speed"
                    options={optionsFrom(speedLabel, ['SLOW', 'NORMAL', 'FAST'])}
                    value={tabAnimation.speed}
                    onChange={(next) => setTabAnimation({ speed: next })}
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <InlineStack align="space-between" blockAlign="center" wrap={false}>
                      <Text as="h2" variant="headingMd">
                        Messages
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {tabAnimation.messages.length} of {TAB_MESSAGE_LIMIT}
                      </Text>
                    </InlineStack>

                    <Text as="p" variant="bodySm" tone="subdued">
                      Up to {TAB_MESSAGE_LIMIT}, cycled in order. A browser tab is narrow and cuts the
                      rest off, which is why {TAB_MESSAGE_LENGTH} characters is the limit.
                    </Text>
                  </BlockStack>

                  <Divider />

                  <BlockStack gap="300">
                    {tabAnimation.messages.map((message, index) => (
                      <InlineStack key={index} gap="200" blockAlign="center" wrap={false}>
                        <Box minWidth="1.5rem">
                          <Text as="span" variant="bodySm" tone="subdued">
                            #{index + 1}
                          </Text>
                        </Box>

                        <Box width="100%">
                          <TextField
                            label={`Message ${index + 1}`}
                            labelHidden
                            value={message}
                            onChange={(next) => updateMessage(index, next)}
                            autoComplete="off"
                            maxLength={TAB_MESSAGE_LENGTH}
                            showCharacterCount
                            placeholder="Come back — your cart is waiting"
                          />
                        </Box>

                        <Button onClick={() => setEmojiTarget(index)} accessibilityLabel={`Add emoji to message ${index + 1}`}>
                          Emoji
                        </Button>

                        <Button
                          variant="tertiary"
                          tone="critical"
                          icon={DeleteIcon}
                          // Never removable down to zero: the module needs something to run.
                          disabled={tabAnimation.messages.length === 1}
                          accessibilityLabel={`Remove message ${index + 1}`}
                          onClick={() =>
                            setTabAnimation({
                              messages: tabAnimation.messages.filter(
                                (_, position) => position !== index,
                              ),
                            })
                          }
                        />
                      </InlineStack>
                    ))}

                    <InlineStack>
                      <Button
                        disabled={tabAnimation.messages.length >= TAB_MESSAGE_LIMIT}
                        onClick={() =>
                          setTabAnimation({ messages: [...tabAnimation.messages, ''] })
                        }
                      >
                        Add message
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Rules that stay on
                  </Text>

                  <Divider />

                  <List>
                    <List.Item>
                      It only runs while the tab is in the background. A shopper looking at your store
                      never sees the title move.
                    </List.Item>
                    <List.Item>
                      The original title and favicon are captured before the first change and restored
                      exactly, so coming back leaves no trace.
                    </List.Item>
                    <List.Item>
                      A shopper with reduce-motion on sees the first message once, static, instead of a
                      cycle.
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          )}
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <StickyPreview>
            <Card>
              <BlockStack gap="300">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Preview
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    This runs only while you are on this screen — an admin tab left open in the
                    background should not be spending frames on a preview.
                  </Text>
                </BlockStack>

                <BrowserTabPreview settings={tabAnimation} />
              </BlockStack>
            </Card>
          </StickyPreview>
        </Layout.Section>
      </Layout>

      <EmojiPickerModal
        open={emojiTarget !== null}
        title={emojiTarget === 'FAVICON' ? 'Pick a favicon emoji' : 'Add an emoji to the message'}
        onClose={() => setEmojiTarget(null)}
        onPick={(emoji) => {
          if (emojiTarget === 'FAVICON') {
            setTabAnimation({ emoji });
            return;
          }
          if (typeof emojiTarget === 'number') {
            const current = tabAnimation.messages[emojiTarget] ?? '';
            updateMessage(emojiTarget, `${current}${emoji}`);
          }
        }}
      />
    </Page>
  );
}
