import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { AdminFrame } from './shell/admin-frame';
import { PrototypeHost } from './shell/prototype-host';
import { PrototypeIndex } from './shell/prototype-index';

/**
 * HashRouter, not BrowserRouter: GitHub Pages serves static files and cannot
 * rewrite unknown paths to index.html, so a path-based deep link would 404 on
 * refresh. Hash routes are handled entirely in the browser.
 */
export default function App() {
  return (
    <HashRouter>
      <AdminFrame>
        <Routes>
          <Route path="/" element={<PrototypeIndex />} />
          <Route path="/p/:slug" element={<PrototypeHost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminFrame>
    </HashRouter>
  );
}
