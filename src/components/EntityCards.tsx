import {
  ArrowRight,
  AudioLines,
  BookOpen,
  ChevronRight,
  Disc3,
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
import { Fragment } from "react";
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
  onOpenProfile,
}: {
  item: Soundtrack;
  index: number;
  isMine: boolean;
  isFavorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  onOpenProfile?: (ownerId: string) => void;
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
        <span className="cover-title" style={{ color: item.nameColor }}>{item.name}</span>
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
        <div className="card-byline">
          Written by: {item.composers.join(", ") || "Unknown composer"}
          {!isMine && (
            <>
              <span>·</span> Shared by <button className="inline-profile-link" onClick={() => onOpenProfile?.(item.ownerId)}>{item.ownerName}</button>
            </>
          )}
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
    <article className="entity-card" onClick={onOpen}>
      <div className={`entity-art ${color}`}>
        <div className="art-ring" />
      </div>
      <div className="entity-body">
        <div className="entity-card-top">
          <span className="type-label">{item.type}</span>
          {canEdit && (
            <EntityMenu itemType="story item" onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
        <button
          className="entity-name"
          style={{ color: item.nameColor }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
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
          {item.motifIds.slice(0, 2).map((id) => {
            const motif = active.leitmotifs.find((m) => m.id === id);
            return <span key={id} style={{ color: motif?.nameColor }}>
              <AudioLines size={12} />
              {motif?.name || "Leitmotif"}
            </span>;
          })}
          {item.instruments.slice(0, 1).map((inst) => (
            <span key={inst}>{inst}</span>
          ))}
        </div>
        <button
          className="view-details"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          View {item.type.toLowerCase()} <ArrowRight size={14} />
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
    <article className="entity-card motif-card" onClick={onOpen}>
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
      </div>
      <div className="entity-body">
        <div className="entity-card-top">
          <span className="type-label motif-label">LEITMOTIF</span>
          {canEdit && (
            <EntityMenu itemType="leitmotif" onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
        <button
          className="entity-name"
          style={{ color: item.nameColor }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          {item.name}
        </button>
        <p>{item.description || "A musical idea woven into this story."}</p>
        <div className="entity-tags">
          {item.storyItemIds.slice(0, 2).map((id) => {
            const story = active.storyItems.find((s) => s.id === id);
            return <span key={id} style={{ color: story?.nameColor }}>
              <BookOpen size={12} />
              {story?.name || "Story item"}
            </span>;
          })}
          {item.derivedFromIds.slice(0, 2).map((id) => {
            const motif = active.leitmotifs.find((entry) => entry.id === id);
            return <span key={`from-${id}`} style={{ color: motif?.nameColor }}>
              <ArrowRight size={12} />
              From: {motif?.name || "Leitmotif"}
            </span>;
          })}
          {active.leitmotifs
            .filter((motif) => motif.derivedFromIds.includes(item.id))
            .slice(0, 2)
            .map((motif) => (
              <span key={`derived-${motif.id}`} style={{ color: motif.nameColor }}>
                <ArrowRight size={12} />
                Derived: {motif.name}
              </span>
            ))}
        </div>
        <button
          className="view-details"
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          View leitmotif <ArrowRight size={14} />
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
  const features = item.motifAppearances
    .map((appearance) =>
      active.leitmotifs.find((motif) => motif.id === appearance.leitmotifId),
    )
    .filter((motif): motif is Leitmotif => Boolean(motif));

  return (
    <article className="track-row" onClick={onOpen}>
      <div className="track-number">
        {item.trackNumber ? String(item.trackNumber).padStart(2, "0") : "—"}
      </div>
      <button
        className="track-play"
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <Music2 size={18} />
      </button>
      <div className="track-info">
        <button
          className="track-title"
          style={{ color: item.nameColor }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        >
          {item.name}
        </button>
        <div className="track-composers">
          {item.composers.join(", ") || "Composer not listed"}
        </div>
      </div>
      <div className="track-description-column">
        {item.description || "No description yet"}
      </div>
      <div className="track-features">
        <small>FEATURES</small>
        <span>
          {features.length
            ? features.map((motif, index) => (
                <Fragment key={motif.id}>
                  <span style={{ color: motif.nameColor }}>{motif.name}</span>
                  {index < features.length - 1 ? ", " : ""}
                </Fragment>
              ))
            : "No leitmotifs"}
        </span>
      </div>
      {canEdit && (
        <div className="track-row-actions">
          <EntityMenu itemType="track" onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
    </article>
  );
}

export function EntityMenu({
  itemType,
  onEdit,
  onDelete,
}: {
  itemType: "story item" | "leitmotif" | "track";
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="dropdown-wrap entity-menu"
      onClick={(event) => event.stopPropagation()}
    >
      <button className="icon-button" aria-label={`${itemType} actions`}>
        <MoreHorizontal size={18} />
      </button>
      <div className="dropdown">
        <button onClick={onEdit}>
          <Layers3 size={14} /> Edit {itemType}
        </button>
        <button className="danger" onClick={onDelete}>
          <Trash2 size={14} /> Delete {itemType}
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
            <button key={row.id} onClick={() => onClick(row)} style={{ color: row.nameColor }}>
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
