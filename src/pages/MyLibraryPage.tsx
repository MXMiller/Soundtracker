import { CollectionPage, type CollectionPageProps } from "./CollectionPage";

export default function MyLibraryPage(
  props: Omit<CollectionPageProps, "page">,
) {
  return <CollectionPage {...props} page="library" />;
}
