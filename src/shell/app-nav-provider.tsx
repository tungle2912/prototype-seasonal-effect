import { useState, type ReactNode } from 'react';

import { AppNavContext, type AppNavMenu } from './app-nav';

/**
 * Holds the menu published by the open prototype. Must sit above `AdminFrame`,
 * which is what reads it. Kept in its own file so `app-nav.ts` stays a
 * hooks-only module (React Fast Refresh cannot handle a file that exports both).
 */
export function AppNavProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<AppNavMenu | null>(null);
  return <AppNavContext.Provider value={{ menu, setMenu }}>{children}</AppNavContext.Provider>;
}
