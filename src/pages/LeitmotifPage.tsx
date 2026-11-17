import { EntityDetailContent } from "./EntityDetailContent";
import type { Leitmotif, Soundtrack, SoundtrackEntity } from "../types";

export interface LeitmotifPageProps {
  item: Leitmotif;
  soundtrack: Soundtrack;
  canEdit: boolean;
  onBack: () => void;
  backLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (entity: SoundtrackEntity) => void;
}

export default function LeitmotifPage({
  item,
  soundtrack,
  ...actions
}: LeitmotifPageProps) {
  return (
    <EntityDetailContent
      entity={item}
      active={soundtrack}
      section="motifs"
      {...actions}
    />
  );
}
