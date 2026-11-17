import { EntityDetailContent } from "./EntityDetailContent";
import type { Soundtrack, SoundtrackEntity, Track } from "../types";

export interface TrackPageProps {
  item: Track;
  soundtrack: Soundtrack;
  canEdit: boolean;
  onBack: () => void;
  backLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (entity: SoundtrackEntity) => void;
}

export default function TrackPage({
  item,
  soundtrack,
  ...actions
}: TrackPageProps) {
  return (
    <EntityDetailContent
      entity={item}
      active={soundtrack}
      section="tracks"
      {...actions}
    />
  );
}
