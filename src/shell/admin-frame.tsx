import { Button, Frame, Navigation, TopBar } from '@shopify/polaris';
import {
  DiscountIcon,
  HomeIcon,
  LayoutBlockIcon,
  OrderIcon,
  PersonIcon,
  ProductIcon,
} from '@shopify/polaris-icons';
import { useCallback, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import { prototypes } from '../lib/registry';
import { shop } from '../mocks/shop';
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
 */
export function AdminFrame({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const chromeHidden = useChromeHidden();
  const setChromeHidden = useSetChromeHidden();

  // Preserve ?state= and ?chrome= across navigation so a linked demo state survives.
  const go = useCallback(
    (to: string) => {
      const query = searchParams.toString();
      navigate(query ? `${to}?${query}` : to);
      setMobileNavOpen(false);
    },
    [navigate, searchParams],
  );

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
        {
          items: [
            { content: 'Hide admin chrome', onAction: () => setChromeHidden(true) },
            { content: 'All prototypes', onAction: () => go('/') },
          ],
        },
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

      <Navigation.Section
        separator
        title="Prototypes"
        items={[
          {
            label: 'All prototypes',
            icon: LayoutBlockIcon,
            selected: location.pathname === '/',
            onClick: () => go('/'),
          },
          ...prototypes.map((entry) => ({
            label: entry.title,
            selected: location.pathname === `/p/${entry.slug}`,
            onClick: () => go(`/p/${entry.slug}`),
          })),
        ]}
      />
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
