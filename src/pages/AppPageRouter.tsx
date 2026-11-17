import type {
  Leitmotif,
  Soundtrack,
  SoundtrackEntity,
  SoundtrackSection,
  StoryItem,
  Track,
  ViewPage,
} from "../types";
import ExplorePage from "./ExplorePage";
import FavoritesPage from "./FavoritesPage";
import MyLibraryPage from "./MyLibraryPage";
import SharedWithMePage from "./SharedWithMePage";
import SoundtrackPage from "./SoundtrackPage";
import StoryItemPage from "./StoryItemPage";
import LeitmotifPage from "./LeitmotifPage";
import TrackPage from "./TrackPage";
import type { CollectionPageProps } from "./CollectionPage";

export interface AppPageRouterProps {
  page: ViewPage;
  active: Soundtrack | null;
  detail: SoundtrackEntity | null;
  section: SoundtrackSection;
  soundtracks: Soundtrack[];
  visibleSoundtracks: Soundtrack[];
  favoriteIds: string[];
  query: string;
  isMine: (item: Soundtrack) => boolean;
  canEdit: (item: Soundtrack) => boolean;
  canDelete: (item: Soundtrack) => boolean;
  onQueryChange: (value: string) => void;
  onOpenSoundtrack: (item: Soundtrack) => void;
  onFavorite: (item: Soundtrack) => void;
  onCreate: () => void;
  onImport: () => void;
  onBackToList: () => void;
  onBackFromEntity: () => void;
  backLabel: string;
  onToggleFavorite: (item: Soundtrack) => void;
  onEditSoundtrack: (item: Soundtrack) => void;
  onShare: () => void;
  onDeleteSoundtrack: (item: Soundtrack) => void;
  onChangeSection: (section: SoundtrackSection) => void;
  onOpenEntity: (entity: SoundtrackEntity) => void;
  onNavigateEntity: (entity: SoundtrackEntity) => void;
  onEditEntity: (section: SoundtrackSection, entity: SoundtrackEntity) => void;
  onDeleteEntity: (section: SoundtrackSection, id: string) => void;
  onAddEntity: (section: SoundtrackSection) => void;
}

export default function AppPageRouter(props: AppPageRouterProps) {
  const collectionProps: Omit<CollectionPageProps, "page"> = {
    soundtracks: props.soundtracks,
    visibleSoundtracks: props.visibleSoundtracks,
    favoriteIds: props.favoriteIds,
    query: props.query,
    isMine: props.isMine,
    onQueryChange: props.onQueryChange,
    onOpen: props.onOpenSoundtrack,
    onFavorite: props.onFavorite,
    onCreate: props.onCreate,
    onImport: props.onImport,
  };

  if (!props.active) {
    switch (props.page) {
      case "explore":
        return <ExplorePage {...collectionProps} />;
      case "favorites":
        return <FavoritesPage {...collectionProps} />;
      case "shared":
        return <SharedWithMePage {...collectionProps} />;
      default:
        return <MyLibraryPage {...collectionProps} />;
    }
  }

  const soundtrack = props.active;
  const canEdit = props.canEdit(soundtrack);
  if (props.detail) {
    const detailProps = {
      soundtrack,
      canEdit,
      onBack: props.onBackFromEntity,
      backLabel: props.backLabel,
      onEdit: () => props.onEditEntity(props.section, props.detail!),
      onDelete: () => props.onDeleteEntity(props.section, props.detail!.id),
      onNavigate: props.onNavigateEntity,
    };
    if ("type" in props.detail) {
      return (
        <StoryItemPage item={props.detail as StoryItem} {...detailProps} />
      );
    }
    if ("storyItemIds" in props.detail) {
      return (
        <LeitmotifPage item={props.detail as Leitmotif} {...detailProps} />
      );
    }
    return <TrackPage item={props.detail as Track} {...detailProps} />;
  }

  return (
    <SoundtrackPage
      soundtrack={soundtrack}
      section={props.section}
      canEdit={canEdit}
      canDelete={props.canDelete(soundtrack)}
      isFavorite={props.favoriteIds.includes(soundtrack.id)}
      onBack={props.onBackToList}
      backLabel={props.page === "explore" ? "explore" : "library"}
      onToggleFavorite={() => props.onToggleFavorite(soundtrack)}
      onEditSoundtrack={() => props.onEditSoundtrack(soundtrack)}
      onShare={props.onShare}
      onDeleteSoundtrack={() => props.onDeleteSoundtrack(soundtrack)}
      onChangeSection={props.onChangeSection}
      onOpenEntity={props.onOpenEntity}
      onEditEntity={props.onEditEntity}
      onDeleteEntity={props.onDeleteEntity}
      onAddEntity={props.onAddEntity}
    />
  );
}
