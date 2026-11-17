import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleHelp,
  Globe2,
  Heart,
  Layers3,
  Menu,
  MoreHorizontal,
  Plus,
  Share2,
  Upload,
  X,
} from "lucide-react";
import { currentUser, demoPeople } from "./data";
import type {
  Leitmotif,
  ModalType,
  Soundtrack,
  SoundtrackEntity,
  SoundtrackSection,
  StoryItem,
  StoryType,
  Visibility,
  ViewPage,
} from "./types";
import AppPageRouter from "./pages/AppPageRouter";
import { STORE_KEY, loadData, parseMarkdown } from "./utils";

type Section = SoundtrackSection;
type Page = ViewPage;
type Modal = ModalType;
type Entity = SoundtrackEntity;
type BreadcrumbItem = {
  label: string;
  kind: string;
  target: "workspace" | "soundtrack" | "section" | "history" | "current";
  section?: Section;
  historyIndex?: number;
};
type CreatedItemNotice = {
  entity: Entity;
  soundtrackId: string;
  soundtrackName: string;
};
const uid = () => `st-${Math.random().toString(36).slice(2, 9)}`;

function App() {
  const [soundtracks, setSoundtracks] = useState<Soundtrack[]>(loadData);
  const [page, setPage] = useState<Page>("library");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("story");
  const [searches, setSearches] = useState<Record<Page, string>>(() => {
    try {
      const saved = localStorage.getItem("soundtracker-page-searches");
      if (saved)
        return {
          library: "",
          explore: "",
          favorites: "",
          shared: "",
          ...(JSON.parse(saved) as Partial<Record<Page, string>>),
        };
    } catch {
      /* Start with empty searches when saved state is invalid. */
    }
    return { library: "", explore: "", favorites: "", shared: "" };
  });
  const [modal, setModal] = useState<Modal>(null);
  const [showCreateItemPicker, setShowCreateItemPicker] = useState(false);
  const [createItemSoundtrackId, setCreateItemSoundtrackId] = useState("");
  const [entitySoundtrackId, setEntitySoundtrackId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Entity | Soundtrack | null>(null);
  const [detail, setDetail] = useState<Entity | null>(null);
  const [detailHistory, setDetailHistory] = useState<
    { entity: Entity; section: Section }[]
  >([]);
  const [toast, setToast] = useState("");
  const [createdItemNotice, setCreatedItemNotice] =
    useState<CreatedItemNotice | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("soundtracker-favorites") || "[]",
      ) as string[];
    } catch {
      return [];
    }
  });
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(
    () => localStorage.setItem(STORE_KEY, JSON.stringify(soundtracks)),
    [soundtracks],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "soundtracker-favorites",
        JSON.stringify(favoriteIds),
      ),
    [favoriteIds],
  );
  useEffect(
    () =>
      localStorage.setItem(
        "soundtracker-page-searches",
        JSON.stringify(searches),
      ),
    [searches],
  );
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!createdItemNotice) return;
    const id = window.setTimeout(() => setCreatedItemNotice(null), 8000);
    return () => clearTimeout(id);
  }, [createdItemNotice]);

  const active = soundtracks.find((item) => item.id === activeId) || null;
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Workspace", kind: "workspace", target: "workspace" },
  ];
  if (active) {
    breadcrumbItems.push({
      label: active.name,
      kind: "soundtrack",
      target: "soundtrack",
    });
    if (detail) {
      const firstSection = detailHistory[0]?.section || section;
      breadcrumbItems.push({
        label: sectionTitle(firstSection),
        kind: "context",
        target: "section",
        section: firstSection,
      });
      let previousSection = firstSection;
      detailHistory.forEach((entry, index) => {
        if (index > 0 && entry.section !== previousSection) {
          breadcrumbItems.push({
            label: sectionTitle(entry.section),
            kind: "context",
            target: "section",
            section: entry.section,
          });
        }
        breadcrumbItems.push({
          label: entry.entity.name,
          kind: "history",
          target: "history",
          historyIndex: index,
        });
        previousSection = entry.section;
      });
      if (detailHistory.length && section !== previousSection) {
        breadcrumbItems.push({
          label: sectionTitle(section),
          kind: "context",
          target: "section",
          section,
        });
      }
      breadcrumbItems.push({ label: detail.name, kind: "current", target: "current" });
    } else {
      breadcrumbItems.push({
        label: sectionTitle(section),
        kind: "context",
        target: "current",
      });
    }
  } else {
    breadcrumbItems.push({ label: navTitle(page), kind: "current", target: "current" });
  }
  const query = searches[page];
  const setQuery = (value: string) =>
    setSearches((previous) => ({ ...previous, [page]: value }));
  const mine = (item: Soundtrack) => item.ownerId === currentUser.id;
  const canEdit = (item: Soundtrack) =>
    mine(item) ||
    item.visibility === "open" ||
    item.collaborators[currentUser.id] === "edit";
  const canDelete = (item: Soundtrack) => mine(item);
  const visibleSoundtracks = useMemo(
    () =>
      soundtracks
        .filter((item) => {
          if (page === "library")
            return mine(item) || Boolean(item.collaborators[currentUser.id]);
          if (page === "favorites") return favoriteIds.includes(item.id);
          if (page === "shared")
            return Boolean(item.collaborators[currentUser.id]) && !mine(item);
          return !mine(item) && item.visibility !== "private";
        })
        .filter((item) =>
          `${item.name} ${item.composers.join(" ")} ${item.ownerName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [soundtracks, page, query, favoriteIds],
  );

  function patchActive(updater: (item: Soundtrack) => Soundtrack) {
    if (!active) return;
    setSoundtracks((all) =>
      all.map((item) =>
        item.id === active.id
          ? updater({ ...item, updatedAt: new Date().toISOString() })
          : item,
      ),
    );
  }
  function openModal(type: Modal, value: Entity | Soundtrack | null = null) {
    setEditing(value);
    setModal(type);
  }
  function showToast(message: string) {
    setCreatedItemNotice(null);
    setToast(message);
  }
  function openCreateItemPicker() {
    const editable = soundtracks.filter(canEdit);
    const preferred = active && canEdit(active) ? active.id : editable[0]?.id;
    setCreateItemSoundtrackId(preferred || "");
    setShowCreateItemPicker(true);
  }
  function startCreateItem(kind: "story" | "motif" | "track") {
    if (!createItemSoundtrackId) return;
    setEntitySoundtrackId(createItemSoundtrackId);
    setEditing(null);
    setModal(kind === "story" ? "story" : kind === "motif" ? "motif" : "track");
    setShowCreateItemPicker(false);
  }
  function saveSoundtrack(values: Partial<Soundtrack>) {
    if (editing && "ownerId" in editing) {
      setSoundtracks((all) =>
        all.map((item) =>
          item.id === editing.id
            ? { ...item, ...values, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
      showToast("Soundtrack updated");
    } else {
      const item: Soundtrack = {
        id: uid(),
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        name: values.name || "Untitled soundtrack",
        composers: values.composers || [],
        description: values.description || "",
        listeningUrl: values.listeningUrl || "",
        visibility: values.visibility || "private",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        collaborators: {},
        storyItems: [],
        leitmotifs: [],
        tracks: [],
      };
      setSoundtracks((all) => [item, ...all]);
      setActiveId(item.id);
      setSection("story");
      setPage("library");
      showToast("Your soundtrack is ready to edit");
    }
    setModal(null);
  }
  function saveEntity(
    kind: "story" | "motif" | "track",
    value: Record<string, unknown>,
  ) {
    const target = soundtracks.find(
      (item) => item.id === (entitySoundtrackId || activeId),
    );
    if (!target) return;
    const collection =
      kind === "story"
        ? "storyItems"
        : kind === "motif"
          ? "leitmotifs"
          : "tracks";
    const id = editing && "id" in editing ? editing.id : uid();
    const entity = { ...(editing || {}), ...value, id } as Entity;
    setSoundtracks((all) => all.map((item) => {
      if (item.id !== target.id) return item;
      const updated = { ...item, updatedAt: new Date().toISOString() };
      const rows = [...updated[collection]] as Entity[];
      const index = rows.findIndex((row) => row.id === id);
      if (index < 0) rows.unshift(entity);
      else rows[index] = entity;
      const next = { ...updated, [collection]: rows } as Soundtrack;
      if (kind === "story") {
        const story = entity as StoryItem;
        next.leitmotifs = next.leitmotifs.map((motif) => ({
          ...motif,
          storyItemIds: story.motifIds.includes(motif.id)
            ? Array.from(new Set([...motif.storyItemIds, story.id]))
            : motif.storyItemIds.filter((storyId) => storyId !== story.id),
        }));
      }
      if (kind === "motif") {
        const motif = entity as Leitmotif;
        next.storyItems = next.storyItems.map((story) => ({
          ...story,
          motifIds: motif.storyItemIds.includes(story.id)
            ? Array.from(new Set([...story.motifIds, motif.id]))
            : story.motifIds.filter((motifId) => motifId !== motif.id),
        }));
      }
      return next;
    }));
    setModal(null);
    setEntitySoundtrackId(null);
    if (editing) {
      showToast("Changes saved");
    } else {
      setToast("");
      setCreatedItemNotice({
        entity,
        soundtrackId: target.id,
        soundtrackName: target.name,
      });
    }
  }
  function deleteEntity(kind: Section, id: string) {
    if (!active || !window.confirm("Delete this page? This cannot be undone."))
      return;
    const collection =
      kind === "story"
        ? "storyItems"
        : kind === "motifs"
          ? "leitmotifs"
          : "tracks";
    patchActive((item) => {
      const next = {
        ...item,
        [collection]: item[collection].filter((row) => row.id !== id),
      } as Soundtrack;
      if (kind === "story") {
        next.leitmotifs = next.leitmotifs.map((m) => ({
          ...m,
          storyItemIds: m.storyItemIds.filter((x) => x !== id),
        }));
        next.tracks = next.tracks.map((t) => ({
          ...t,
          motifAppearances: t.motifAppearances.filter(
            (x) => x.leitmotifId !== id,
          ),
        }));
      }
      if (kind === "motifs") {
        next.storyItems = next.storyItems.map((s) => ({
          ...s,
          motifIds: s.motifIds.filter((x) => x !== id),
        }));
        next.leitmotifs = next.leitmotifs.map((m) => ({
          ...m,
          storyItemIds: m.storyItemIds.filter((x) => x !== id),
          derivedFromIds: m.derivedFromIds.filter((x) => x !== id),
        }));
        next.tracks = next.tracks.map((t) => ({
          ...t,
          motifAppearances: t.motifAppearances.filter(
            (x) => x.leitmotifId !== id,
          ),
        }));
      }
      if (kind === "tracks")
        next.storyItems = next.storyItems.map((s) => ({
          ...s,
          trackIds: s.trackIds.filter((x) => x !== id),
        }));
      return next;
    });
    setDetail(null);
    setDetailHistory([]);
    showToast("Page deleted");
  }
  function deleteSoundtrack(item: Soundtrack) {
    if (
      !window.confirm(
        `Delete “${item.name}” and all its pages? This cannot be undone.`,
      )
    )
      return;
    setSoundtracks((all) => all.filter((st) => st.id !== item.id));
    setActiveId(null);
    setDetail(null);
    setDetailHistory([]);
    showToast("Soundtrack deleted");
  }
  function toggleFavorite(item: Soundtrack) {
    setFavoriteIds((ids) =>
      ids.includes(item.id)
        ? ids.filter((id) => id !== item.id)
        : [...ids, item.id],
    );
    showToast(
      favoriteIds.includes(item.id)
        ? "Removed from favorites"
        : "Added to favorites",
    );
  }
  function onImportFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseMarkdown(String(reader.result));
        setSoundtracks((all) => [imported, ...all]);
        setActiveId(imported.id);
        setDetail(null);
        setDetailHistory([]);
        setPage("library");
        setSection("story");
        showToast("Imported as a new private soundtrack");
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Could not import file",
        );
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }
  function importButton() {
    fileRef.current?.click();
  }
  function editCurrentEntity(kind: Section, entity: Entity) {
    openModal(
      kind === "story" ? "story" : kind === "motifs" ? "motif" : "track",
      entity,
    );
  }

  function sectionForEntity(entity: Entity): Section {
    if ("motifAppearances" in entity) return "tracks";
    if ("storyItemIds" in entity) return "motifs";
    return "story";
  }

  function openEntity(entity: Entity) {
    setDetailHistory([]);
    setDetail(entity);
    setSection(sectionForEntity(entity));
  }

  function followEntityLink(entity: Entity) {
    if (detail) {
      setDetailHistory((history) => [...history, { entity: detail, section }]);
    } else {
      setDetailHistory([]);
    }
    setDetail(entity);
    setSection(sectionForEntity(entity));
  }

  function goBackFromEntity() {
    const previous = detailHistory[detailHistory.length - 1];
    if (!previous) {
      setDetail(null);
      setDetailHistory([]);
      return;
    }
    setDetail(previous.entity);
    setSection(previous.section);
    setDetailHistory((history) => history.slice(0, -1));
  }

  function navigateBreadcrumb(item: BreadcrumbItem) {
    if (item.target === "workspace") {
      setPage("library");
      setActiveId(null);
      setDetail(null);
      setDetailHistory([]);
      setSection("story");
      return;
    }
    if (item.target === "soundtrack") {
      setDetail(null);
      setDetailHistory([]);
      setSection("story");
      return;
    }
    if (item.target === "section" && item.section) {
      setDetail(null);
      setDetailHistory([]);
      setSection(item.section);
      return;
    }
    if (item.target === "history" && item.historyIndex !== undefined) {
      const previous = detailHistory[item.historyIndex];
      if (!previous) return;
      setDetail(previous.entity);
      setSection(previous.section);
      setDetailHistory(detailHistory.slice(0, item.historyIndex));
    }
  }

  function openCreatedItem() {
    if (!createdItemNotice) return;
    setActiveId(createdItemNotice.soundtrackId);
    setPage("library");
    setSection(sectionForEntity(createdItemNotice.entity));
    setDetail(createdItemNotice.entity);
    setDetailHistory([]);
    setCreatedItemNotice(null);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <AudioLines size={19} />
          </span>
          <span>soundtracker</span>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-create-actions">
          <button className="new-project" onClick={() => openModal("soundtrack")}>
            <Plus size={17} /> New soundtrack <span>⌘ N</span>
          </button>
          <button className="new-item-button" onClick={openCreateItemPicker}>
            <Plus size={16} /> New item
          </button>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          <button
            className={page === "library" && !active ? "selected" : ""}
            onClick={() => {
              setPage("library");
              setActiveId(null);
              setMobileNav(false);
            }}
          >
            <Layers3 size={17} /> My library{" "}
            <span className="nav-count">
              {soundtracks.filter((s) => mine(s)).length}
            </span>
          </button>
          <button
            className={page === "explore" ? "selected" : ""}
            onClick={() => {
              setPage("explore");
              setActiveId(null);
              setMobileNav(false);
            }}
          >
            <Globe2 size={17} /> Explore
          </button>
          <button
            className={page === "favorites" ? "selected" : ""}
            onClick={() => {
              setPage("favorites");
              setActiveId(null);
              setMobileNav(false);
            }}
          >
            <Heart size={17} /> Favorites
          </button>
          <button
            className={page === "shared" ? "selected" : ""}
            onClick={() => {
              setPage("shared");
              setActiveId(null);
              setMobileNav(false);
            }}
          >
            <Share2 size={17} /> Shared with me
          </button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="side-help">
          <CircleHelp size={16} />
          <span>Need a little help?</span>
          <ChevronRight size={15} />
        </div>
        <div className="account">
          <div className="avatar">JC</div>
          <div className="account-copy">
            <strong>Jamie Chen</strong>
            <span>Free workspace</span>
          </div>
          <button className="icon-button" aria-label="Account menu">
            <MoreHorizontal size={19} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            {breadcrumbItems.map((item, index) => {
              const isCurrent = index === breadcrumbItems.length - 1;
              return (
                <span className="breadcrumb-entry" key={`${item.kind}-${index}`}>
                  {index > 0 && <ChevronRight size={14} />}
                  {isCurrent ? (
                    <strong className={`breadcrumb-${item.kind}`}>{item.label}</strong>
                  ) : (
                    <button
                      className={`breadcrumb-${item.kind} breadcrumb-button`}
                      onClick={() => navigateBreadcrumb(item)}
                      title={`Go to ${item.label}`}
                    >
                      {item.label}
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <div className="top-actions">
            <button className="avatar top-avatar" title="Jamie Chen">
              JC
            </button>
          </div>
        </header>

        <AppPageRouter
          page={page}
          active={active}
          detail={detail}
          section={section}
          soundtracks={soundtracks}
          visibleSoundtracks={visibleSoundtracks}
          favoriteIds={favoriteIds}
          query={query}
          isMine={mine}
          canEdit={canEdit}
          canDelete={canDelete}
          onQueryChange={setQuery}
          onOpenSoundtrack={(item) => {
            setActiveId(item.id);
            setSection("story");
            setDetail(null);
            setDetailHistory([]);
          }}
          onFavorite={toggleFavorite}
          onCreate={() => openModal("soundtrack")}
          onImport={importButton}
          onBackToList={() => {
            setActiveId(null);
            setDetail(null);
            setDetailHistory([]);
          }}
          onBackFromEntity={goBackFromEntity}
          backLabel={detailHistory[detailHistory.length - 1]?.entity.name || active?.name || "soundtrack"}
          onToggleFavorite={toggleFavorite}
          onEditSoundtrack={(item) => openModal("soundtrack", item)}
          onShare={() => openModal("share")}
          onDeleteSoundtrack={deleteSoundtrack}
          onChangeSection={(nextSection) => {
            setSection(nextSection);
            setDetail(null);
            setDetailHistory([]);
          }}
          onOpenEntity={openEntity}
          onNavigateEntity={followEntityLink}
          onEditEntity={editCurrentEntity}
          onDeleteEntity={deleteEntity}
          onAddEntity={(entitySection) =>
            openModal(
              entitySection === "story"
                ? "story"
                : entitySection === "motifs"
                  ? "motif"
                  : "track",
            )
          }
        />
      </main>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        hidden
        onChange={(e) => onImportFile(e.target.files?.[0])}
      />
      {modal && (
        <ModalView
          modal={modal}
          editing={editing}
          active={soundtracks.find((item) => item.id === (entitySoundtrackId || activeId)) || null}
          onClose={() => {
            setModal(null);
            setEntitySoundtrackId(null);
          }}
          onSaveSoundtrack={saveSoundtrack}
          onSaveEntity={saveEntity}
          onImport={onImportFile}
          onPickImport={importButton}
          onShare={(collaborators) => {
            if (active) patchActive((item) => ({ ...item, collaborators }));
            setModal(null);
            showToast("Sharing access updated");
          }}
        />
      )}
      {showCreateItemPicker && (
        <CreateItemPicker
          soundtracks={soundtracks.filter(canEdit)}
          selectedId={createItemSoundtrackId}
          onSelect={setCreateItemSoundtrackId}
          onClose={() => setShowCreateItemPicker(false)}
          onCreate={startCreateItem}
          onCreateSoundtrack={() => {
            setShowCreateItemPicker(false);
            openModal("soundtrack");
          }}
        />
      )}
      {createdItemNotice ? (
        <div className="toast toast-action" role="status">
          <button className="toast-action-link" onClick={openCreatedItem}>
            <Check size={16} />
            <span>
              <strong>{createdItemNotice.entity.name}</strong>
              <small>Created in {createdItemNotice.soundtrackName} · Open page</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <button
            className="toast-dismiss"
            onClick={() => setCreatedItemNotice(null)}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      ) : toast ? (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export default App;

function CreateItemPicker({
  soundtracks,
  selectedId,
  onSelect,
  onClose,
  onCreate,
  onCreateSoundtrack,
}: {
  soundtracks: Soundtrack[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onCreate: (kind: "story" | "motif" | "track") => void;
  onCreateSoundtrack: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal create-item-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow muted-eyebrow">SOUNDTRACK PAGES</div>
            <h2>Create a new item</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-form">
          {soundtracks.length ? (
            <>
              <label className="field">
                <span>Soundtrack</span>
                <select value={selectedId} onChange={(event) => onSelect(event.target.value)}>
                  {soundtracks.map((soundtrack) => (
                    <option key={soundtrack.id} value={soundtrack.id}>
                      {soundtrack.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="create-item-options">
                <button onClick={() => onCreate("story")}>Story item</button>
                <button onClick={() => onCreate("motif")}>Leitmotif</button>
                <button onClick={() => onCreate("track")}>Track</button>
              </div>
            </>
          ) : (
            <>
              <p className="modal-intro">
                Create a soundtrack first, then you can add story items, leitmotifs, and tracks to it.
              </p>
              <div className="modal-footer">
                <button className="create-item-secondary" onClick={onClose}>Cancel</button>
                <button className="create-item-primary" onClick={onCreateSoundtrack}>New soundtrack</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function navTitle(page: Page) {
  return {
    library: "My library",
    explore: "Explore",
    favorites: "Favorites",
    shared: "Shared with me",
  }[page];
}

function sectionTitle(section: Section) {
  return section === "story" ? "Story items" : section === "motifs" ? "Leitmotifs" : "Tracks";
}

function ModalView({
  modal,
  editing,
  active,
  onClose,
  onSaveSoundtrack,
  onSaveEntity,
  onShare,
}: {
  modal: Exclude<Modal, null>;
  editing: Entity | Soundtrack | null;
  active: Soundtrack | null;
  onClose: () => void;
  onSaveSoundtrack: (values: Partial<Soundtrack>) => void;
  onSaveEntity: (
    kind: "story" | "motif" | "track",
    value: Record<string, unknown>,
  ) => void;
  onImport: (file?: File) => void;
  onPickImport: () => void;
  onShare: (users: Record<string, "view" | "edit">) => void;
}) {
  const soundtrackEditing =
    modal === "soundtrack" && editing && "ownerId" in editing
      ? (editing as Soundtrack)
      : null;
  const [name, setName] = useState(soundtrackEditing?.name || "");
  const [composers, setComposers] = useState(
    soundtrackEditing?.composers.join(", ") || "",
  );
  const [description, setDescription] = useState(
    soundtrackEditing?.description || "",
  );
  const [listeningUrl, setListeningUrl] = useState(
    soundtrackEditing?.listeningUrl || "",
  );
  const [visibility, setVisibility] = useState<Visibility>(
    soundtrackEditing?.visibility || "private",
  );
  const [entityName, setEntityName] = useState(
    editing && "id" in editing && !("ownerId" in editing) ? editing.name : "",
  );
  const [entityDescription, setEntityDescription] = useState(
    editing && "id" in editing && !("ownerId" in editing)
      ? editing.description
      : "",
  );
  const [entityType, setEntityType] = useState<StoryType>(
    editing && "type" in editing ? editing.type : "Character",
  );
  const [musicalKey, setMusicalKey] = useState(
    editing && "musicalKey" in editing ? editing.musicalKey : "",
  );
  const [instruments, setInstruments] = useState(
    editing && "instruments" in editing ? editing.instruments.join(", ") : "",
  );
  const [notationUrl, setNotationUrl] = useState(
    editing && "notationUrl" in editing ? editing.notationUrl : "",
  );
  const nextTrackNumber =
    (active?.tracks.reduce(
      (highest, track) => Math.max(highest, track.trackNumber ?? 0),
      0,
    ) || 0) + 1;
  const [trackNumber, setTrackNumber] = useState(
    editing && "trackNumber" in editing
      ? String(editing.trackNumber ?? "")
      : modal === "track"
        ? String(nextTrackNumber)
        : "",
  );
  const [trackComposers, setTrackComposers] = useState(
    editing && "composers" in editing && !("ownerId" in editing)
      ? editing.composers.join(", ")
      : "",
  );
  const [trackLink, setTrackLink] = useState(
    editing && "listeningUrl" in editing && !("ownerId" in editing)
      ? editing.listeningUrl
      : "",
  );
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>(
    editing && "motifIds" in editing
      ? editing.motifIds
      : editing && "motifAppearances" in editing
        ? editing.motifAppearances.map((x) => x.leitmotifId)
        : [],
  );
  const [selectedTracks, setSelectedTracks] = useState<string[]>(
    editing && "trackIds" in editing ? editing.trackIds : [],
  );
  const [selectedStories, setSelectedStories] = useState<string[]>(
    editing && "storyItemIds" in editing ? editing.storyItemIds : [],
  );
  const [derivedFrom, setDerivedFrom] = useState<string[]>(
    editing && "derivedFromIds" in editing ? editing.derivedFromIds : [],
  );
  const [appearanceTrack, setAppearanceTrack] = useState(
    editing && "motifAppearances" in editing
      ? editing.motifAppearances[0]?.appearanceInTrack || ""
      : "",
  );
  const [appearanceStory, setAppearanceStory] = useState(
    editing && "motifAppearances" in editing
      ? editing.motifAppearances[0]?.appearanceInStory || ""
      : "",
  );
  const [grantUsers, setGrantUsers] = useState<Record<string, "view" | "edit">>(
    active?.collaborators || {},
  );
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (modal === "soundtrack") {
      if (!name.trim()) {
        setError("Give your soundtrack a name first.");
        return;
      }
      onSaveSoundtrack({
        name: name.trim(),
        composers: composers
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        description,
        listeningUrl,
        visibility,
      });
      return;
    }
    if (modal === "share") {
      onShare(grantUsers);
      return;
    }
    if (modal === "import") {
      const file = fileInput.current?.files?.[0];
      if (!file) {
        setError("Choose a Soundtracker Markdown file to import.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = parseMarkdown(String(reader.result));
          onSaveSoundtrack(imported);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Could not read that file.",
          );
        }
      };
      reader.readAsText(file);
      return;
    }
    if (!entityName.trim()) {
      setError("Add a name for this page.");
      return;
    }
    if (modal === "story")
      onSaveEntity("story", {
        name: entityName.trim(),
        description: entityDescription,
        type: entityType,
        musicalKey,
        instruments: instruments
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        motifIds: selectedMotifs,
        trackIds: selectedTracks,
        imageUrl: editing && "imageUrl" in editing ? editing.imageUrl : "",
      });
    if (modal === "motif")
      onSaveEntity("motif", {
        name: entityName.trim(),
        description: entityDescription,
        notationUrl,
        storyItemIds: selectedStories,
        derivedFromIds: derivedFrom,
      });
    if (modal === "track")
      onSaveEntity("track", {
        name: entityName.trim(),
        description: entityDescription,
        trackNumber: trackNumber ? Number(trackNumber) : null,
        composers: trackComposers
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        listeningUrl: trackLink,
        motifAppearances: selectedMotifs.map((id) => ({
          leitmotifId: id,
          appearanceInTrack: appearanceTrack,
          appearanceInStory: appearanceStory,
        })),
      });
  };
  const title =
    modal === "soundtrack"
      ? soundtrackEditing
        ? "Edit soundtrack"
        : "Create a soundtrack"
      : modal === "story"
        ? editing
          ? "Edit story item"
          : "New story item"
        : modal === "motif"
          ? editing
            ? "Edit leitmotif"
            : "New leitmotif"
          : modal === "track"
            ? editing
              ? "Edit track"
              : "Add a track"
            : modal === "share"
              ? "Share this soundtrack"
              : "Import a soundtrack";
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow muted-eyebrow">
              {modal === "soundtrack"
                ? "YOUR MUSICAL WORLD"
                : modal === "share"
                  ? "INVITE COLLABORATORS"
                  : "SOUNDTRACK DETAILS"}
            </div>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="modal-form">
          {modal === "soundtrack" && (
            <>
              <Field label="Soundtrack name *">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Test Soundtrack"
                />
              </Field>
              <Field label="Composer(s)" hint="Separate names with commas">
                <input
                  value={composers}
                  onChange={(e) => setComposers(e.target.value)}
                  placeholder="Composer name"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What story does this music tell?"
                  rows={4}
                />
              </Field>
              <Field label="Listening link">
                <input
                  type="url"
                  value={listeningUrl}
                  onChange={(e) => setListeningUrl(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Visibility">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                >
                  <option value="private">
                    Private — only you and invited people
                  </option>
                  <option value="public">Public — anyone can view</option>
                  <option value="open">Open — anyone can view and edit</option>
                </select>
              </Field>
            </>
          )}
          {modal === "story" && (
            <>
              <Field label="Name *">
                <input
                  autoFocus
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Character 1"
                />
              </Field>
              <Field label="Type">
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as StoryType)}
                >
                  {["Character", "Setting", "Idea", "Other"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  value={entityDescription}
                  onChange={(e) => setEntityDescription(e.target.value)}
                  placeholder="Tell us more about this part of the story…"
                  rows={4}
                />
              </Field>
              <div className="form-row">
                <Field label="Associated key">
                  <input
                    value={musicalKey}
                    onChange={(e) => setMusicalKey(e.target.value)}
                    placeholder="e.g. D minor"
                  />
                </Field>
                <Field label="Instruments" hint="Comma separated">
                  <input
                    value={instruments}
                    onChange={(e) => setInstruments(e.target.value)}
                    placeholder="Cello, flute…"
                  />
                </Field>
              </div>
              <Field label="Associated leitmotifs">
                {active?.leitmotifs.length ? (
                  <CheckList
                    items={active.leitmotifs.map((x) => ({
                      id: x.id,
                      name: x.name,
                    }))}
                    selected={selectedMotifs}
                    onChange={setSelectedMotifs}
                  />
                ) : (
                  <p className="field-note">
                    Create a leitmotif first to link it here.
                  </p>
                )}
              </Field>
              <Field label="Associated tracks">
                {active?.tracks.length ? (
                  <CheckList
                    items={active.tracks.map((x) => ({
                      id: x.id,
                      name: x.name,
                    }))}
                    selected={selectedTracks}
                    onChange={setSelectedTracks}
                  />
                ) : (
                  <p className="field-note">
                    Create a track first to link it here.
                  </p>
                )}
              </Field>
            </>
          )}
          {modal === "motif" && (
            <>
              <Field label="Name *">
                <input
                  autoFocus
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g. Placeholder Leitmotif"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={entityDescription}
                  onChange={(e) => setEntityDescription(e.target.value)}
                  placeholder="Describe how the theme sounds or changes…"
                  rows={4}
                />
              </Field>
              <Field label="Notation link">
                <input
                  type="url"
                  value={notationUrl}
                  onChange={(e) => setNotationUrl(e.target.value)}
                  placeholder="Sheet music or MIDI URL"
                />
              </Field>
              <Field label="Associated story items">
                {active?.storyItems.length ? (
                  <CheckList
                    items={active.storyItems.map((x) => ({
                      id: x.id,
                      name: x.name,
                    }))}
                    selected={selectedStories}
                    onChange={setSelectedStories}
                  />
                ) : (
                  <p className="field-note">
                    Create a story item first to link it here.
                  </p>
                )}
              </Field>
              <Field label="References">
                {active?.leitmotifs.filter(
                  (m) => !editing || m.id !== editing.id,
                ).length ? (
                  <CheckList
                    items={active.leitmotifs
                      .filter((m) => !editing || m.id !== editing.id)
                      .map((x) => ({ id: x.id, name: x.name }))}
                    selected={derivedFrom}
                    onChange={setDerivedFrom}
                  />
                ) : (
                  <p className="field-note">
                    No other motifs to derive from yet.
                  </p>
                )}
              </Field>
            </>
          )}
          {modal === "track" && (
            <>
              <Field label="Track name *">
                <input
                  autoFocus
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Example Track"
                />
              </Field>
              <div className="form-row">
                <Field label="Track number">
                  <input
                    type="number"
                    min="1"
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    placeholder="1"
                  />
                </Field>
                <Field label="Composer(s)" hint="Comma separated">
                  <input
                    value={trackComposers}
                    onChange={(e) => setTrackComposers(e.target.value)}
                    placeholder="Composer name"
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={entityDescription}
                  onChange={(e) => setEntityDescription(e.target.value)}
                  placeholder="What happens in this track?"
                  rows={3}
                />
              </Field>
              <Field label="Listening link">
                <input
                  type="url"
                  value={trackLink}
                  onChange={(e) => setTrackLink(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <Field label="Leitmotifs in this track">
                {active?.leitmotifs.length ? (
                  <CheckList
                    items={active.leitmotifs.map((x) => ({
                      id: x.id,
                      name: x.name,
                    }))}
                    selected={selectedMotifs}
                    onChange={setSelectedMotifs}
                  />
                ) : (
                  <p className="field-note">
                    Create a leitmotif first to link it here.
                  </p>
                )}
              </Field>
              {selectedMotifs.length > 0 && (
                <div className="form-row">
                  <Field label="Where in the track?">
                    <input
                      value={appearanceTrack}
                      onChange={(e) => setAppearanceTrack(e.target.value)}
                      placeholder="e.g. 1:24, strings enter"
                    />
                  </Field>
                  <Field label="Where in the story?">
                    <input
                      value={appearanceStory}
                      onChange={(e) => setAppearanceStory(e.target.value)}
                      placeholder="e.g. Character 1 appears"
                    />
                  </Field>
                </div>
              )}
            </>
          )}
          {modal === "share" && (
            <>
              <p className="modal-intro">
                Give specific people access to your private soundtrack. Owners
                always keep full control.
              </p>
              {demoPeople.map((person, i) => {
                const key = `u-${person.split(" ")[0].toLowerCase()}`;
                return (
                  <div className="share-person" key={person}>
                    <div className={`avatar person-${i}`}>
                      {person
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </div>
                    <div>
                      <strong>{person}</strong>
                      <small>
                        {person.split(" ")[0].toLowerCase()}@example.com
                      </small>
                    </div>
                    <select
                      aria-label={`Permission for ${person}`}
                      value={grantUsers[key] || ""}
                      onChange={(e) =>
                        setGrantUsers((users) => {
                          const next = { ...users };
                          if (!e.target.value) delete next[key];
                          else next[key] = e.target.value as "view" | "edit";
                          return next;
                        })
                      }
                    >
                      <option value="">No access</option>
                      <option value="view">Can view</option>
                      <option value="edit">Can edit</option>
                    </select>
                  </div>
                );
              })}
              <p className="field-note">
                Demo access is stored locally in this browser. Real invitations
                require an account backend.
              </p>
            </>
          )}
          {modal === "import" && (
            <>
              <p className="modal-intro">
                Choose a Markdown file exported from Soundtracker. It will be
                imported as a new private soundtrack, with its internal pages
                and links preserved.
              </p>
              <input
                ref={fileInput}
                type="file"
                accept=".md,.markdown,text/markdown,text/plain"
              />
              <button
                className="button button-outline"
                type="button"
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={16} /> Choose a .md file
              </button>
              <p className="field-note">
                Imported text files contain a small structured data block so
                connections can be restored.
              </p>
            </>
          )}
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {modal === "soundtrack"
                ? "Save soundtrack"
                : modal === "share"
                  ? "Save access"
                  : modal === "import"
                    ? "Import soundtrack"
                    : editing
                      ? "Save changes"
                      : "Create page"}{" "}
              <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  );
}
function CheckList({
  items,
  selected,
  onChange,
}: {
  items: { id: string; name: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="check-list">
      {items.map((item) => (
        <label key={item.id}>
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? [...selected, item.id]
                  : selected.filter((id) => id !== item.id),
              )
            }
          />
          <span>{item.name}</span>
        </label>
      ))}
    </div>
  );
}
