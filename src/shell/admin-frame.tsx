import { Button, Frame, Navigation, TopBar } from '@shopify/polaris';
import {
  DiscountIcon,
  HomeIcon,
  OrderIcon,
  PersonIcon,
  ProductIcon,
} from '@shopify/polaris-icons';
import { useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { shop } from '../mocks/shop';
import { useAppNavMenu } from './app-nav';
import { useChromeHidden, useSetChromeHidden } from './chrome-state';

/**
 * Fake Shopify admin chrome.
 *
 * A real embedded app gets its top bar and sidebar from the admin itself, via
 * App Bridge. This prototype runs standalone on GitHub Pages, so the chrome is
 * reproduced here with Polaris' own Frame/TopBar/Navigation. It exists purely
 * so screenshots read as "a feature inside Shopify" rather than "a web page".
 *
 * Append `?chrome=off` to any prototype URL to strip it away.
 *
 * A prototype that mocks a whole app (several sections, not one screen) can
 * publish its own menu with `useRegisterAppNav()`; it renders here as an extra
 * sidebar section, which is where App Bridge puts `<ui-nav-menu>` in the real
 * admin. See `src/shell/app-nav.tsx`.
 */
export function AdminFrame({ children }: { children: ReactNode }) {
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const chromeHidden = useChromeHidden();
  const setChromeHidden = useSetChromeHidden();
  const appNav = useAppNavMenu();

  if (chromeHidden) {
    return (
      <>
        <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 520 }}>
          <Button size="slim" onClick={() => setChromeHidden(false)}>
            Show admin chrome
          </Button>
        </div>
        {children}
      </>
    );
  }

  const userMenu = (
    <TopBar.UserMenu
      name={shop.staffName}
      detail={shop.name}
      initials={shop.staffInitials}
      open={userMenuOpen}
      onToggle={() => setUserMenuOpen((open) => !open)}
      actions={[
        { items: [{ content: 'Hide admin chrome', onAction: () => setChromeHidden(true) }] },
      ]}
    />
  );

  const topBar = (
    <TopBar
      showNavigationToggle
      userMenu={userMenu}
      onNavigationToggle={() => setMobileNavOpen((open) => !open)}
      searchField={
        <TopBar.SearchField
          value={searchValue}
          placeholder="Search"
          onChange={setSearchValue}
          showFocusBorder
        />
      }
    />
  );

  const navigation = (
    <Navigation location={location.pathname}>
      {/* Decorative: these mirror the real admin sidebar but lead nowhere,
          because the prototypes live under the "Prototypes" section below. */}
      <Navigation.Section
        items={[
          { label: 'Home', icon: HomeIcon, onClick: () => {} },
          { label: 'Orders', icon: OrderIcon, badge: '3', onClick: () => {} },
          { label: 'Products', icon: ProductIcon, onClick: () => {} },
          { label: 'Customers', icon: PersonIcon, onClick: () => {} },
          { label: 'Discounts', icon: DiscountIcon, onClick: () => {} },
        ]}
      />

      {/* The open prototype's own sections, mirroring App Bridge ui-nav-menu. */}
      {appNav ? (
        <Navigation.Section
          separator
          title={appNav.title}
          items={appNav.items.map((item) => ({
            label: item.label,
            icon: item.icon,
            selected: item.selected,
            badge: item.badge,
            onClick: item.onClick,
          }))}
        />
      ) : null}

    </Navigation>
  );

  return (
    <Frame
      topBar={topBar}
      navigation={navigation}
      showMobileNavigation={mobileNavOpen}
      onNavigationDismiss={() => setMobileNavOpen(false)}
    >
      {children}
    </Frame>
  );
}
