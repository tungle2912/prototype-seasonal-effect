import { Toast } from '@shopify/polaris';
import {
  ArrowUpIcon,
  CalendarTimeIcon,
  GlobeIcon,
  HomeIcon,
  SettingsIcon,
} from '@shopify/polaris-icons';
import { useMemo } from 'react';

import { useChromeHidden } from '../../shell/chrome-state';
import { useRegisterAppNav, type AppNavMenu } from '../../shell/app-nav';
import { CampaignEditorScreen } from './screens/campaign-editor';
import { CampaignsScreen } from './screens/campaigns';
import { HomeScreen } from './screens/home';
import { ScrollToTopScreen } from './screens/scroll-to-top';
import { SettingsScreen } from './screens/settings';
import { TabAnimationScreen } from './screens/tab-animation';
import { AppContext, type Screen } from './state/app-state';
import { useAppStore } from './state/use-app-store';

/**
 * Seasonal Effects — a mock of the whole app, not one screen.
 *
 * Six sections share one store on purpose. The app embed switch on Home blocks
 * publishing on two other screens, the always-on toggles on Home are the same
 * flag as the ones on the module screens, and a live seasonal skin overrides the
 * scroll-to-top colours. Splitting those into separate prototypes would remove
 * the only behaviour worth reviewing, so navigation here is local state — no
 * router, as the house rules require.
 */

export default function SeasonalEffects() {
  const store = useAppStore();
  const chromeHidden = useChromeHidden();

  const { screen, goTo, embed, campaigns, tabAnimation, scrollToTop } = store;

  // Memoized: a fresh object every render would loop through the nav provider.
  const navMenu = useMemo<AppNavMenu>(
    () => ({
      title: 'Seasonal Effects',
      items: [
        {
          label: 'Home',
          icon: HomeIcon,
          selected: screen === 'HOME',
          badge: embed.enabled ? undefined : 'Off',
          onClick: () => goTo('HOME'),
        },
        {
          label: 'Campaigns',
          icon: CalendarTimeIcon,
          selected: screen === 'CAMPAIGNS' || screen === 'EDITOR',
          badge: campaigns.length > 0 ? String(campaigns.length) : undefined,
          onClick: () => goTo('CAMPAIGNS'),
        },
        {
          label: 'Tab animation',
          icon: GlobeIcon,
          selected: screen === 'TAB_ANIMATION',
          badge: tabAnimation.enabled ? undefined : 'Off',
          onClick: () => goTo('TAB_ANIMATION'),
        },
        {
          label: 'Scroll to top',
          icon: ArrowUpIcon,
          selected: screen === 'SCROLL_TO_TOP',
          badge: scrollToTop.enabled ? undefined : 'Off',
          onClick: () => goTo('SCROLL_TO_TOP'),
        },
        {
          label: 'Settings',
          icon: SettingsIcon,
          selected: screen === 'SETTINGS',
          onClick: () => goTo('SETTINGS'),
        },
      ],
    }),
    [screen, goTo, embed.enabled, campaigns.length, tabAnimation.enabled, scrollToTop.enabled],
  );

  useRegisterAppNav(navMenu);

  return (
    <AppContext.Provider value={store}>
      {renderScreen(screen)}

      {/* Toast renders into the admin chrome's Frame, so it needs that chrome present. */}
      {store.toast && !chromeHidden ? (
        <Toast content={store.toast} onDismiss={store.clearToast} duration={4000} />
      ) : null}
    </AppContext.Provider>
  );
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case 'HOME':
      return <HomeScreen />;
    case 'CAMPAIGNS':
      return <CampaignsScreen />;
    case 'EDITOR':
      return <CampaignEditorScreen />;
    case 'TAB_ANIMATION':
      return <TabAnimationScreen />;
    case 'SCROLL_TO_TOP':
      return <ScrollToTopScreen />;
    case 'SETTINGS':
      return <SettingsScreen />;
  }
}
