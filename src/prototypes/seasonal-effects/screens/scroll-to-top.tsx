import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Card,
  Checkbox,
  Divider,
  InlineGrid,
  Layout,
  Page,
  Select,
  SkeletonBodyText,
  Text,
  TextField,
} from '@shopify/polaris';
import { useMemo } from 'react';

import {
  contentLabel,
  easingLabel,
  entranceLabel,
  positionLabel,
  SCROLL_TEXT_LENGTH,
  shapeLabel,
  showAfterLabel,
  sizeLabel,
  type BorderStyle,
  type ButtonContent,
  type ButtonPosition,
  type ButtonShape,
  type ButtonSize,
  type ScrollEasing,
  type ShowAfter,
} from '../../../mocks/seasonal-effects/modules';
import { paletteById } from '../../../mocks/seasonal-effects/palettes';
import { scrollIcons } from '../../../mocks/seasonal-effects/scroll-icons';
import { ArrowUpIcon, TextIcon, ImageWithTextOverlayIcon } from '@shopify/polaris-icons';

import { CardToggle } from '../components/card-toggle';
import { ColorField } from '../components/color-field';
import { optionsFrom } from '../components/options';
import { ScrollIconTile } from '../components/preview/tile-previews';
import { ScrollPreview } from '../components/preview/scroll-preview';
import { Segmented } from '../components/segmented';
import { SliderField } from '../components/slider-field';
import { ChoiceCards } from '../components/choice-cards';
import { StickyPreview } from '../components/sticky-preview';
import { ToggleRow } from '../components/toggle-row';
import { useApp } from '../state/app-state';
import { statusOf } from '../state/campaign-status';

/**
 * Scroll to top — the other always-on module.
 *
 * It sits on top of the merchant's own content on every page, all year, which is why
 * every colour has a hover twin and why the preview scrolls for real: a pair like
 * white-on-white only reveals itself when the pointer lands on it, and a threshold
 * only means something once you have scrolled past it.
 */

const DEVICE_LABEL = { ALL: 'All devices', DESKTOP: 'Desktop', MOBILE: 'Mobile' } as const;

const BORDER_STYLE_LABEL: Record<BorderStyle, string> = {
  SOLID: 'Solid',
  DASHED: 'Dashed',
  DOTTED: 'Dotted',
  NONE: 'None',
};

