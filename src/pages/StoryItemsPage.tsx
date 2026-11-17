import { Plus, Sparkles } from "lucide-react";
import { StoryCard } from "../components/EntityCards";
import type { Soundtrack, StoryItem } from "../types";

interface StoryItemsPageProps {
  soundtrack: Soundtrack;
  canEdit: boolean;
  onOpen: (item: StoryItem) => void;
  onEdit: (item: StoryItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function StoryItemsPage({
  soundtrack,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: StoryItemsPageProps) {
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
