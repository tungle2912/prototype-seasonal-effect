import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { AdminFrame } from './shell/admin-frame';
import { AppNavProvider } from './shell/app-nav-provider';
import { PrototypeHost } from './shell/prototype-host';

/**
 * HashRouter, not BrowserRouter: GitHub Pages serves static files and cannot
 * rewrite unknown paths to index.html, so a path-based deep link would 404 on
 * refresh. Hash routes are handled entirely in the browser.
 */
export default function App() {
  return (
    <HashRouter>
      <AppNavProvider>
        <AdminFrame>
          <Routes>
            <Route path="/p/:slug" element={<PrototypeHost />} />
            {/* One app lives here, so the root is that app rather than an index. */}
            <Route path="*" element={<Navigate to="/p/seasonal-effects" replace />} />
          </Routes>
        </AdminFrame>
      </AppNavProvider>
    </HashRouter>
  );
}
