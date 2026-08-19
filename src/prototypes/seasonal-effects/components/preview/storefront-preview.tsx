import { BlockStack, Box, Card, InlineStack, Text } from '@shopify/polaris';
import { useMemo, useRef, useState } from 'react';

import type { Campaign } from '../../../../mocks/seasonal-effects/campaigns';
import type { ScrollToTopSettings, StoreSettings } from '../../../../mocks/seasonal-effects/modules';
import { paletteById } from '../../../../mocks/seasonal-effects/palettes';
import { optionsFrom } from '../options';
import { Segmented } from '../segmented';
import { Countdown } from './countdown';
import { DecorationLayer } from './decorations';
import { EffectsCanvas } from './effects-canvas';
import { ScrollButton } from './scroll-button';

/**
 * A fake storefront, so the merchant can see the result instead of imagining it.
 *
 * Built for Shopify asks visual editors for a two-column layout with a live preview,
 * and this is the right-hand column. Deliberately *not* styled with admin tokens:
 * it is standing in for the merchant's theme, so borrowing admin colours here would
 * make the preview lie about what shoppers see.
 *
 * It stays mounted while the merchant switches editor tabs — the campaign is one
 * thing, and re-mounting the canvas on every tab change would restart the snow.
 */

type PreviewPage = 'HOME' | 'CART' | 'THANKS';

const PAGE_LABEL: Record<PreviewPage, string> = {
  HOME: 'Home',
  CART: 'Cart',
  THANKS: 'Thank you',
};

const DEVICE_LABEL = { DESKTOP: 'Desktop', MOBILE: 'Mobile' } as const;

const DEMO_PRODUCTS = [
  { name: 'Pine Forest Candle', price: '$28', was: '$40', glyph: '🕯' },
  { name: 'Terracotta Mug', price: '$22', was: '$32', glyph: '☕' },
  { name: 'Wool Throw', price: '$68', was: '$95', glyph: '🧶' },
  { name: 'Copper Kettle', price: '$54', was: '$72', glyph: '🫖' },
];

interface StorefrontPreviewProps {
  campaign: Campaign;
  scrollToTop: ScrollToTopSettings;
  settings: StoreSettings;
  /** Off means the storefront shows none of this, whatever the campaign says. */
  embedEnabled: boolean;
}

