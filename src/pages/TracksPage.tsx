import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { TrackCard } from "../components/EntityCards";
import type { Soundtrack, Track } from "../types";

interface TracksPageProps {
  soundtrack: Soundtrack;
  canEdit: boolean;
  onOpen: (item: Track) => void;
  onEdit: (item: Track) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (orderedTrackIds: string[]) => void;
}

export default function TracksPage({
  soundtrack,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
}: TracksPageProps) {
  const [draggedTrackId, setDraggedTrackId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const sortedTracks = [...soundtrack.tracks].sort((first, second) => {
    if (first.trackNumber === null) return second.trackNumber === null ? 0 : 1;
    if (second.trackNumber === null) return -1;
    return first.trackNumber - second.trackNumber;
  });

  function dropTrack(event: React.DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = event.dataTransfer.getData("text/plain") || draggedTrackId;
    if (!sourceId || sourceId === targetId) return;
    const ids = sortedTracks.map((track) => track.id);
    const sourceIndex = ids.indexOf(sourceId);
    const targetIndex = ids.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    ids.splice(sourceIndex, 1);
    ids.splice(targetIndex, 0, sourceId);
    onReorder(ids);
    setDraggedTrackId(null);
    setDropTargetId(null);
  }

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
          onDragStart={(event) => {
            setDraggedTrackId(item.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
          }}
          onDragOver={(event) => {
            if (!canEdit) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropTargetId(item.id);
          }}
          onDrop={(event) => dropTrack(event, item.id)}
          onDragEnd={() => {
            setDraggedTrackId(null);
            setDropTargetId(null);
          }}
          isDragging={draggedTrackId === item.id}
          isDropTarget={dropTargetId === item.id && draggedTrackId !== item.id}
        />
      ))}
    </>
  );
}
