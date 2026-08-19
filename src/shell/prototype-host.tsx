import {
  Banner,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  EmptyState,
  InlineStack,
  Page,
  SkeletonBodyText,
  SkeletonPage,
  Text,
} from '@shopify/polaris';
import { lazy, Suspense, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import emptyStateImage from '../assets/empty-state.svg';
import {
  PROTOTYPE_STATES,
  usePrototypeState,
  useSetPrototypeState,
  type PrototypeState,
} from '../lib/mock-state';
import { getPrototype, type PrototypeEntry } from '../lib/registry';

const STATE_LABEL: Record<PrototypeState, string> = {
  data: 'With data',
  loading: 'Loading',
  empty: 'Empty',
  error: 'Error',
};

/**
 * Route wrapper for a single prototype.
 *
 * Everything every prototype needs, in one place: the "this is a mockup"
 * disclaimer, the state switcher, lazy loading, and a not-found screen. The
 * prototype itself only has to render its own UI.
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
    <>
      <PrototypeToolbar entry={entry} />

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
    </>
  );
}

function PrototypeToolbar({ entry }: { entry: PrototypeEntry }) {
  const state = usePrototypeState();
  const setState = useSetPrototypeState();

  return (
    <Box paddingInlineStart="400" paddingInlineEnd="400" paddingBlockStart="400">
      <Banner tone="info" title={`Prototype: ${entry.title}`}>
        <BlockStack gap="300">
          <Text as="p">
            Mock data only — this screen is not connected to a Shopify store, and nothing you do
            here is saved.
          </Text>

          <InlineStack gap="200" blockAlign="center">
            <Text as="span" variant="bodySm" tone="subdued">
              Simulate state
            </Text>
            <ButtonGroup>
              {PROTOTYPE_STATES.map((candidate) => (
                <Button
                  key={candidate}
                  size="slim"
                  pressed={state === candidate}
                  onClick={() => setState(candidate)}
                >
                  {STATE_LABEL[candidate]}
                </Button>
              ))}
            </ButtonGroup>
          </InlineStack>
        </BlockStack>
      </Banner>
    </Box>
  );
}
