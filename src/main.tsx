import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Polaris ships one stylesheet; it must be imported once, before any component.
import '@shopify/polaris/build/esm/styles.css';

import App from './app';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <AppProvider i18n={enTranslations}>
      <App />
    </AppProvider>
  </StrictMode>,
);
