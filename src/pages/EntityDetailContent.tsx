import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Disc3,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  Soundtrack,
  SoundtrackEntity,
  SoundtrackSection,
  StoryItem,
  Leitmotif,
  Track,
} from "../types";
import { InfoBlock, RelatedBlock } from "../components/EntityCards";
import { getTrackMotifAppearances } from "../utils";
type Entity = SoundtrackEntity;
type Section = SoundtrackSection;

export function EntityDetailContent({
  entity,
  active,
  section,
  canEdit,
  onBack,
  backLabel,
  backLabelColor,
  onEdit,
  onDelete,
  onNavigate,
  onEditTrackMotif,
}: {
  entity: Entity;
  active: Soundtrack;
  section: Section;
  canEdit: boolean;
  onBack: () => void;
  backLabel: string;
  backLabelColor?: string;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (entity: Entity) => void;
  onEditTrackMotif?: (motifId: string) => void;
}) {
  const isStory = section === "story",
    isMotif = section === "motifs";
  const relatedMotifs = isStory
    ? (entity as StoryItem).motifIds
        .map((id) => active.leitmotifs.find((m) => m.id === id))
        .filter(Boolean)
    : [];
  const relatedItems = isMotif
    ? (entity as Leitmotif).storyItemIds
        .map((id) => active.storyItems.find((m) => m.id === id))
        .filter(Boolean)
    : [];
  const appearances = isMotif
    ? active.tracks.flatMap((track) =>
        track.motifAppearances
          .filter((a) => a.leitmotifId === entity.id)
          .flatMap((association) =>
            getTrackMotifAppearances(association).map((appearance) => ({
              track,
              a: appearance,
            })),
          ),
      )
    : [];
  const pageType = isStory
    ? (entity as StoryItem).type.toUpperCase()
    : isMotif
      ? "LEITMOTIF"
      : "TRACK";
  const linkedTracks = isStory
    ? ((entity as StoryItem).trackIds
        .map((id) => active.tracks.find((t) => t.id === id))
        .filter(Boolean) as Track[])
    : [];
  const linkedParents = isMotif
    ? ((entity as Leitmotif).derivedFromIds
        .map((id) => active.leitmotifs.find((m) => m.id === id))
        .filter(Boolean) as Leitmotif[])
    : [];
  const linkedChildren = isMotif
    ? active.leitmotifs.filter((motif) =>
        motif.derivedFromIds.includes(entity.id),
      )
    : [];
  return (
    <div className="content entity-page">
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={15} /> Back to <span style={{ color: backLabelColor }}>{backLabel}</span>
      </button>
      <section className="entity-page-hero">
        <div
          className={`detail-banner ${isStory ? "detail-story" : isMotif ? "detail-motif" : "detail-track"}`}
        >
          {isStory ? (
            <span>{entity.name.slice(0, 1)}</span>
          ) : isMotif ? (
            <AudioLines size={34} />
          ) : (
            <Disc3 size={34} />
          )}
        </div>
        <div className="entity-page-intro">
          <div className="eyebrow muted-eyebrow">
            {pageType} <span className="separator">·</span> <span style={{ color: active.nameColor }}>{active.name}</span>
          </div>
          <h1 style={{ color: entity.nameColor }}>{entity.name}</h1>
          <p>{entity.description || "No description added yet."}</p>
        </div>
        {canEdit && (
          <div className="entity-page-actions">
            <button className="button button-outline" onClick={onEdit}>
              Edit page
            </button>
            <button
              className="icon-button"
              onClick={onDelete}
              aria-label="Delete page"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </section>
      <div className="entity-page-body">
        <section className="entity-info-section">
          <div className="eyebrow muted-eyebrow">PAGE DETAILS</div>
          <h2>
            About this{" "}
            {isStory ? "story item" : isMotif ? "leitmotif" : "track"}
          </h2>
          {isStory && (
            <div className="entity-facts">
              {(entity as StoryItem).musicalKey && (
                <InfoBlock
                  label="Associated key"
                  value={(entity as StoryItem).musicalKey}
                />
              )}
              {(entity as StoryItem).instruments.length > 0 && (
                <InfoBlock
                  label="Associated Instruments"
                  value={(entity as StoryItem).instruments.join(" · ")}
                />
              )}
            </div>
          )}
          {isMotif && (entity as Leitmotif).notationUrl && (
            <a
              className="external-resource"
              href={(entity as Leitmotif).notationUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={15} /> Open notation resource
            </a>
          )}
          {!isStory && !isMotif && (
            <>
              {(entity as Track).composers.length > 0 && (
                <InfoBlock
                  label="Composer(s)"
                  value={(entity as Track).composers.join(", ")}
                />
              )}
              {(entity as Track).trackNumber && (
                <InfoBlock
                  label="Track number"
                  value={String((entity as Track).trackNumber)}
                />
              )}
              {(entity as Track).listeningUrl && (
                <a
                  className="external-resource"
                  href={(entity as Track).listeningUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} /> Open listening link
                </a>
              )}
            </>
          )}
        </section>
        {isStory && (
          <div className="entity-page-links">
            <RelatedBlock
              title="Associated leitmotifs"
              empty="No leitmotifs linked yet"
              rows={relatedMotifs as Leitmotif[]}
              icon={<AudioLines size={15} />}
              onClick={onNavigate}
            />
            <RelatedBlock
              title="Associated tracks"
              empty="No tracks linked yet"
              rows={linkedTracks}
              icon={<Disc3 size={15} />}
              onClick={onNavigate}
            />
          </div>
        )}
        {isMotif && (
          <div className="entity-page-links">
            <RelatedBlock
              title="Connected story items"
              empty="No story items linked yet"
              rows={relatedItems as StoryItem[]}
              icon={<BookOpen size={15} />}
              onClick={onNavigate}
            />
            <RelatedBlock
              title="References"
              empty="This motif is an original theme"
              rows={linkedParents}
              icon={<ArrowRight size={15} />}
              onClick={onNavigate}
            />
            <RelatedBlock
              title="Referenced by"
              empty="No other leitmotifs are derived from this one yet"
              rows={linkedChildren}
              icon={<ArrowRight size={15} />}
              onClick={onNavigate}
            />
            <RelatedBlock
              title="Appears in tracks"
              empty="Not associated with any tracks yet"
              rows={appearances.map((item) => item.track)}
              icon={<Disc3 size={15} />}
              onClick={onNavigate}
            />
            {appearances.map(({ track, a }) => (
              <div className="appearance-row" key={track.id}>
                <strong>
                  {track.trackNumber ? `${track.trackNumber}. ` : ""}
                  <span style={{ color: track.nameColor }}>{track.name}</span>
                </strong>
                <span>
                  {a.appearanceInTrack}
                  {a.appearanceInStory
                    ? `${a.appearanceInTrack ? " · " : ""}${a.appearanceInStory}`
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
        {!isStory && !isMotif && (
          <div className="entity-page-links">
            <div className="related-block track-motif-connections">
              <h4>Leitmotifs in this track</h4>
              {(entity as Track).motifAppearances.length ? (
                <div className="track-connection-list">
                  {(entity as Track).motifAppearances.map((association) => {
                    const motif = active.leitmotifs.find(
                      (item) => item.id === association.leitmotifId,
                    );
                    if (!motif) return null;

                    return (
                      <div
                        className="track-connection"
                        key={association.leitmotifId}
                      >
                        <button
                          className="track-connection-link"
                          onClick={() => onNavigate(motif)}
                        >
                          <AudioLines size={15} />
                          <span style={{ color: motif.nameColor }}>{motif.name}</span>
                          <ArrowRight size={13} />
                        </button>
                        {getTrackMotifAppearances(association).map((appearance) => {
                          const description = [
                            appearance.appearanceInTrack,
                            appearance.appearanceInStory,
                          ]
                            .filter(Boolean)
                            .join(" · ");
                          return description ? (
                            <p
                              className="track-connection-description"
                              key={appearance.id}
                            >
                              {description}
                            </p>
                          ) : null;
                        })}
                        {canEdit && onEditTrackMotif && (
                          <button
                            className="appearance-edit-button"
                            onClick={() =>
                              onEditTrackMotif(association.leitmotifId)
                            }
                          >
                            <Pencil size={13} /> Edit appearances
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="detail-empty">No leitmotifs listed yet</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
