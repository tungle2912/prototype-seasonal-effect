/**
 * Builds the store. Kept out of the provider component so this file exports only
 * hooks — a file that exports both a component and a hook breaks Fast Refresh.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { usePrototypeState, useMockData } from '../../../lib/mock-state';
import {
  campaigns as campaignFixtures,
  newCampaign,
  type Campaign,
} from '../../../mocks/seasonal-effects/campaigns';
import {
  appEmbedDefaults,
  scrollToTopDefaults,
  storeSettingsDefaults,
  tabAnimationDefaults,
  type ScrollToTopSettings,
  type StoreSettings,
  type TabAnimationSettings,
} from '../../../mocks/seasonal-effects/modules';
import { TODAY_ISO } from '../../../mocks/seasonal-effects/today';
import type { AppEmbed, AppStore, Screen } from './app-state';
import { statusOf } from './campaign-status';

/** Stable identity: a fresh `[]` on every render would restart the seed effect. */
const NO_CAMPAIGNS: Campaign[] = [];

/**
 * The open screen lives in the URL, the same way the simulated data state does.
 * A reviewer can then link straight to the screen they want to comment on, which
 * is the whole reason this prototype exists.
 */
const SCREEN_PARAM = 'screen';

const SCREEN_SLUG: Record<Screen, string> = {
  HOME: 'home',
  CAMPAIGNS: 'campaigns',
  EDITOR: 'editor',
  TAB_ANIMATION: 'tab-animation',
  SCROLL_TO_TOP: 'scroll-to-top',
  SETTINGS: 'settings',
};

const SCREEN_FROM_SLUG = Object.fromEntries(
  Object.entries(SCREEN_SLUG).map(([screen, slug]) => [slug, screen as Screen]),
) as Record<string, Screen>;

/** The empty state of the tab-animation module is "no message written yet" (PRD edge case 20). */
const emptyTabAnimation: TabAnimationSettings = { ...tabAnimationDefaults, messages: [''] };

