import { CollectionPage, type CollectionPageProps } from "./CollectionPage";

export default function FavoritesPage(
  props: Omit<CollectionPageProps, "page">,
) {
  return <CollectionPage {...props} page="favorites" />;
}
