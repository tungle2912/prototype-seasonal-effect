/**
 * Switching preset.
 *
 * A preset is a set of starting values, so it may overwrite anything the app
 * chose — artwork, palette, which effects are on — but it must never erase
 * something the merchant typed themselves. That is the whole rule (PRD 5.2), and
 * the reason it needs code rather than a spread: the app has to tell "the default
 * Christmas name" apart from "a name the merchant wrote".
 */

import {
  elementsFromPreset,
  type Campaign,
  type CampaignElements,
} from '../../../mocks/seasonal-effects/campaigns';
import {
  presetBarMessages,
  presetByKey,
  presetCampaignNames,
  type PresetKey,
} from '../../../mocks/seasonal-effects/presets';

/** Did the merchant write this name, or is it still a preset's default? */
export const isMerchantWrittenName = (name: string): boolean =>
  name.trim().length > 0 && !presetCampaignNames.includes(name.trim());

export const isMerchantWrittenMessage = (message: string): boolean =>
  message.trim().length > 0 && !presetBarMessages.includes(message.trim());

export function applyPreset(campaign: Campaign, key: PresetKey): Campaign {
  const preset = presetByKey(key);
  const fresh = elementsFromPreset(key);

  const keepName = isMerchantWrittenName(campaign.name);
  const keepMessage = isMerchantWrittenMessage(campaign.elements.bar.message);
  const keepDates = campaign.schedule.start !== null && campaign.schedule.end !== null;

  const elements: CampaignElements = {
    ...fresh,
    // The merchant's own words survive; everything visual comes from the preset.
    bar: {
      ...fresh.bar,
      message: keepMessage ? campaign.elements.bar.message : fresh.bar.message,
      followUpMessage: campaign.elements.bar.followUpMessage,
      followCampaignSchedule: campaign.elements.bar.followCampaignSchedule,
      countdownStart: keepDates
        ? campaign.elements.bar.countdownStart
        : (preset.dates?.[0] ?? null),
      countdownEnd: keepDates ? campaign.elements.bar.countdownEnd : (preset.dates?.[1] ?? null),
    },
    // Density and particle colour are merchant choices, not preset ones.
    falling: {
      ...fresh.falling,
      colour: campaign.elements.falling.colour,
      density: campaign.elements.falling.density,
    },
    cursor: {
      ...fresh.cursor,
      particles: campaign.elements.cursor.particles,
      length: campaign.elements.cursor.length,
    },
    music: {
      ...fresh.music,
      track: campaign.elements.music.track,
      volume: campaign.elements.music.volume,
      waitForClick: campaign.elements.music.waitForClick,
    },
  };

  return {
    ...campaign,
    preset: key,
    name: keepName ? campaign.name : preset.campaignName,
    schedule: {
      ...campaign.schedule,
      start: keepDates ? campaign.schedule.start : (preset.dates?.[0] ?? null),
      end: keepDates ? campaign.schedule.end : (preset.dates?.[1] ?? null),
    },
    // Audience, pages, frequency and device are never touched by a preset.
    targeting: campaign.targeting,
    trigger: campaign.trigger,
    elements,
  };
}

/** The one-line warning the Template card shows, so the overwrite is not a surprise. */
export const PRESET_OVERWRITE_NOTE =
  'Switching template replaces the artwork, colours and which effects are on. Your campaign name, dates and any message you wrote are kept.';
