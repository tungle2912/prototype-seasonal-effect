import { Card, EmptyState, Page, SkeletonBodyText, SkeletonPage } from '@shopify/polaris';
import { lazy, Suspense, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import emptyStateImage from '../assets/empty-state.svg';
import { getPrototype } from '../lib/registry';

/**
 * Route wrapper for a single prototype: lazy loading and a not-found screen.
 *
 * No disclaimer banner and no visible state switcher — the prototype is meant to
 * read as the app itself, not as a page with a review widget bolted on top. The
 * four simulated states are still reachable and still linkable through
 * `?state=loading|empty|error`; they just have no chrome of their own.
 */
export function PrototypeHost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const entry = getPrototype(slug);

  // lazy() must be created once per prototype, not on every render.
  const Component = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);

  if (!entry || !Component) {
    return (
      <Page title="Prototype not found">
        <Card>
          <EmptyState
            heading="That prototype does not exist"
            image={emptyStateImage}
            action={{ content: 'All prototypes', onAction: () => navigate('/') }}
          >
            <p>
              The URL points at <code>{slug}</code>, but no folder with that name was found in{' '}
              <code>src/prototypes/</code>.
            </p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  // Deliberately not a flex wrapper: Polaris' Page sizes itself with
  // `max-width` + auto margins, and as a flex item it collapses to its
  // content width instead, which breaks two-column Layouts.
  return (
    <Suspense
      fallback={
        <SkeletonPage title={entry.title}>
          <Card>
            <SkeletonBodyText lines={8} />
          </Card>
        </SkeletonPage>
      }
    >
      <Component />
    </Suspense>
  );
}
