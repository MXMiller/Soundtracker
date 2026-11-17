import { useMemo } from "react";
import {
  Bookmark,
  ChevronDown,
  FileUp,
  Music2,
  Plus,
  Search,
  Share2,
} from "lucide-react";
import { currentUser } from "../data";
import type { Soundtrack, ViewPage } from "../types";
import { PageSearch, SoundtrackCard } from "../components/EntityCards";

export interface CollectionPageProps {
  page: ViewPage;
  soundtracks: Soundtrack[];
  visibleSoundtracks: Soundtrack[];
  favoriteIds: string[];
  query: string;
  isMine: (item: Soundtrack) => boolean;
  onQueryChange: (value: string) => void;
  onOpen: (item: Soundtrack) => void;
  onFavorite: (item: Soundtrack) => void;
  onCreate: () => void;
  onImport: () => void;
}

const pageCopy: Record<ViewPage, { title: string; description: string }> = {
  library: {
    title: "Good morning, Jamie.",
    description: "A little space for all the music in your head.",
  },
  explore: {
    title: "Find your next inspiration.",
    description: "Explore the musical worlds others have created.",
  },
  favorites: {
    title: "Your saved soundtracks.",
    description: "A little collection of music you want to return to.",
  },
  shared: {
    title: "Made together.",
    description: "Soundtracks others have invited you to work on.",
  },
};

const pageTitle: Record<ViewPage, string> = {
  library: "Your collection",
  explore: "Explore",
  favorites: "Favorites",
  shared: "Shared with me",
};

export function CollectionPage({
  page,
  soundtracks,
  visibleSoundtracks,
  favoriteIds,
  query,
  isMine,
  onQueryChange,
  onOpen,
  onFavorite,
  onCreate,
  onImport,
}: CollectionPageProps) {
  const copy = pageCopy[page];
  const sharedCount = useMemo(
    () =>
      soundtracks.filter(
        (item) => item.collaborators[currentUser.id] && !isMine(item),
      ).length,
    [isMine, soundtracks],
  );

  return (
    <div className="content library-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow muted-eyebrow">MONDAY, NOVEMBER 16</div>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        {page === "library" && (
          <div className="welcome-actions">
            <button className="button button-outline" onClick={onImport}>
              <FileUp size={16} /> Import .md
            </button>
            <button className="button button-primary" onClick={onCreate}>
              <Plus size={16} /> New soundtrack
            </button>
          </div>
        )}
      </div>

      {page === "library" && (
        <div className="stats-strip">
          <div>
            <span className="stat-icon rose">
              <Music2 size={17} />
            </span>
            <div>
              <strong>{soundtracks.filter(isMine).length}</strong>
              <small>Your soundtracks</small>
            </div>
          </div>
          <div>
            <span className="stat-icon lavender">
              <Bookmark size={17} />
            </span>
            <div>
              <strong>{favoriteIds.length}</strong>
              <small>Saved favorites</small>
            </div>
          </div>
          <div>
            <span className="stat-icon sage">
              <Share2 size={17} />
            </span>
            <div>
              <strong>{sharedCount}</strong>
              <small>Shared with you</small>
            </div>
          </div>
        </div>
      )}

      <div className="section-toolbar">
        <div className="list-title">
          <h2>{pageTitle[page]}</h2>
          <span>{visibleSoundtracks.length} soundtracks</span>
        </div>
        <div className={page === "library" ? "section-tools" : undefined}>
          <PageSearch page={page} query={query} onChange={onQueryChange} />
          {page === "library" && (
            <div className="sort-pill">
              Recently updated <ChevronDown size={14} />
            </div>
          )}
        </div>
      </div>

      {visibleSoundtracks.length > 0 ? (
        <div className="library-grid">
          {visibleSoundtracks.map((item, index) => (
            <SoundtrackCard
              key={item.id}
              item={item}
              index={index}
              isMine={isMine(item)}
              isFavorite={favoriteIds.includes(item.id)}
              onOpen={() => onOpen(item)}
              onFavorite={() => onFavorite(item)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-library">
          <div className="empty-icon">
            <Search size={21} />
          </div>
          <h3>
            {query
              ? "Nothing matched your search"
              : page === "favorites"
                ? "No favorites just yet"
                : "Nothing here yet"}
          </h3>
          <p>
            {query
              ? "Try a different title or composer."
              : page === "explore"
                ? "Public and open soundtracks from the community will appear here."
                : page === "shared"
                  ? "Invitations to collaborate will show up here."
                  : "Create a soundtrack or import one to get started."}
          </p>
          {page === "library" && !query && (
            <div className="empty-actions">
              <button className="button button-primary" onClick={onCreate}>
                <Plus size={16} /> Create a soundtrack
              </button>
              <button className="button button-outline" onClick={onImport}>
                <FileUp size={16} /> Import Markdown
              </button>
            </div>
          )}
        </div>
      )}

      {page === "library" && visibleSoundtracks.length > 0 && (
        <button className="create-card" onClick={onCreate}>
          <span>
            <Plus size={19} />
          </span>
          <strong>Create a new soundtrack</strong>
          <small>Start building a musical world</small>
        </button>
      )}
      <footer className="page-footer">
        Soundtracker <span>·</span> Keep the music connected to the story.
      </footer>
    </div>
  );
}
