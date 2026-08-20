import {
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  InlineGrid,
  InlineStack,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import { useState } from 'react';

import type { Campaign } from '../../../../mocks/seasonal-effects/campaigns';
import {
  countdownStyles,
  decorationStyles,
  DENSITY_MAX,
  DENSITY_MIN,
  DENSITY_STEP,
  densityLabel,
  fallingArtwork,
  musicTracks,
  particleColourLabel,
  trailLabel,
  volumeBandLabel,
  VOLUME_MAX,
  VOLUME_MIN,
  VOLUME_STEP,
  zeroBehaviourOptions,
  type CountdownStyle,
  type DecorationStyle,
  type FallingArtwork,
  type ParticleColour,
  type TrailLength,
} from '../../../../mocks/seasonal-effects/effects';
import { paletteById, seasonalPalettes } from '../../../../mocks/seasonal-effects/palettes';
import { presets, type PresetKey } from '../../../../mocks/seasonal-effects/presets';
import { DateTimeField } from '../../components/date-time-field';
import { EffectSection } from '../../components/effect-section';
import { EmojiPickerModal } from '../../components/emoji-picker-modal';
import { optionsFrom } from '../../components/options';
import {
  ArtworkTile,
  CountdownTile,
  DecorationTile,
  PaletteTile,
  PresetTile,
} from '../../components/preview/tile-previews';
import { Segmented } from '../../components/segmented';
import { SliderField } from '../../components/slider-field';
import { TileGrid } from '../../components/tile-grid';
import { useApp } from '../../state/app-state';
import { applyPreset, PRESET_OVERWRITE_NOTE } from '../../state/preset';
import {
  barSummary,
  cursorSummary,
  decorationsSummary,
  fallingSummary,
  musicSummary,
  skinSummary,
} from '../../state/summaries';
import { issueFor, type Issue } from '../../state/validation';

/**
 * Elements: the template and the seven effects.
 *
 * Grouped by what each one does to a shopper, ordered from what they feel first to
 * what reaches them last: atmosphere, then the one thing they read, then the look,
 * then sound. Template sits at the top of this tab rather than in a tab of its own,
 * because picking an occasion and seeing what it does is one job.
 *
 * The one-off bursts (add to cart, free shipping, order confirmed) are not here.
 * They are answers to "when does this fire", which is the trigger's question, so
 * they sit beside it in Schedule & trigger instead of being asked twice.
 */

type SectionKey = 'falling' | 'decorations' | 'cursor' | 'bar' | 'skin' | 'music';

interface ElementsTabProps {
  campaign: Campaign;
  onChange: (next: Campaign) => void;
  issues: Issue[];
}

export function ElementsTab({ campaign, onChange, issues }: ElementsTabProps) {
  const { goTo, showToast } = useApp();
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    falling: true,
    decorations: false,
    cursor: false,
    bar: false,
    skin: false,
    music: false,
  });

  const toggleOpen = (key: SectionKey, next: boolean) =>
    setOpen((current) => ({ ...current, [key]: next }));

  const patch = <K extends keyof Campaign['elements']>(
    key: K,
    value: Partial<Campaign['elements'][K]>,
  ) =>
    onChange({
      ...campaign,
      elements: { ...campaign.elements, [key]: { ...campaign.elements[key], ...value } },
    });

  const { falling, decorations, cursor, bar, skin, music } = campaign.elements;

  return (
    <BlockStack gap="400">
      {/* --- Template ------------------------------------------------------ */}
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              Template
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {PRESET_OVERWRITE_NOTE}
            </Text>
          </BlockStack>

          {/* The grid stays open. A Change/Done button would put one extra click
              in front of the thing merchants do first.
              Four across and eight to a page: three columns on a page this wide
              drew a tile the size of a banner and ran four rows deep, which is
              both ugly and the exact thing the two-row rule exists to stop. */}
          <TileGrid
            label="Occasion"
            labelHidden
            size="large"
            columns={4}
            perPage={8}
            options={presets.map((preset) => ({
              value: preset.key,
              label: preset.label,
              detail: presetDates(preset),
              preview: <PresetTile preset={preset} hex={paletteById(preset.paletteId).hex} />,
            }))}
            value={campaign.preset}
            onChange={(next) => onChange(applyPreset(campaign, next as PresetKey))}
          />
        </BlockStack>
      </Card>

      {/* --- Atmosphere --------------------------------------------------- */}
      <GroupCard
        title="Atmosphere"
        description="Ambient decoration, running the whole time a shopper is on the page."
      >
        <EffectSection
          id="section-falling"
          title="Falling effect"
          summary={fallingSummary(campaign)}
          enabled={falling.enabled}
          onToggle={(next) => patch('falling', { enabled: next })}
          open={open.falling}
          onOpenChange={(next) => toggleOpen('falling', next)}
        >
          <BlockStack gap="400">
            <TileGrid
              label="Artwork"
              options={fallingArtwork.map((option) => ({
                value: option.value,
                label: option.label,
                preview: <ArtworkTile artwork={option.value} />,
              }))}
              value={falling.artwork}
              perPage={8}
              onChange={(next) => patch('falling', { artwork: next as FallingArtwork })}
              onUpload={() =>
                showToast(
                  'Custom artwork comes with the paid plan. The same size limits apply, so a heavy image can never slow the storefront down.',
                )
              }
            />

            <Segmented<ParticleColour>
              label="Colour"
              options={optionsFrom(particleColourLabel, ['STOCK', 'BRAND'])}
              value={falling.colour}
              onChange={(next) => patch('falling', { colour: next })}
            />

            {/* A percentage, not three named steps: density is a scale, and
                dragging it while the snow is on screen beside you is the whole
                reason the preview is there. The reading carries the word too, so
                45% does not have to be interpreted on its own.
                On its own row rather than half of a two-column grid: a slider is
                a track two pixels tall next to a control four times its height,
                and pairing them left the row looking broken. Width is also what a
                slider is for — the longer the track, the finer the drag. */}
            <SliderField
              label="Density"
              value={falling.density}
              min={DENSITY_MIN}
              max={DENSITY_MAX}
              step={DENSITY_STEP}
              valueLabel={densityLabel(falling.density)}
              onChange={(density) => patch('falling', { density })}
            />

            <Text as="p" variant="bodySm" tone="subdued">
              The effect layer never blocks a click, and the real particle count drops on a slow
              device — speed guard decides that, not this setting.
            </Text>
          </BlockStack>
        </EffectSection>

        <Divider />

        <EffectSection
          id="section-decorations"
          title="Decorations"
          summary={decorationsSummary(campaign)}
          enabled={decorations.enabled}
          onToggle={(next) => patch('decorations', { enabled: next })}
          open={open.decorations}
          onOpenChange={(next) => toggleOpen('decorations', next)}
        >
          <BlockStack gap="300">
            <TileGrid
              label="Style"
              options={decorationStyles.map((option) => ({
                value: option.value,
                label: `${option.label} — ${option.placement.toLowerCase()}`,
                preview: <DecorationTile style={option.value} />,
              }))}
              value={decorations.style}
              perPage={4}
              onChange={(next) => patch('decorations', { style: next as DecorationStyle })}
            />

            <Text as="p" variant="bodySm" tone="subdued">
              Blinking lights hold still for a shopper who has reduce-motion on, and decorations
              move below the announcement bar rather than covering it.
            </Text>
          </BlockStack>
        </EffectSection>

        <Divider />

        <EffectSection
          id="section-cursor"
          title="Cursor effect"
          summary={cursorSummary(campaign)}
          enabled={cursor.enabled}
          onToggle={(next) => patch('cursor', { enabled: next })}
          open={open.cursor}
          onOpenChange={(next) => toggleOpen('cursor', next)}
        >
          <BlockStack gap="400">
            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
              <Segmented
                label="Particles"
                options={[
                  { value: 'MATCH_FALLING', label: 'Same as falling' },
                  { value: 'SPARKLE', label: 'Sparkle' },
                ]}
                value={cursor.particles}
                onChange={(next) => patch('cursor', { particles: next as typeof cursor.particles })}
                fullWidth
              />
              <Segmented<TrailLength>
                label="Trail length"
                options={optionsFrom(trailLabel, ['SHORT', 'MEDIUM', 'LONG'])}
                value={cursor.length}
                onChange={(next) => patch('cursor', { length: next })}
                fullWidth
              />
            </InlineGrid>

            <Banner tone="info">
              <p>
                Desktop only — the script is not even downloaded on a touch device. The system
                cursor comes back over any input, link or button, and the trail stops when nothing
                moves.
              </p>
            </Banner>
          </BlockStack>
        </EffectSection>
      </GroupCard>

      {/* --- Message & urgency -------------------------------------------- */}
      <GroupCard
        title="Message & urgency"
        description="The one element shoppers read rather than feel."
      >
        <EffectSection
          id="section-bar"
          title="Announcement bar"
          summary={barSummary(campaign)}
          enabled={bar.enabled}
          onToggle={(next) => patch('bar', { enabled: next })}
          open={open.bar}
          onOpenChange={(next) => toggleOpen('bar', next)}
        >
          <BarSettings campaign={campaign} onChange={onChange} issues={issues} />
        </EffectSection>
      </GroupCard>

      {/* --- Storefront look ---------------------------------------------- */}
      <GroupCard
        title="Storefront look"
        description="Recolours five components you already have. Never touches your theme files."
      >
        <EffectSection
          id="section-skin"
          title="Seasonal skin"
          summary={skinSummary(campaign)}
          enabled={skin.enabled}
          onToggle={(next) => patch('skin', { enabled: next })}
          open={open.skin}
          onOpenChange={(next) => toggleOpen('skin', next)}
        >
          <BlockStack gap="300">
            <TileGrid
              label="Palette"
              options={seasonalPalettes.map((palette) => ({
                value: palette.id,
                label: palette.label,
                preview: <PaletteTile palette={palette} />,
              }))}
              value={skin.paletteId}
              perPage={8}
              onChange={(next) => patch('skin', { paletteId: next })}
            />

            <Text as="p" variant="bodySm" tone="subdued">
              Primary buttons, the sale badge, the compare-at price, the announcement bar background
              and the free-shipping bar. No fonts, no layout, nothing on checkout — and switching it
              off puts everything back at once.
            </Text>
          </BlockStack>
        </EffectSection>
      </GroupCard>

      {/* --- Sound -------------------------------------------------------- */}
      <GroupCard
        title="Sound"
        description="Off by default, on purpose — sound that starts on its own costs more conversions than it wins."
      >
        <EffectSection
          id="section-music"
          title="Background music"
          summary={musicSummary(campaign)}
          enabled={music.enabled}
          onToggle={(next) => patch('music', { enabled: next })}
          open={open.music}
          onOpenChange={(next) => toggleOpen('music', next)}
        >
          <BlockStack gap="400">
            <Box maxWidth="20rem">
              <Select
                label="Track"
                options={musicTracks.map((track) => ({ label: track.label, value: track.value }))}
                value={music.track}
                onChange={(next) => patch('music', { track: next as typeof music.track })}
              />
            </Box>

            <SliderField
              label="Volume"
              value={music.volume}
              min={VOLUME_MIN}
              max={VOLUME_MAX}
              step={VOLUME_STEP}
              valueLabel={music.volume === 0 ? 'Muted' : `${music.volume}%`}
              helpText={`${volumeBandLabel(music.volume)} — a shopper can still mute it from the storefront.`}
              onChange={(volume) => patch('music', { volume })}
            />

            <Checkbox
              label="Wait for a click before playing"
              helpText="Leave this on. Audio that starts by itself is blocked by browsers and resented by shoppers."
              checked={music.waitForClick}
              onChange={(next) => patch('music', { waitForClick: next })}
            />

            <InlineStack>
              <Button onClick={() => showToast('A sample of this track would play here.')}>
                Play sample
              </Button>
            </InlineStack>
          </BlockStack>
        </EffectSection>
      </GroupCard>

      {/* --- Pointer to the always-on modules ----------------------------- */}
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Looking for tab animation or the scroll-to-top button?
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            They are not part of a campaign, because they should not disappear when Christmas ends.
            Each one has its own screen and runs all year.
          </Text>
          <InlineStack gap="200">
            <Button onClick={() => goTo('TAB_ANIMATION')}>Tab animation</Button>
            <Button onClick={() => goTo('SCROLL_TO_TOP')}>Scroll to top</Button>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

/** The default run a preset fills in — the thing a merchant checks before picking. */
function presetDates(preset: (typeof presets)[number]): string {
  if (!preset.dates) return 'Blank campaign';
  const [start, end] = preset.dates;
  const label = (value: string) =>
    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return start.slice(0, 10) === end.slice(0, 10) ? label(start) : `${label(start)} – ${label(end)}`;
}

function GroupCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">
            {title}
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            {description}
          </Text>
        </BlockStack>

        <Divider />

        <BlockStack gap="300">{children}</BlockStack>
      </BlockStack>
    </Card>
  );
}

