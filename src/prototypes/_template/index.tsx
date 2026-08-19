import { BlockStack, Banner, Card, EmptyState, Layout, Page, SkeletonBodyText, Text } from '@shopify/polaris';

import emptyStateImage from '../../assets/empty-state.svg';
import { useMockData } from '../../lib/mock-state';
import { products, type Product } from '../../mocks/products';

/**
 * Starting point for a new prototype.
 *
 * The four states below are not optional — the state switcher above this page
 * lets a reviewer flip between them, so all four must render something sensible.
 * Delete what you don't need and build the real screen.
 */
export default function Template() {
  const { loading, error, data } = useMockData<Product[]>(products, []);

  return (
    <Page title="Template" subtitle="Replace this with the feature you are prototyping">
      <Layout>
        <Layout.Section>
          {loading ? (
            <Card>
              <SkeletonBodyText lines={6} />
            </Card>
          ) : error ? (
            <Banner tone="critical" title="Could not load products">
              <p>{error}</p>
            </Banner>
          ) : data.length === 0 ? (
            <Card>
              <EmptyState heading="Nothing here yet" image={emptyStateImage}>
                <p>Describe what the merchant would do first.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="200">
                {data.map((product) => (
                  <Text key={product.id} as="p">
                    {product.title}
                  </Text>
                ))}
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
