import { createContext, useContext, useEffect } from 'react';
import type { IconSource } from '@shopify/polaris';

/**
 * App-owned navigation, the way an embedded app really gets it.
 *
 * A prototype that mocks a whole app — rather than one screen — has its own
 * sections, and in the real admin those appear in the left sidebar: App Bridge
 * renders `<ui-nav-menu>` into the admin's own Navigation. Reproducing that
 * here keeps the house rule intact ("do not build your own header or sidebar")
 * while still showing the app's information architecture.
 *
 * A prototype calls `useRegisterAppNav(menu)`; `AdminFrame` reads it and renders
 * one extra `Navigation.Section`. The menu must be memoized by the caller,
 * because a fresh object on every render would loop through the provider's
 * state. See `src/prototypes/seasonal-effects/index.tsx` for the pattern.
 */

export interface AppNavItem {
  label: string;
  icon?: IconSource;
  selected?: boolean;
  /** Rendered as a Polaris Navigation badge, e.g. a count or "Off". */
  badge?: string;
  onClick: () => void;
}

export interface AppNavMenu {
  /** The app's name — becomes the section title, as `ui-nav-menu` does. */
  title: string;
  items: AppNavItem[];
}

export interface AppNavContextValue {
  menu: AppNavMenu | null;
  setMenu: (menu: AppNavMenu | null) => void;
}

/** Consumed by `AppNavProvider`; everything else goes through the hooks below. */
export const AppNavContext = createContext<AppNavContextValue>({
  menu: null,
  setMenu: () => {},
});

/** Read by AdminFrame only. */
export function useAppNavMenu(): AppNavMenu | null {
  return useContext(AppNavContext).menu;
}

/** Called by a prototype. Pass a memoized menu, or null to clear it. */
export function useRegisterAppNav(menu: AppNavMenu | null): void {
  const { setMenu } = useContext(AppNavContext);

  useEffect(() => {
    setMenu(menu);
    return () => setMenu(null);
  }, [menu, setMenu]);
}