/** The bar and its countdown, which has a window of its own (PRD 6.4). */
function BarSettings({
  campaign,
  onChange,
  issues,
}: {
  campaign: Campaign;
  onChange: (next: Campaign) => void;
  issues: Issue[];
}) {
  const bar = campaign.elements.bar;
  const [emojiOpen, setEmojiOpen] = useState(false);
  const countdownIssue = issueFor(issues, 'countdown');
  const visibilityOff = !campaign.schedule.visibilityEnabled;

  const patchBar = (value: Partial<Campaign['elements']['bar']>) =>
    onChange({
      ...campaign,
      elements: { ...campaign.elements, bar: { ...bar, ...value } },
    });

  return (
    <BlockStack gap="400">
      <BlockStack gap="150">
        <TextField
          label="Message"
          value={bar.message}
          onChange={(next) => patchBar({ message: next })}
          autoComplete="off"
          maxLength={90}
          showCharacterCount
          placeholder="Christmas sale up to 40% off — free shipping over $60"
        />
        <InlineStack>
          <Button variant="tertiary" onClick={() => setEmojiOpen(true)}>
            Add emoji
          </Button>
        </InlineStack>
      </BlockStack>

      <Divider />

      <Checkbox
        label="Show a countdown"
        helpText="A countdown has its own start and end, so a month-long campaign can still count down the last three days."
        checked={bar.countdownEnabled}
        onChange={(next) => patchBar({ countdownEnabled: next })}
      />

      {bar.countdownEnabled ? (
        <BlockStack gap="400">
          <Checkbox
            label="Follow the campaign schedule instead"
            helpText={
              visibilityOff
                ? 'Unavailable while visibility time is off — there is no window to follow.'
                : 'The countdown tracks the campaign dates and changes with them.'
            }
            checked={bar.followCampaignSchedule && !visibilityOff}
            disabled={visibilityOff}
            onChange={(next) => patchBar({ followCampaignSchedule: next })}
          />

          <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
            <div>
              <DateTimeField
                label="Countdown starts"
                value={
                  bar.followCampaignSchedule && !visibilityOff
                    ? campaign.schedule.start
                    : bar.countdownStart
                }
                disabled={bar.followCampaignSchedule && !visibilityOff}
                onChange={(next) => patchBar({ countdownStart: next })}
              />
            </div>
            <div>
              <DateTimeField
                label="Countdown ends"
                value={
                  bar.followCampaignSchedule && !visibilityOff
                    ? campaign.schedule.end
                    : bar.countdownEnd
                }
                disabled={bar.followCampaignSchedule && !visibilityOff}
                onChange={(next) => patchBar({ countdownEnd: next })}
                error={countdownIssue?.message}
              />
            </div>
          </InlineGrid>

          {/* Compact and captionless: a countdown is a strip of digits, and the
              caption underneath was squeezing the one thing being chosen. Two
              across, so the digits are drawn at the size they will really be. */}
          <TileGrid
            label="Countdown style"
            options={countdownStyles.map((style) => ({
              value: style.value,
              label: style.label,
              preview: <CountdownTile style={style.value} />,
            }))}
            value={bar.style}
            columns={2}
            perPage={4}
            size="compact"
            captionHidden
            onChange={(next) => patchBar({ style: next as CountdownStyle })}
          />

          <Box maxWidth="24rem">
            <Select
              label="When it hits zero"
              options={zeroBehaviourOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={bar.zeroBehaviour}
              onChange={(next) => patchBar({ zeroBehaviour: next as typeof bar.zeroBehaviour })}
            />
          </Box>

          {bar.zeroBehaviour === 'FOLLOW_UP_MESSAGE' ? (
            <TextField
              label="Follow-up message"
              value={bar.followUpMessage}
              onChange={(next) => patchBar({ followUpMessage: next })}
              autoComplete="off"
              maxLength={90}
              showCharacterCount
            />
          ) : null}

          <Text as="p" variant="bodySm" tone="subdued">
            The countdown never resets per session. A fake deadline is misleading advertising, and
            it is treated as such in the EU and the UK.
          </Text>
        </BlockStack>
      ) : null}

      <EmojiPickerModal
        open={emojiOpen}
        title="Add an emoji to the message"
        onClose={() => setEmojiOpen(false)}
        onPick={(emoji) => patchBar({ message: `${bar.message}${emoji}` })}
      />
    </BlockStack>
  );
}
