import {
  ArrowLeft,
  AudioLines,
  BookOpen,
  Clock3,
  Disc3,
  ExternalLink,
  FileDown,
  Heart,
  MoreHorizontal,
  Music2,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import type { Soundtrack, SoundtrackEntity, SoundtrackSection } from "../types";
import { niceDate, exportMarkdown } from "../utils";
import StoryItemsPage from "./StoryItemsPage";
import LeitmotifsPage from "./LeitmotifsPage";
import TracksPage from "./TracksPage";

interface SoundtrackPageProps {
  soundtrack: Soundtrack;
  section: SoundtrackSection;
  canEdit: boolean;
  canDelete: boolean;
  isFavorite: boolean;
  onBack: () => void;
  backLabel: string;
  onToggleFavorite: () => void;
  onEditSoundtrack: () => void;
  onShare: () => void;
  onDeleteSoundtrack: () => void;
  onChangeSection: (section: SoundtrackSection) => void;
  onOpenEntity: (entity: SoundtrackEntity) => void;
  onEditEntity: (section: SoundtrackSection, entity: SoundtrackEntity) => void;
  onDeleteEntity: (section: SoundtrackSection, id: string) => void;
  onAddEntity: (section: SoundtrackSection) => void;
}

const sectionHeading: Record<
  SoundtrackSection,
  { eyebrow: string; title: string; description: string; addLabel: string }
> = {
  story: {
    eyebrow: "THE WORLD BEHIND THE MUSIC",
    title: "Story & characters",
    description:
      "Explore the people, places, and ideas that give this music meaning.",
    addLabel: "story item",
  },
  motifs: {
    eyebrow: "RECURRING MUSICAL IDEAS",
    title: "Leitmotifs",
    description: "Themes that transform, return, and connect the story.",
    addLabel: "leitmotif",
  },
  tracks: {
    eyebrow: "THE SOUNDTRACK, TRACK BY TRACK",
    title: "Tracklist",
    description: "Follow each track and discover the themes woven through it.",
    addLabel: "track",
  },
};

export default function SoundtrackPage({
  soundtrack,
  section,
  canEdit,
  canDelete,
  isFavorite,
  onBack,
  backLabel,
  onToggleFavorite,
  onEditSoundtrack,
  onShare,
  onDeleteSoundtrack,
  onChangeSection,
  onOpenEntity,
  onEditEntity,
  onDeleteEntity,
  onAddEntity,
}: SoundtrackPageProps) {
  const heading = sectionHeading[section];

  return (
    <div className="content soundtrack-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} /> Back to {backLabel}
      </button>

      <section className="soundtrack-hero">
        <div className="hero-art">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="hero-lines" />
          <AudioLines size={37} />
          <span>SOUNDTRACK STUDY</span>
        </div>
        <div className="hero-info">
          <div className="eyebrow">
            <span className={`visibility-dot ${soundtrack.visibility}`} />
            {soundtrack.visibility} soundtrack{" "}
            <span className="separator">·</span> by {soundtrack.ownerName}
          </div>
          <h1 style={{ color: soundtrack.nameColor }}>{soundtrack.name}</h1>
          <div className="hero-composers">
            Original music by{" "}
            {soundtrack.composers.join(", ") || "Unknown composer"}
          </div>
          <p>
            {soundtrack.description ||
              "A collection of musical themes, characters, and places."}
          </p>
          <div className="hero-meta">
            <span>
              <Clock3 size={14} /> Updated {niceDate(soundtrack.updatedAt)}
            </span>
            <span>
              <Music2 size={14} /> {soundtrack.tracks.length} tracks
            </span>
            <span>
              <BookOpen size={14} /> {soundtrack.storyItems.length} story items
            </span>
          </div>
        </div>
        <div className="hero-menu">
          <button
            className={`icon-button heart-button ${isFavorite ? "is-favorite" : ""}`}
            onClick={onToggleFavorite}
            aria-label="Toggle favorite"
          >
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          {canEdit && (
            <button
              className="button button-outline"
              onClick={onEditSoundtrack}
            >
              Edit details
            </button>
          )}
          <div className="dropdown-wrap">
            <button
              className="icon-button"
              aria-label="More soundtrack actions"
            >
              <MoreHorizontal size={21} />
            </button>
            <div className="dropdown">
              <button onClick={() => exportMarkdown(soundtrack)}>
                <FileDown size={15} /> Export Markdown
              </button>
              {canEdit && (
                <button onClick={onShare}>
                  <Share2 size={15} /> Share access
                </button>
              )}
              {canDelete && (
                <button className="danger" onClick={onDeleteSoundtrack}>
                  <Trash2 size={15} /> Delete soundtrack
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {soundtrack.listeningUrl && (
        <a
          className="listen-link"
          href={soundtrack.listeningUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={15} /> Listen to the full soundtrack
        </a>
      )}

      <div className="workspace-tabs">
        <button
          className={section === "story" ? "active" : ""}
          onClick={() => onChangeSection("story")}
        >
          <BookOpen size={16} /> Story view{" "}
          <span>{soundtrack.storyItems.length}</span>
        </button>
        <button
          className={section === "motifs" ? "active" : ""}
          onClick={() => onChangeSection("motifs")}
        >
          <AudioLines size={16} /> Leitmotifs{" "}
          <span>{soundtrack.leitmotifs.length}</span>
        </button>
        <button
          className={section === "tracks" ? "active" : ""}
          onClick={() => onChangeSection("tracks")}
        >
          <Disc3 size={16} /> Tracklist <span>{soundtrack.tracks.length}</span>
        </button>
      </div>

      <div className="section-heading">
        <div>
          <div className="eyebrow muted-eyebrow">{heading.eyebrow}</div>
          <h2>{heading.title}</h2>
          <p>{heading.description}</p>
        </div>
        {canEdit && (
          <button
            className="button button-primary"
            onClick={() => onAddEntity(section)}
          >
            <Plus size={16} /> Add {heading.addLabel}
          </button>
        )}
      </div>

      <section className="entity-grid">
        {section === "story" && (
          <StoryItemsPage
            soundtrack={soundtrack}
            canEdit={canEdit}
            onOpen={onOpenEntity}
            onEdit={(entity) => onEditEntity("story", entity)}
            onDelete={(id) => onDeleteEntity("story", id)}
            onAdd={() => onAddEntity("story")}
          />
        )}
        {section === "motifs" && (
          <LeitmotifsPage
            soundtrack={soundtrack}
            canEdit={canEdit}
            onOpen={onOpenEntity}
            onEdit={(entity) => onEditEntity("motifs", entity)}
            onDelete={(id) => onDeleteEntity("motifs", id)}
            onAdd={() => onAddEntity("motifs")}
          />
        )}
        {section === "tracks" && (
          <TracksPage
            soundtrack={soundtrack}
            canEdit={canEdit}
            onOpen={onOpenEntity}
            onEdit={(entity) => onEditEntity("tracks", entity)}
            onDelete={(id) => onDeleteEntity("tracks", id)}
            onAdd={() => onAddEntity("tracks")}
          />
        )}
      </section>

      <footer className="page-footer">
        Soundtracker <span>·</span> Keep the music connected to the story.
      </footer>
    </div>
  );
}