export function ScrollToTopScreen() {
  const { scrollToTop, setScrollToTop, campaigns, loading, error, embed, goTo, showToast } =
    useApp();

  // A live campaign with its skin on takes the button's colours over, and the
  // merchant has to be told, or they will think their colour picker is broken.
  const skinHex = useMemo(() => {
    const live = campaigns.find((campaign) => statusOf(campaign) === 'LIVE');
    if (!live || !live.elements.skin.enabled) return null;
    return paletteById(live.elements.skin.paletteId).hex;
  }, [campaigns]);

  const overridden = Boolean(skinHex) && scrollToTop.matchSeasonalSkin;

  if (error) {
    return (
      <Page title="Scroll to top" backAction={{ content: 'Home', onAction: () => goTo('HOME') }}>
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
      backAction={{ content: 'Home', onAction: () => goTo('HOME') }}
      title="Scroll to top"
      subtitle="A button on every page of your store, all year — it does not expire with a holiday"
      titleMetadata={
        <Badge tone={scrollToTop.enabled ? 'success' : 'attention'}>
          {scrollToTop.enabled ? 'On' : 'Off'}
        </Badge>
      }
    >
      {/* `InlineGrid`, not `Layout`: grid items stretch to the row height, and
          without that the preview rail is only as tall as the preview itself —
          which leaves `position: sticky` nothing to stick to. */}
      <InlineGrid columns={{ xs: 1, lg: ['twoThirds', 'oneThird'] }} gap="400">
        <div>
          {loading ? (
            <Card>
              <SkeletonBodyText lines={10} />
            </Card>
          ) : (
            <BlockStack gap="400">
              <CardToggle
                title="Scroll to top"
                enabled={scrollToTop.enabled}
                description={
                  scrollToTop.enabled
                    ? 'Showing on every page except checkout, once the shopper scrolls past the threshold below.'
                    : 'Off — no button anywhere on your store.'
                }
                onToggle={(next) => setScrollToTop({ enabled: next })}
              />

              {!embed.enabled ? (
                <Banner tone="warning">
                  <p>
                    The app embed is off, so this module is not running on your storefront either.
                  </p>
                </Banner>
              ) : null}

              {overridden ? (
                <Banner tone="info" title="A live campaign is choosing these colours">
                  <p>
                    “Match the seasonal skin” is on and a campaign with a seasonal skin is live, so
                    the button borrows its colour. Your colours below come back the moment the
                    campaign ends — or turn the match off to use them now.
                  </p>
                </Banner>
              ) : null}

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Behaviour
                  </Text>
                  <Divider />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <div>
                      <Select
                        label="Scroll animation"
                        options={optionsFrom(easingLabel, [
                          'LINEAR',
                          'EASE_OUT',
                          'EASE_IN_OUT',
                          'INSTANT',
                        ]).map((option) => ({ label: option.label, value: option.value }))}
                        value={scrollToTop.easing}
                        onChange={(next) => setScrollToTop({ easing: next as ScrollEasing })}
                        helpText="Click the button in the preview to feel the difference."
                      />
                    </div>

                    <div>
                      <Select
                        label="Button animation"
                        options={optionsFrom(entranceLabel, [
                          'NONE',
                          'FADE_IN',
                          'SLIDE_UP',
                          'BOUNCE',
                          'PULSE',
                        ]).map((option) => ({ label: option.label, value: option.value }))}
                        value={scrollToTop.entrance}
                        onChange={(next) =>
                          setScrollToTop({ entrance: next as typeof scrollToTop.entrance })
                        }
                        helpText="Held still for a shopper with reduce-motion on."
                      />
                    </div>
                  </InlineGrid>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Button
                  </Text>
                  <Divider />

                  <ChoiceCards<ButtonContent>
                    label="What the button shows"
                    labelHidden
                    options={[
                      { value: 'ICON', label: contentLabel.ICON, icon: ArrowUpIcon },
                      { value: 'TEXT', label: contentLabel.TEXT, icon: TextIcon },
                      {
                        value: 'ICON_AND_TEXT',
                        label: contentLabel.ICON_AND_TEXT,
                        icon: ImageWithTextOverlayIcon,
                      },
                    ]}
                    value={scrollToTop.content}
                    onChange={(next) => setScrollToTop({ content: next })}
                  />

                  {scrollToTop.content !== 'TEXT' ? (
                    <ScrollIconGrid
                      value={scrollToTop.iconId}
                      onChange={(iconId) => setScrollToTop({ iconId })}
                    />
                  ) : null}

                  {scrollToTop.content !== 'ICON' ? (
                    <Box maxWidth="18rem">
                      <TextField
                        label="Text"
                        value={scrollToTop.text}
                        onChange={(next) => setScrollToTop({ text: next })}
                        autoComplete="off"
                        maxLength={SCROLL_TEXT_LENGTH}
                        showCharacterCount
                        helpText="Ten characters, because a wider button covers more of the page it sits on."
                      />
                    </Box>
                  ) : null}
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Colours
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Every colour has a hover twin. Hover the button in the preview to check the
                      pair is still readable — that is the only way a white-on-white hover shows up.
                    </Text>
                  </BlockStack>
                  <Divider />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <ColorField
                      label="Icon colour"
                      value={scrollToTop.iconColour}
                      onChange={(iconColour) => setScrollToTop({ iconColour })}
                      disabled={overridden}
                    />
                    <ColorField
                      label="Icon colour on hover"
                      value={scrollToTop.iconHoverColour}
                      onChange={(iconHoverColour) => setScrollToTop({ iconHoverColour })}
                      disabled={overridden}
                    />
                  </InlineGrid>

                  <Checkbox
                    label="Transparent background"
                    helpText="The background fields stay visible but stop applying, so you can see what they were."
                    checked={scrollToTop.transparentBackground}
                    disabled={overridden}
                    onChange={(next) => setScrollToTop({ transparentBackground: next })}
                  />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <ColorField
                      label="Background"
                      value={scrollToTop.backgroundColour}
                      onChange={(backgroundColour) => setScrollToTop({ backgroundColour })}
                      disabled={scrollToTop.transparentBackground || overridden}
                    />
                    <ColorField
                      label="Background on hover"
                      value={scrollToTop.backgroundHoverColour}
                      onChange={(backgroundHoverColour) =>
                        setScrollToTop({ backgroundHoverColour })
                      }
                      disabled={scrollToTop.transparentBackground || overridden}
                    />
                  </InlineGrid>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Border
                  </Text>
                  <Divider />

                  <Box maxWidth="20rem">
                    <Select
                      label="Style"
                      options={optionsFrom(BORDER_STYLE_LABEL, [
                        'SOLID',
                        'DASHED',
                        'DOTTED',
                        'NONE',
                      ]).map((option) => ({ label: option.label, value: option.value }))}
                      value={scrollToTop.borderStyle}
                      onChange={(next) => setScrollToTop({ borderStyle: next as BorderStyle })}
                    />
                  </Box>

                  {/* A slider, not a number field: nobody knows what 4px of border
                      looks like until they see it, and dragging shows them. It gets
                      its own row — a track is far shorter than a select, and the two
                      side by side never lined up. */}
                  <SliderField
                    label="Width"
                    value={scrollToTop.borderWidth}
                    min={0}
                    max={10}
                    valueLabel={`${scrollToTop.borderWidth}px`}
                    onChange={(borderWidth) => setScrollToTop({ borderWidth })}
                  />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <ColorField
                      label="Border colour"
                      value={scrollToTop.borderColour}
                      onChange={(borderColour) => setScrollToTop({ borderColour })}
                      disabled={scrollToTop.borderStyle === 'NONE'}
                    />
                    <ColorField
                      label="Border colour on hover"
                      value={scrollToTop.borderHoverColour}
                      onChange={(borderHoverColour) => setScrollToTop({ borderHoverColour })}
                      disabled={scrollToTop.borderStyle === 'NONE'}
                    />
                  </InlineGrid>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Shape & size
                  </Text>
                  <Divider />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <Segmented<ButtonShape>
                      label="Shape"
                      options={optionsFrom(shapeLabel, ['ROUND', 'ROUNDED', 'SQUARE'])}
                      value={scrollToTop.shape}
                      onChange={(next) => setScrollToTop({ shape: next })}
                      fullWidth
                    />
                    <Segmented<ButtonSize>
                      label="Size"
                      options={optionsFrom(sizeLabel, ['SMALL', 'MEDIUM', 'LARGE'])}
                      value={scrollToTop.size}
                      onChange={(next) => setScrollToTop({ size: next })}
                      fullWidth
                    />
                  </InlineGrid>

                  <ToggleRow
                    title="Match the seasonal skin while a campaign is running"
                    summary="On by default, so the button never clashes with the campaign around it."
                    checked={scrollToTop.matchSeasonalSkin}
                    onChange={(next) => setScrollToTop({ matchSeasonalSkin: next })}
                  />
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Placement
                  </Text>
                  <Divider />

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <Segmented<ButtonPosition>
                      label="Position"
                      options={optionsFrom(positionLabel, ['BOTTOM_RIGHT', 'BOTTOM_LEFT'])}
                      value={scrollToTop.position}
                      onChange={(next) => setScrollToTop({ position: next })}
                      fullWidth
                    />
                    <Segmented
                      label="Devices"
                      options={optionsFrom(DEVICE_LABEL, ['ALL', 'DESKTOP', 'MOBILE'])}
                      value={scrollToTop.device}
                      onChange={(next) => setScrollToTop({ device: next })}
                      fullWidth
                    />
                  </InlineGrid>

                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                    <SliderField
                      label="Side offset"
                      value={scrollToTop.offsetX}
                      min={0}
                      max={80}
                      step={2}
                      valueLabel={`${scrollToTop.offsetX}px`}
                      onChange={(offsetX) => setScrollToTop({ offsetX })}
                    />
                    <SliderField
                      label="Bottom offset"
                      value={scrollToTop.offsetY}
                      min={0}
                      max={80}
                      step={2}
                      valueLabel={`${scrollToTop.offsetY}px`}
                      onChange={(offsetY) => setScrollToTop({ offsetY })}
                    />
                  </InlineGrid>

                  <Segmented<ShowAfter>
                    label="Show after"
                    options={optionsFrom(showAfterLabel, [
                      'HALF_SCREEN',
                      'ONE_SCREEN',
                      'TWO_SCREENS',
                    ])}
                    value={scrollToTop.showAfter}
                    onChange={(next) => setScrollToTop({ showAfter: next })}
                    fullWidth
                  />
                </BlockStack>
              </Card>
            </BlockStack>
          )}
        </div>

        <StickyPreview>
          <Card>
            <BlockStack gap="300">
              <BlockStack gap="100">
                <Text as="h2" variant="headingMd">
                  Preview
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Scroll the page below, then hover the button.
                </Text>
              </BlockStack>

              <ScrollPreview settings={scrollToTop} skinHex={skinHex} />
            </BlockStack>
          </Card>
        </StickyPreview>
      </InlineGrid>
    </Page>
  );
}

/** 30 icons in six columns: five full rows, so the grid has no ragged last line. */
function ScrollIconGrid({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <BlockStack gap="200">
      <Text as="span" variant="bodySm" tone="subdued">
        Icon
      </Text>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 'var(--p-space-150)',
        }}
      >
        {scrollIcons.map((icon) => {
          const selected = icon.id === value;
          return (
            <button
              key={icon.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Icon ${icon.id.replace('icon-', '')}`}
              onClick={() => onChange(icon.id)}
              style={{
                // A fixed row height rather than square tiles: 30 squares at column
                // width is half a screen of empty box for a 20px drawing.
                height: '46px',
                padding: 0,
                display: 'grid',
                placeItems: 'center',
                border: `var(--p-border-width-025) solid ${
                  selected ? 'var(--p-color-border-emphasis)' : 'var(--p-color-border)'
                }`,
                borderRadius: 'var(--p-border-radius-200)',
                background: selected
                  ? 'var(--p-color-bg-surface-selected)'
                  : 'var(--p-color-bg-surface)',
                color: 'var(--p-color-text)',
                cursor: 'pointer',
              }}
            >
              <ScrollIconTile icon={icon} />
            </button>
          );
        })}
      </div>
    </BlockStack>
  );
}
