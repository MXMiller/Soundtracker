import { Plus, Sparkles } from "lucide-react";
import { MotifCard } from "../components/EntityCards";
import type { Leitmotif, Soundtrack } from "../types";

interface LeitmotifsPageProps {
  soundtrack: Soundtrack;
  canEdit: boolean;
  onOpen: (item: Leitmotif) => void;
  onEdit: (item: Leitmotif) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function LeitmotifsPage({
  soundtrack,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
  onAdd,
}: LeitmotifsPageProps) {
  if (soundtrack.leitmotifs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Sparkles size={22} />
        </div>
        <h3>Start with a first leitmotif</h3>
        <p>
          This is where the details and connections of your soundtrack will come
          together.
        </p>
        {canEdit && (
          <button className="button button-primary" onClick={onAdd}>
            <Plus size={16} /> Add leitmotif
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {soundtrack.leitmotifs.map((item) => (
        <MotifCard
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
