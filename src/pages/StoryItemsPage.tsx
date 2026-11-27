import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { StoryCard } from "../components/EntityCards";
import type { Soundtrack, StoryItem } from "../types";

interface StoryItemsPageProps {
  soundtrack: Soundtrack;
  canEdit: boolean;
  onOpen: (item: StoryItem) => void;
  onEdit: (item: StoryItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (orderedStoryItemIds: string[]) => void;
}

export default function StoryItemsPage({
  soundtrack,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
}: StoryItemsPageProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  function dropItem(event: React.DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    event.stopPropagation();
    const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
    if (!sourceId || sourceId === targetId) return;
    const orderedIds = soundtrack.storyItems.map((item) => item.id);
    const sourceIndex = orderedIds.indexOf(sourceId);
    const targetIndex = orderedIds.indexOf(targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    orderedIds.splice(sourceIndex, 1);
    orderedIds.splice(targetIndex, 0, sourceId);
    onReorder(orderedIds);
    setDraggedId(null);
    setDropTargetId(null);
  }
  if (soundtrack.storyItems.length === 0) {
    return <EmptyItemsPage type="story item" canEdit={canEdit} onAdd={onAdd} />;
  }

  return (
    <>
      {soundtrack.storyItems.map((item) => (
        <StoryCard
          key={item.id}
          item={item}
          active={soundtrack}
          canEdit={canEdit}
          onOpen={() => onOpen(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
          canReorder={canEdit}
          isDragging={draggedId === item.id}
          isDropTarget={dropTargetId === item.id && draggedId !== item.id}
          onDragStart={(event) => {
            setDraggedId(item.id);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", item.id);
          }}
          onDragOver={(event) => {
            if (!canEdit) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropTargetId(item.id);
          }}
          onDrop={(event) => dropItem(event, item.id)}
          onDragEnd={() => {
            setDraggedId(null);
            setDropTargetId(null);
          }}
        />
      ))}
    </>
  );
}

function EmptyItemsPage({
  type,
  canEdit,
  onAdd,
}: {
  type: string;
  canEdit: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sparkles size={22} />
      </div>
      <h3>Start with a first {type}</h3>
      <p>
        This is where the details and connections of your soundtrack will come
        together.
      </p>
      {canEdit && (
        <button className="button button-primary" onClick={onAdd}>
          <Plus size={16} /> Add {type}
        </button>
      )}
    </div>
  );
}
