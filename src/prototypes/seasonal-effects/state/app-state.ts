/**
 * The one place every screen reads from.
 *
 * Six screens share state on purpose: turning the app embed off on Home has to
 * block Publish on Campaigns, the always-on toggles on Home are the same flag as
 * the ones on the module screens, and a live seasonal skin overrides the
 * scroll-to-top colours. Those links are the point of the prototype, so they
 * cannot live in six separate `useState` calls.
 */

import { createContext, useContext } from 'react';

import type { Campaign } from '../../../mocks/seasonal-effects/campaigns';
import type {
  ScrollToTopSettings,
  StoreSettings,
  TabAnimationSettings,
} from '../../../mocks/seasonal-effects/modules';
import type { PrototypeState } from '../../../lib/mock-state';

export type Screen =
  | 'HOME'
  | 'CAMPAIGNS'
  | 'EDITOR'
  | 'TAB_ANIMATION'
  | 'SCROLL_TO_TOP'
  | 'SETTINGS';

export interface AppEmbed {
  enabled: boolean;
  themeName: string;
  bundleSizeKb: number;
}

export interface SetupStepState {
  /** Steps the merchant expanded or collapsed by hand. */
  expanded: string | null;
  dismissed: boolean;
}

export interface AppStore {
  /* --- simulated data state, shared by every screen --- */
  dataState: PrototypeState;
  loading: boolean;
  error: string | null;

  /* --- navigation --- */
  screen: Screen;
  /** Which campaign the editor has open. `null` while it is a brand-new one. */
  editingId: string | null;
  goTo: (screen: Screen) => void;
  openEditor: (id: string) => void;
  createCampaign: () => void;

  /* --- storefront reach --- */
  embed: AppEmbed;
  setEmbedEnabled: (enabled: boolean) => void;

  /* --- campaigns --- */
  campaigns: Campaign[];
  editing: Campaign | null;
  updateCampaign: (id: string, patch: (campaign: Campaign) => Campaign) => void;
  saveEditing: (campaign: Campaign) => void;
  setEnabled: (ids: string[], enabled: boolean) => void;
  publish: (ids: string[]) => void;
  duplicate: (ids: string[]) => void;
  remove: (ids: string[]) => void;

  /* --- always-on modules --- */
  tabAnimation: TabAnimationSettings;
  setTabAnimation: (patch: Partial<TabAnimationSettings>) => void;
  scrollToTop: ScrollToTopSettings;
  setScrollToTop: (patch: Partial<ScrollToTopSettings>) => void;

  /* --- store-wide settings --- */
  settings: StoreSettings;
  setSettings: (patch: Partial<StoreSettings>) => void;
  /** Turns off every effect on the storefront at once (PRD 10.3). */
  killAll: () => void;

  /* --- dismissible surfaces --- */
  setupDismissed: boolean;
  dismissSetup: () => void;
  supportDismissed: boolean;
  dismissSupport: () => void;

  /* --- one toast for the whole app --- */
  toast: string | null;
  showToast: (message: string) => void;
  clearToast: () => void;
}

export const AppContext = createContext<AppStore | null>(null);

export function useApp(): AppStore {
  const store = useContext(AppContext);
  if (!store) {
    throw new Error('useApp must be called inside the Seasonal Effects prototype tree.');
  }
  return store;
}
