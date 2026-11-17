import {
  ArrowRight,
  AudioLines,
  BookOpen,
  ChevronRight,
  Disc3,
  ExternalLink,
  Heart,
  Layers3,
  MoreHorizontal,
  Music2,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type {
  Leitmotif,
  Soundtrack,
  SoundtrackEntity,
  StoryItem,
  Track,
  ViewPage,
} from "../types";
import { niceDate } from "../utils";
type Entity = SoundtrackEntity;
type Page = ViewPage;

export function PageSearch({
  page,
  query,
  onChange,
}: {
  page: Page;
  query: string;
  onChange: (value: string) => void;
}) {
  const placeholder =
    page === "explore"
      ? "Search public soundtracks…"
      : page === "favorites"
        ? "Search favorites…"
        : page === "shared"
          ? "Search shared soundtracks…"
          : "Search your library…";
  return (
    <label className="page-search">
      <Search size={15} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={query}
        onChange={(event) => onChange(event.target.value)}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}

export function SoundtrackCard({
  item,
  index,
  isMine,
  isFavorite,
  onOpen,
  onFavorite,
}: {
  item: Soundtrack;
  index: number;
  isMine: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
}) {
  return (
    <article className="soundtrack-card">
      <button className={`card-cover cover-${index % 4}`} onClick={onOpen}>
        <div className="cover-pattern">
          <div />
          <div />
          <div />
        </div>
        <span className="cover-small">
          <AudioLines size={17} /> SOUNDTRACK STUDY&nbsp; / &nbsp;0{index + 1}
        </span>
        <span className="cover-title">{item.name}</span>
        <span className="cover-composer">{item.composers.join(" · ")}</span>
        <span className="cover-waves">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className="card-main">
        <div className="card-topline">
          <span className={`visibility-pill ${item.visibility}`}>
            <i />
            {item.visibility}
          </span>
          <button
            className={`icon-button tiny-heart ${isFavorite ? "is-favorite" : ""}`}
            onClick={onFavorite}
            aria-label="Toggle favorite"
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        <button className="card-name" onClick={onOpen}>
          {item.name}
        </button>
        <div className="card-byline">
          {isMine ? "By you" : `By ${item.ownerName}`} <span>·</span>{" "}
          {item.composers.join(", ") || "Untitled composer"}
        </div>
        <p className="card-description">
          {item.description || "A musical world waiting to be explored."}
        </p>
        <div className="card-bottom">
          <span>
            <Disc3 size={14} />
            {item.tracks.length} tracks
          </span>
          <span>
            <BookOpen size={14} />
            {item.storyItems.length} story items
          </span>
          <span className="card-updated">{niceDate(item.updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function StoryCard({
  item,
  active,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}: {
  item: StoryItem;
  active: Soundtrack;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color =
    item.type === "Character"
      ? "coral"
      : item.type === "Setting"
        ? "blue"
        : item.type === "Idea"
          ? "gold"
          : "sage";
  return (
    <article className="entity-card">
      <div className={`entity-art ${color}`}>
        <span>{item.type}</span>
        <div className="art-initial">{item.name.slice(0, 1).toUpperCase()}</div>
        <div className="art-ring" />
      </div>
      <div className="entity-body">
        <div className="entity-card-top">
          <span className="type-label">{item.type}</span>
          {canEdit && <EntityMenu onEdit={onEdit} onDelete={onDelete} />}
        </div>
        <button className="entity-name" onClick={onOpen}>
          {item.name}
        </button>
        <p>{item.description || "A story element connected to the music."}</p>
        <div className="entity-tags">
          {item.musicalKey && (
            <span>
              <Music2 size={12} />
              {item.musicalKey}
            </span>
          )}
          {item.motifIds.slice(0, 2).map((id) => (
            <span key={id}>
              <AudioLines size={12} />
              {active.leitmotifs.find((m) => m.id === id)?.name || "Leitmotif"}
            </span>
          ))}
          {item.instruments.slice(0, 1).map((inst) => (
            <span key={inst}>{inst}</span>
          ))}
        </div>
        <button className="view-details" onClick={onOpen}>
          View details <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

export function MotifCard({
  item,
  active,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}: {
  item: Leitmotif;
  active: Soundtrack;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="entity-card motif-card">
      <div className="motif-visual">
        <div className="note-lines">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="notes">
          <span>♪</span>
          <span>♩</span>
          <span>♫</span>
          <span>♬</span>
          <span>♪</span>
        </div>
        <div className="motif-index">
          MOTIF {String(active.leitmotifs.indexOf(item) + 1).padStart(2, "0")}
        </div>
      </div>
      <div className="entity-body">
        <div className="entity-card-top">
          <span className="type-label motif-label">LEITMOTIF</span>
          {canEdit && <EntityMenu onEdit={onEdit} onDelete={onDelete} />}
        </div>
        <button className="entity-name" onClick={onOpen}>
          {item.name}
        </button>
        <p>{item.description || "A musical idea woven into this story."}</p>
        <div className="entity-tags">
          {item.storyItemIds.slice(0, 2).map((id) => (
            <span key={id}>
              <BookOpen size={12} />
              {active.storyItems.find((s) => s.id === id)?.name || "Story item"}
            </span>
          ))}
          {item.derivedFromIds.slice(0, 2).map((id) => (
            <span key={`from-${id}`}>
              <ArrowRight size={12} />
              From: {active.leitmotifs.find((motif) => motif.id === id)?.name || "Leitmotif"}
            </span>
          ))}
          {active.leitmotifs
            .filter((motif) => motif.derivedFromIds.includes(item.id))
            .slice(0, 2)
            .map((motif) => (
              <span key={`derived-${motif.id}`}>
                <ArrowRight size={12} />
                Derived: {motif.name}
              </span>
            ))}
        </div>
        <button className="view-details" onClick={onOpen}>
          Explore motif <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
}

export function TrackCard({
  item,
  active,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}: {
  item: Track;
  active: Soundtrack;
  canEdit: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="track-row">
      <div className="track-number">
        {item.trackNumber ? String(item.trackNumber).padStart(2, "0") : "—"}
      </div>
      <button className="track-play" onClick={onOpen}>
        <Music2 size={18} />
      </button>
      <div className="track-info">
        <button className="track-title" onClick={onOpen}>
          {item.name}
        </button>
        <div className="track-subtitle">
          {item.composers.join(", ") || "Composer not listed"} <span>·</span>{" "}
          {item.description || "No description yet"}
        </div>
        <div className="track-motif-list">
          {item.motifAppearances.map((appearance) => (
            <span key={appearance.leitmotifId}>
              <AudioLines size={12} />
              {active.leitmotifs.find((m) => m.id === appearance.leitmotifId)
                ?.name || "Leitmotif"}
            </span>
          ))}
        </div>
      </div>
      <div className="track-appearance">
        {item.motifAppearances[0]?.appearanceInTrack && (
          <>
            <small>FEATURES AT</small>
            <span>{item.motifAppearances[0].appearanceInTrack}</span>
          </>
        )}
      </div>
      {item.listeningUrl && (
        <a
          href={item.listeningUrl}
          target="_blank"
          rel="noreferrer"
          className="icon-button"
          aria-label="Listen to track"
        >
          <ExternalLink size={17} />
        </a>
      )}
      {canEdit && <EntityMenu onEdit={onEdit} onDelete={onDelete} />}
      <button className="track-open" onClick={onOpen}>
        <ChevronRight size={18} />
      </button>
    </article>
  );
}

export function EntityMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="dropdown-wrap entity-menu">
      <button className="icon-button" aria-label="Page actions">
        <MoreHorizontal size={18} />
      </button>
      <div className="dropdown">
        <button onClick={onEdit}>
          <Layers3 size={14} /> Edit page
        </button>
        <button className="danger" onClick={onDelete}>
          <Trash2 size={14} /> Delete page
        </button>
      </div>
    </div>
  );
}

export function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-block">
      <small>{label}</small>
      <p>{value}</p>
    </div>
  );
}

export function RelatedBlock({
  title,
  empty,
  rows,
  icon,
  onClick,
}: {
  title: string;
  empty: string;
  rows: Entity[];
  icon: React.ReactNode;
  onClick: (entity: Entity) => void;
}) {
  return (
    <div className="related-block">
      <h4>{title}</h4>
      {rows.length ? (
        <div className="related-pills">
          {rows.map((row) => (
            <button key={row.id} onClick={() => onClick(row)}>
              {icon}
              {row.name}
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
      ) : (
        <span className="detail-empty">{empty}</span>
      )}
    </div>
  );
}
