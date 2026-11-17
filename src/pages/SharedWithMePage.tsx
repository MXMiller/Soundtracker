import { CollectionPage, type CollectionPageProps } from "./CollectionPage";

export default function SharedWithMePage(
  props: Omit<CollectionPageProps, "page">,
) {
  return <CollectionPage {...props} page="shared" />;
}
