import { CollectionPage, type CollectionPageProps } from "./CollectionPage";

export default function ExplorePage(props: Omit<CollectionPageProps, "page">) {
  return <CollectionPage {...props} page="explore" />;
}