export function StorefrontPreview({
  campaign,
  scrollToTop,
  settings,
  embedEnabled,
}: StorefrontPreviewProps) {
  const [device, setDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [page, setPage] = useState<PreviewPage>('HOME');
  const [burst, setBurst] = useState<{ x: number; y: number; seq: number } | null>(null);
  const seq = useRef(0);

  const { falling, decorations, cursor, bar, skin, moments, music } = campaign.elements;

  const skinHex = skin.enabled ? paletteById(skin.paletteId).hex : null;
  const accent = skinHex ?? settings.brandColours.primary;

  const fire = (x: number, y: number) => {
    seq.current += 1;
    setBurst({ x, y, seq: seq.current });
  };

  const countdownEnd = useMemo(() => {
    if (!bar.countdownEnabled) return null;
    return bar.followCampaignSchedule ? campaign.schedule.end : bar.countdownEnd;
  }, [bar.countdownEnabled, bar.followCampaignSchedule, bar.countdownEnd, campaign.schedule.end]);

  // Cursor trails never run on a touch device, so the mobile preview must not show one.
  const cursorActive = cursor.enabled && device === 'DESKTOP' && embedEnabled;
  const fallingActive = falling.enabled && embedEnabled;

  return (
    <Card padding="0">
      <Box padding="300" borderBlockEndWidth="025" borderColor="border">
        <InlineStack align="space-between" blockAlign="center" gap="300" wrap>
          <Segmented
            label="Device"
            options={optionsFrom(DEVICE_LABEL, ['DESKTOP', 'MOBILE'])}
            value={device}
            onChange={setDevice}
          />
          <Segmented<PreviewPage>
            label="Page"
            options={optionsFrom(PAGE_LABEL, ['HOME', 'CART', 'THANKS'])}
            value={page}
            onChange={setPage}
          />
        </InlineStack>
      </Box>

      <Box padding="300" background="bg-surface-secondary">
        <div
          style={{
            margin: '0 auto',
            width: device === 'MOBILE' ? '320px' : '100%',
            maxWidth: '100%',
            transition: 'width .2s',
          }}
        >
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '10px',
              border: '1px solid #d9d9d9',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,.08)',
              height: '460px',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: '#1f1f1f',
            }}
          >
            {/* Browser chrome, so it reads as a storefront rather than a widget. */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                background: '#f1f1f1',
                borderBottom: '1px solid #e0e0e0',
                fontSize: '8.5px',
                color: '#6b6b6b',
              }}
            >
              <span style={{ display: 'flex', gap: '3px' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((colour) => (
                  <i
                    key={colour}
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: colour,
                      display: 'block',
                    }}
                  />
                ))}
              </span>
              <span
                style={{
                  background: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  flex: 1,
                }}
              >
                northwindsupply.com
              </span>
            </div>

            {!embedEnabled ? (
              <div
                style={{
                  background: '#fff4e4',
                  borderBottom: '1px solid #f0d9b5',
                  color: '#8a5a00',
                  fontSize: '9px',
                  padding: '5px 8px',
                  textAlign: 'center',
                }}
              >
                App embed is off — a real shopper would see none of this
              </div>
            ) : null}

            {/* The bar reserves its own space rather than pushing content later,
                which is how it avoids adding layout shift. */}
            {bar.enabled && embedEnabled ? (
              <div
                style={{
                  background: accent,
                  color: '#ffffff',
                  fontSize: '9.5px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  minHeight: '26px',
                }}
              >
                <span>{bar.message.trim() || 'Your message here'}</span>
                {bar.countdownEnabled ? (
                  <Countdown style={bar.style} endsAt={countdownEnd} colour="#ffffff" />
                ) : null}
              </div>
            ) : null}

            {decorations.enabled && embedEnabled ? (
              <DecorationLayer style={decorations.style} />
            ) : null}

            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              {page === 'HOME' ? (
                <HomePage accent={accent} skinOn={skin.enabled && embedEnabled} />
              ) : page === 'CART' ? (
                <CartPage
                  accent={accent}
                  skinOn={skin.enabled && embedEnabled}
                  onFreeShipping={(x, y) => {
                    if (moments.enabled && moments.freeShipping && embedEnabled) fire(x, y);
                  }}
                />
              ) : (
                <ThanksPage
                  accent={accent}
                  onReplay={(x, y) => {
                    if (moments.enabled && moments.orderConfirmed && embedEnabled) fire(x, y);
                  }}
                />
              )}

              {music.enabled && embedEnabled ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '10px',
                    bottom: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(0,0,0,.72)',
                    color: '#ffffff',
                    borderRadius: '999px',
                    padding: '4px 9px',
                    fontSize: '8.5px',
                    zIndex: 3,
                  }}
                >
                  <span aria-hidden="true">🔊</span>
                  {music.waitForClick ? 'Tap to play music' : 'Background music'}
                </div>
              ) : null}

              {scrollToTop.enabled && embedEnabled ? (
                <ScrollButton settings={scrollToTop} skinHex={skinHex} />
              ) : null}

              <EffectsCanvas
                artwork={falling.artwork}
                density={falling.density}
                colour={falling.colour}
                brandHex={accent}
                fallingEnabled={fallingActive}
                cursorEnabled={cursorActive}
                cursorLength={cursor.length}
                burstAt={burst}
              />
            </div>
          </div>
        </div>
      </Box>

      <Box padding="300" borderBlockStartWidth="025" borderColor="border">
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">
            {device === 'MOBILE'
              ? 'On a phone the cursor trail is never loaded at all, and speed guard cuts the particle count.'
              : 'Move the pointer inside the frame to see the cursor trail. Nothing here can intercept a click.'}
          </Text>
          {page === 'CART' ? (
            <Text as="p" variant="bodySm" tone="subdued">
              Cross the free-shipping threshold to fire that moment once — adding another item does
              not fire it again.
            </Text>
          ) : null}
        </BlockStack>
      </Box>
    </Card>
  );
}

