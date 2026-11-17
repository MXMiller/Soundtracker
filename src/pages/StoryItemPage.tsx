import { EntityDetailContent } from "./EntityDetailContent";
import type { Soundtrack, StoryItem, SoundtrackEntity } from "../types";

export interface StoryItemPageProps {
  item: StoryItem;
  soundtrack: Soundtrack;
  canEdit: boolean;
  onBack: () => void;
  backLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (entity: SoundtrackEntity) => void;
}

export default function StoryItemPage({
  item,
  soundtrack,
  ...actions
}: StoryItemPageProps) {
  return (
    <EntityDetailContent
      entity={item}
      active={soundtrack}
      section="story"
      {...actions}
    />
  );
}
