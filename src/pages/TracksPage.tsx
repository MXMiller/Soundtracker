import { Plus, Sparkles } from "lucide-react";
import { TrackCard } from "../components/EntityCards";
import type { Soundtrack, Track } from "../types";

interface TracksPageProps {
  soundtrack: Soundtrack;
  canEdit: boolean;
  onOpen: (item: Track) => void;
  onEdit: (item: Track) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function TracksPage({
  soundtrack,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: TracksPageProps) {
  const sortedTracks = [...soundtrack.tracks].sort((first, second) => {
    if (first.trackNumber === null) return second.trackNumber === null ? 0 : 1;
    if (second.trackNumber === null) return -1;
    return first.trackNumber - second.trackNumber;
  });

  if (soundtrack.tracks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Sparkles size={22} />
        </div>
        <h3>Start with a first track</h3>
        <p>
          This is where the details and connections of your soundtrack will come
          together.
        </p>
        {canEdit && (
          <button className="button button-primary" onClick={onAdd}>
            <Plus size={16} /> Add track
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {sortedTracks.map((item) => (
        <TrackCard
          key={item.id}
          item={item}
          active={soundtrack}
          canEdit={canEdit}
          onOpen={() => onOpen(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </>
  );
}