function HomePage({ accent, skinOn }: { accent: string; skinOn: boolean }) {
  return (
    <div style={{ padding: '12px', height: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '9px',
          paddingBottom: '10px',
          borderBottom: '1px solid #eeeeee',
        }}
      >
        <b style={{ fontSize: '11px' }}>Northwind Supply</b>
        <span style={{ color: '#6b6b6b' }}>Shop · Gifts · About</span>
      </div>

      <div style={{ padding: '12px 0 10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700 }}>Made for the cold months</div>
        <div style={{ fontSize: '9px', color: '#6b6b6b', marginTop: '3px' }}>
          Free shipping over $60
        </div>
      </div>

      <div style={{ fontSize: '9.5px', fontWeight: 600, marginBottom: '6px' }}>
        Holiday bestsellers
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
        {DEMO_PRODUCTS.map((product) => (
          <div key={product.name}>
            <div
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                background: '#f6f4f1',
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center',
                fontSize: '20px',
              }}
            >
              <span aria-hidden="true">{product.glyph}</span>
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: skinOn ? accent : '#c0392b',
                  color: '#ffffff',
                  borderRadius: '3px',
                  fontSize: '6.5px',
                  padding: '1px 4px',
                }}
              >
                SALE
              </span>
            </div>
            <div style={{ fontSize: '7.5px', marginTop: '4px', lineHeight: 1.3 }}>{product.name}</div>
            <div style={{ fontSize: '7.5px', display: 'flex', gap: '4px', marginTop: '1px' }}>
              <b>{product.price}</b>
              <s style={{ color: skinOn ? accent : '#9b9b9b' }}>{product.was}</s>
            </div>
            <button
              type="button"
              style={{
                marginTop: '5px',
                width: '100%',
                border: 'none',
                borderRadius: '4px',
                background: skinOn ? accent : '#1f1f1f',
                color: '#ffffff',
                fontSize: '7px',
                padding: '4px 0',
                cursor: 'pointer',
              }}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CartPage({
  accent,
  skinOn,
  onFreeShipping,
}: {
  accent: string;
  skinOn: boolean;
  onFreeShipping: (x: number, y: number) => void;
}) {
  const [crossed, setCrossed] = useState(false);

  return (
    <div style={{ padding: '14px', height: '100%' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '10px' }}>Your cart</div>

      {DEMO_PRODUCTS.slice(0, 2).map((product) => (
        <div
          key={product.name}
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            padding: '7px 0',
            borderBottom: '1px solid #eeeeee',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '5px',
              background: '#f6f4f1',
              display: 'grid',
              placeItems: 'center',
              fontSize: '14px',
            }}
            aria-hidden="true"
          >
            {product.glyph}
          </div>
          <div style={{ flex: 1, fontSize: '8.5px' }}>{product.name}</div>
          <b style={{ fontSize: '8.5px' }}>{product.price}</b>
        </div>
      ))}

      <div style={{ marginTop: '12px', fontSize: '8.5px' }}>
        {crossed ? (
          <b>Free shipping unlocked</b>
        ) : (
          <>
            Add <b>$10</b> more for free shipping
          </>
        )}
      </div>

      <div
        style={{
          height: '5px',
          borderRadius: '999px',
          background: '#eeeeee',
          marginTop: '5px',
          overflow: 'hidden',
        }}
      >
        <i
          style={{
            display: 'block',
            height: '100%',
            width: crossed ? '100%' : '83%',
            background: skinOn ? accent : '#1f1f1f',
            transition: 'width .5s',
          }}
        />
      </div>

      <button
        type="button"
        onClick={(event) => {
          if (crossed) return;
          setCrossed(true);
          const rect = event.currentTarget.getBoundingClientRect();
          const parent = event.currentTarget.offsetParent?.getBoundingClientRect();
          onFreeShipping(
            rect.left - (parent?.left ?? 0) + rect.width / 2,
            rect.top - (parent?.top ?? 0),
          );
        }}
        style={{
          marginTop: '12px',
          width: '100%',
          border: 'none',
          borderRadius: '5px',
          background: skinOn ? accent : '#1f1f1f',
          color: '#ffffff',
          fontSize: '8.5px',
          padding: '7px 0',
          cursor: crossed ? 'default' : 'pointer',
          opacity: crossed ? 0.6 : 1,
        }}
      >
        {crossed ? 'Threshold crossed' : 'Simulate crossing $60'}
      </button>
    </div>
  );
}

function ThanksPage({
  accent,
  onReplay,
}: {
  accent: string;
  onReplay: (x: number, y: number) => void;
}) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '26px' }} aria-hidden="true">
        ✅
      </div>
      <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px' }}>Thank you, Mai!</div>
      <div style={{ fontSize: '8.5px', color: '#6b6b6b', marginTop: '4px' }}>
        Order #1043 is confirmed. Effects stop after three seconds on this page.
      </div>
      <button
        type="button"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const parent = event.currentTarget.offsetParent?.getBoundingClientRect();
          onReplay(
            rect.left - (parent?.left ?? 0) + rect.width / 2,
            rect.top - (parent?.top ?? 0) - 40,
          );
        }}
        style={{
          marginTop: '14px',
          border: `1px solid ${accent}`,
          background: 'transparent',
          color: accent,
          borderRadius: '5px',
          fontSize: '8.5px',
          padding: '5px 12px',
          cursor: 'pointer',
        }}
      >
        Replay confetti
      </button>
    </div>
  );
}