export function useAppStore(): AppStore {
  const dataState = usePrototypeState();
  const { loading, error, data } = useMockData<Campaign[]>(campaignFixtures, NO_CAMPAIGNS);

  const [searchParams, setSearchParams] = useSearchParams();
  const screen = SCREEN_FROM_SLUG[searchParams.get(SCREEN_PARAM) ?? ''] ?? 'HOME';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Campaign | null>(null);

  const [embed, setEmbed] = useState<AppEmbed>({ ...appEmbedDefaults });
  const [campaigns, setCampaigns] = useState<Campaign[]>(data);
  const [tabAnimation, setTabAnimationState] = useState<TabAnimationSettings>(
    dataState === 'empty' ? emptyTabAnimation : tabAnimationDefaults,
  );
  const [scrollToTop, setScrollToTopState] = useState<ScrollToTopSettings>({
    ...scrollToTopDefaults,
    enabled: dataState !== 'empty',
  });
  const [settings, setSettingsState] = useState<StoreSettings>({ ...storeSettingsDefaults });

  const [setupDismissed, setSetupDismissed] = useState(false);
  const [supportDismissed, setSupportDismissed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // The state switcher above the prototype is app-wide, so flipping it reseeds
  // everything rather than leaving one screen showing stale rows.
  useEffect(() => {
    setCampaigns(data);
    setDraft(null);
  }, [data]);

  useEffect(() => {
    setTabAnimationState(dataState === 'empty' ? emptyTabAnimation : tabAnimationDefaults);
    setScrollToTopState({ ...scrollToTopDefaults, enabled: dataState !== 'empty' });
  }, [dataState]);

  const showToast = useCallback((message: string) => setToast(message), []);

  const setScreen = useCallback(
    (next: Screen) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next === 'HOME') params.delete(SCREEN_PARAM);
          else params.set(SCREEN_PARAM, SCREEN_SLUG[next]);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const goTo = useCallback(
    (next: Screen) => {
      setScreen(next);
      if (next !== 'EDITOR') {
        setEditingId(null);
        setDraft(null);
      }
    },
    [setScreen],
  );

  const openEditor = useCallback(
    (id: string) => {
      setDraft(null);
      setEditingId(id);
      setScreen('EDITOR');
    },
    [setScreen],
  );

  const createCampaign = useCallback(() => {
    setDraft(newCampaign(`campaign-${Date.now()}`));
    setEditingId(null);
    setScreen('EDITOR');
  }, [setScreen]);

  const updateCampaign = useCallback((id: string, patch: (campaign: Campaign) => Campaign) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === id ? { ...patch(campaign), updatedAt: TODAY_ISO } : campaign,
      ),
    );
  }, []);

  /** The editor hands back a whole record: a new campaign joins the list here. */
  const saveEditing = useCallback((campaign: Campaign) => {
    setCampaigns((current) => {
      const exists = current.some((entry) => entry.id === campaign.id);
      const saved = { ...campaign, updatedAt: TODAY_ISO };
      return exists
        ? current.map((entry) => (entry.id === campaign.id ? saved : entry))
        : [saved, ...current];
    });
    setDraft(null);
    setEditingId(campaign.id);
  }, []);

  const setEnabled = useCallback((ids: string[], enabled: boolean) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        ids.includes(campaign.id) ? { ...campaign, enabled, updatedAt: TODAY_ISO } : campaign,
      ),
    );
  }, []);

  /** First publish flips both flags; after that Activate only touches `enabled`. */
  const publish = useCallback((ids: string[]) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        ids.includes(campaign.id)
          ? { ...campaign, enabled: true, published: true, updatedAt: TODAY_ISO }
          : campaign,
      ),
    );
  }, []);

  /** A copy is always a Draft, so it can never reach the storefront by itself. */
  const duplicate = useCallback((ids: string[]) => {
    setCampaigns((current) => {
      const copies = current
        .filter((campaign) => ids.includes(campaign.id))
        .map((campaign, index) => ({
          ...campaign,
          id: `${campaign.id}-copy-${Date.now()}-${index}`,
          name: `${campaign.name || 'Untitled campaign'} copy`,
          enabled: false,
          published: false,
          createdAt: TODAY_ISO,
          updatedAt: TODAY_ISO,
        }));
      return [...copies, ...current];
    });
  }, []);

  const remove = useCallback((ids: string[]) => {
    setCampaigns((current) => current.filter((campaign) => !ids.includes(campaign.id)));
  }, []);

  const setTabAnimation = useCallback((patch: Partial<TabAnimationSettings>) => {
    setTabAnimationState((current) => ({ ...current, ...patch }));
  }, []);

  const setScrollToTop = useCallback((patch: Partial<ScrollToTopSettings>) => {
    setScrollToTopState((current) => ({ ...current, ...patch }));
  }, []);

  const setSettings = useCallback((patch: Partial<StoreSettings>) => {
    setSettingsState((current) => ({ ...current, ...patch }));
  }, []);

  /**
   * Kill switch: every campaign off and both modules off, in one action. It does
   * not delete anything, so switching things back on restores the setup.
   */
  const killAll = useCallback(() => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.enabled ? { ...campaign, enabled: false, updatedAt: TODAY_ISO } : campaign,
      ),
    );
    setTabAnimationState((current) => ({ ...current, enabled: false }));
    setScrollToTopState((current) => ({ ...current, enabled: false }));
  }, []);

  const editing = useMemo(() => {
    if (draft) return draft;
    const chosen = campaigns.find((campaign) => campaign.id === editingId);
    if (chosen) return chosen;
    // Deep-linked straight to ?screen=editor: open the first campaign rather than
    // an empty shell, so the link is worth sharing.
    return screen === 'EDITOR' ? (campaigns[0] ?? null) : null;
  }, [draft, campaigns, editingId, screen]);

  return useMemo(
    () => ({
      dataState,
      loading,
      error,
      screen,
      editingId: draft ? draft.id : (editingId ?? editing?.id ?? null),
      goTo,
      openEditor,
      createCampaign,
      embed,
      setEmbedEnabled: (enabled: boolean) => setEmbed((current) => ({ ...current, enabled })),
      campaigns,
      editing,
      updateCampaign,
      saveEditing,
      setEnabled,
      publish,
      duplicate,
      remove,
      tabAnimation,
      setTabAnimation,
      scrollToTop,
      setScrollToTop,
      settings,
      setSettings,
      killAll,
      setupDismissed,
      dismissSetup: () => setSetupDismissed(true),
      supportDismissed,
      dismissSupport: () => setSupportDismissed(true),
      toast,
      showToast,
      clearToast: () => setToast(null),
    }),
    [
      dataState,
      loading,
      error,
      screen,
      draft,
      editingId,
      goTo,
      openEditor,
      createCampaign,
      embed,
      campaigns,
      editing,
      updateCampaign,
      saveEditing,
      setEnabled,
      publish,
      duplicate,
      remove,
      tabAnimation,
      setTabAnimation,
      scrollToTop,
      setScrollToTop,
      settings,
      setSettings,
      killAll,
      setupDismissed,
      supportDismissed,
      toast,
      showToast,
    ],
  );
}

/** The campaign currently on the storefront, if any — used by the preview and by Home. */
export function liveCampaign(campaigns: Campaign[]): Campaign | null {
  return campaigns.find((campaign) => statusOf(campaign) === 'LIVE') ?? null;
}
