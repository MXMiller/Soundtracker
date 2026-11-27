import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleHelp,
  Globe2,
  Heart,
  Layers3,
  LogOut,
  Menu,
  Plus,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type {
  Leitmotif,
  ModalType,
  Soundtrack,
  SoundtrackEntity,
  SoundtrackSection,
  StoryItem,
  StoryType,
  Track,
  TrackMotifAppearance,
  Visibility,
  ViewPage,
} from "./types";
import AppPageRouter from "./pages/AppPageRouter";
import {
  getTrackMotifAppearances,
  parseMarkdown,
} from "./utils";
import AuthPage, { type AuthCredentials } from "./components/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { supabase } from "./lib/supabase";
import type { UserProfile } from "./types/supabase";
import type { Session } from "@supabase/supabase-js";

type Section = SoundtrackSection;
type Page = ViewPage;
type Modal = ModalType;
type Entity = SoundtrackEntity;
type BreadcrumbItem = {
  label: string;
  nameColor?: string;
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
  const [soundtracks, setSoundtracks] = useState<Soundtrack[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [profileViewId, setProfileViewId] = useState<string | null>(null);
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
  const [appearanceEditor, setAppearanceEditor] = useState<{
    trackId: string;
    motifId: string;
  } | null>(null);
  const [detailHistory, setDetailHistory] = useState<
    { entity: Entity; section: Section }[]
  >([]);
  const [toast, setToast] = useState("");
  const [createdItemNotice, setCreatedItemNotice] =
    useState<CreatedItemNotice | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setAuthReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      setProfileViewId(null);
    });
    return () => { cancelled = true; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setSoundtracks([]);
      setProfiles([]);
      setFavoriteIds([]);
      setDataReady(false);
      return;
    }
    let cancelled = false;
    const userId = session.user.id;
    setDataReady(false);
    Promise.all([
      supabase.from("soundtracker_soundtrack_documents").select("id, owner_id, owner_name, name, visibility, payload, updated_at"),
      supabase.from("public_profiles").select("id, username, description, profile_image_file_path"),
      supabase.from("soundtracker_favorites").select("soundtrack_id").eq("user_id", userId),
      supabase.from("profiles").select("id, username, description, profile_image_file_path").eq("id", userId).maybeSingle(),
      supabase.from("soundtracker_document_access").select("soundtrack_id, user_id, permission"),
    ]).then(([docsResult, profilesResult, favoritesResult, ownProfileResult, accessResult]) => {
      if (cancelled) return;
      if (docsResult.error) setAuthMessage(`Could not load soundtrack data: ${docsResult.error.message}`);
      const loadedProfiles = (profilesResult.data || []) as UserProfile[];
      if (ownProfileResult.data && !loadedProfiles.some((profile) => profile.id === userId)) {
        loadedProfiles.push(ownProfileResult.data as UserProfile);
      }
      setProfiles(loadedProfiles);
      const profileNames = new Map(loadedProfiles.map((profile) => [profile.id, profile.username]));
      const accessBySoundtrack = new Map<string, Record<string, "view" | "edit">>();
      (accessResult.data || []).forEach((grant) => {
        const access = accessBySoundtrack.get(grant.soundtrack_id) || {};
        access[grant.user_id] = grant.permission;
        accessBySoundtrack.set(grant.soundtrack_id, access);
      });
      setSoundtracks(((docsResult.data || []) as Array<{ id: string; owner_id: string; owner_name: string; name: string; visibility: Soundtrack["visibility"]; payload: Soundtrack; updated_at: string }>).map((row) => ({
        ...row.payload,
        id: row.id,
        ownerId: row.owner_id,
        ownerName: profileNames.get(row.owner_id) || row.owner_name,
        name: row.name,
        visibility: row.visibility,
        updatedAt: row.updated_at,
        collaborators: accessBySoundtrack.get(row.id) || {},
      })));
      if (favoritesResult.error) setAuthMessage(`Could not load favorites: ${favoritesResult.error.message}`);
      setFavoriteIds((favoritesResult.data || []).map((row) => row.soundtrack_id));
      setDataReady(true);
    }).catch((error: unknown) => {
      if (!cancelled) {
        setAuthMessage(error instanceof Error ? error.message : "Could not connect to Supabase.");
        setDataReady(true);
      }
    });
    return () => { cancelled = true; };
  }, [session?.user.id]);

  useEffect(() => {
    if (!session?.user.id || !dataReady) return;
    const rows = soundtracks.map((item) => ({
      id: item.id,
      owner_id: item.ownerId,
      owner_name: item.ownerName,
      name: item.name,
      visibility: item.visibility,
      payload: item,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    }));
    if (rows.length) supabase.from("soundtracker_soundtrack_documents").upsert(rows).then(({ error }) => {
      if (error) setAuthMessage(`Could not save soundtrack changes: ${error.message}`);
    });
  }, [soundtracks, session?.user.id, dataReady]);
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

  const currentUser = {
    id: session?.user.id || "",
    name: profiles.find((profile) => profile.id === session?.user.id)?.username
      || String(session?.user.user_metadata.username || session?.user.email?.split("@")[0] || "Soundtracker user"),
  };
  const viewedProfile = profiles.find((profile) => profile.id === profileViewId) || null;
  const active = soundtracks.find((item) => item.id === activeId) || null;
  const appearanceTrack = appearanceEditor
    ? soundtracks
        .find((item) =>
          item.tracks.some((track) => track.id === appearanceEditor.trackId),
        )
        ?.tracks.find((track) => track.id === appearanceEditor.trackId)
    : undefined;
  const appearanceSoundtrack = appearanceEditor
    ? soundtracks.find((item) =>
        item.tracks.some((track) => track.id === appearanceEditor.trackId),
      )
    : undefined;
  const appearanceMotif = appearanceSoundtrack?.leitmotifs.find(
    (motif) => motif.id === appearanceEditor?.motifId,
  );
  const appearanceConnection = appearanceTrack?.motifAppearances.find(
    (appearance) => appearance.leitmotifId === appearanceEditor?.motifId,
  );
  const appearanceValues = appearanceConnection
    ? getTrackMotifAppearances(appearanceConnection)
    : [];
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Workspace", kind: "workspace", target: "workspace" },
  ];
  if (active) {
    breadcrumbItems.push({
      label: active.name,
      nameColor: active.nameColor,
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
          nameColor: entry.entity.nameColor,
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
      breadcrumbItems.push({ label: detail.name, nameColor: detail.nameColor, kind: "current", target: "current" });
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
        nameColor: values.nameColor,
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
      if (detail?.id === entity.id) setDetail(entity);
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
  function saveTrackMotifAppearance(
    trackId: string,
    motifId: string,
    appearances: TrackMotifAppearance[],
  ) {
    const soundtrack = soundtracks.find((item) =>
      item.tracks.some((track) => track.id === trackId),
    );
    const track = soundtrack?.tracks.find((item) => item.id === trackId);
    if (!soundtrack || !track) return;

    const updatedTrack: Track = {
      ...track,
      motifAppearances: track.motifAppearances.map((appearance) =>
        appearance.leitmotifId === motifId
          ? { leitmotifId: motifId, appearances }
          : appearance,
      ),
    };
    setSoundtracks((all) =>
      all.map((item) =>
        item.id === soundtrack.id
          ? {
              ...item,
              updatedAt: new Date().toISOString(),
              tracks: item.tracks.map((current) =>
                current.id === trackId ? updatedTrack : current,
              ),
            }
          : item,
      ),
    );
    setDetail((current) =>
      current && "motifAppearances" in current && current.id === trackId
        ? updatedTrack
        : current,
    );
    setAppearanceEditor(null);
    showToast("Leitmotif details saved");
  }
  function deleteEntity(kind: Section, id: string) {
    if (!active || !window.confirm("Are you sure you want to delete this item? This cannot be undone."))
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
    showToast("Item deleted");
  }
  function deleteSoundtrack(item: Soundtrack) {
    if (
      !window.confirm(
        `Delete “${item.name}” and all its pages? This cannot be undone.`,
      )
    )
      return;
    setSoundtracks((all) => all.filter((st) => st.id !== item.id));
    supabase.from("soundtracker_soundtrack_documents").delete().eq("id", item.id).then(({ error }) => {
      if (error) setAuthMessage(`Could not delete soundtrack: ${error.message}`);
    });
    setActiveId(null);
    setDetail(null);
    setDetailHistory([]);
    showToast("Soundtrack deleted");
  }
  async function toggleFavorite(item: Soundtrack) {
    const wasFavorite = favoriteIds.includes(item.id);
    const result = wasFavorite
      ? await supabase.from("soundtracker_favorites").delete().eq("user_id", currentUser.id).eq("soundtrack_id", item.id)
      : await supabase.from("soundtracker_favorites").upsert({ user_id: currentUser.id, soundtrack_id: item.id });
    if (result.error) {
      setAuthMessage(`Could not update favorites: ${result.error.message}`);
      return;
    }
    setFavoriteIds((ids) => wasFavorite ? ids.filter((id) => id !== item.id) : [...ids, item.id]);
    showToast(
      wasFavorite
        ? "Removed from favorites"
        : "Added to favorites",
    );
  }
  function onImportFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = { ...parseMarkdown(String(reader.result)), ownerId: currentUser.id, ownerName: currentUser.name };
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

  async function signIn(values: AuthCredentials) {
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    return error?.message || null;
  }

  async function signUp(values: AuthCredentials) {
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { username: values.username?.trim() } },
    });
    return error?.message || null;
  }

  async function saveProfile(values: { username: string; description: string }) {
    const { data, error } = await supabase.from("profiles")
      .update({ username: values.username.trim(), description: values.description.trim() || null })
      .eq("id", currentUser.id)
      .select("id, username, description, profile_image_file_path")
      .single();
    if (error) {
      setAuthMessage(`Could not save profile: ${error.message}`);
      throw error;
    }
    setProfiles((all) => all.map((profile) => profile.id === currentUser.id ? data as UserProfile : profile));
    setSoundtracks((all) => all.map((item) => item.ownerId === currentUser.id ? { ...item, ownerName: values.username.trim() } : item));
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

  if (!authReady) return <div className="auth-screen"><div className="auth-card">Connecting to Soundtracker…</div></div>;
  if (!session) return <AuthPage onSignIn={signIn} onSignUp={signUp} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <AudioLines size={19} />
          </span>
          <span>Soundtracker</span>
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
          <button className="account-profile" onClick={() => setProfileViewId(currentUser.id)}>
            <div className="avatar">{currentUser.name.slice(0, 2).toUpperCase()}</div>
            <span className="account-copy">
              <strong>{currentUser.name}</strong>
              <span>View profile</span>
            </span>
          </button>
          <button className="icon-button" aria-label="Log out" title="Log out" onClick={() => supabase.auth.signOut()}>
            <LogOut size={17} />
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
                    <strong className={`breadcrumb-${item.kind}`} style={{ color: item.nameColor }}>{item.label}</strong>
                  ) : (
                    <button
                      className={`breadcrumb-${item.kind} breadcrumb-button`}
                      style={{ color: item.nameColor }}
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
            <button className="avatar top-avatar" title="View profile" onClick={() => setProfileViewId(currentUser.id)}>
              {currentUser.name.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        {profileViewId && viewedProfile ? (
          <ProfilePage
            profile={viewedProfile}
            isOwnProfile={profileViewId === currentUser.id}
            soundtracks={soundtracks.filter((item) => item.ownerId === profileViewId && (profileViewId === currentUser.id || item.visibility !== "private"))}
            onBack={() => setProfileViewId(null)}
            onSave={saveProfile}
            onOpenSoundtrack={(item) => {
              setProfileViewId(null);
              setActiveId(item.id);
              setPage("explore");
              setSection("story");
              setDetail(null);
            }}
            onFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
          />
        ) : <AppPageRouter
          page={page}
          currentUserId={currentUser.id}
          onOpenProfile={(userId) => { setProfileViewId(userId); setActiveId(null); setDetail(null); }}
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
            setProfileViewId(null);
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
          backLabelColor={detailHistory[detailHistory.length - 1]?.entity.nameColor || active?.nameColor}
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
          onEditTrackMotif={(motifId) => {
            if (detail && "motifAppearances" in detail) {
              setAppearanceEditor({ trackId: detail.id, motifId });
            }
          }}
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
        />}
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
          profiles={profiles.filter((profile) => profile.id !== currentUser.id)}
          onImport={onImportFile}
          onPickImport={importButton}
          onShare={async (collaborators) => {
            if (!active) return;
            const existing = Object.keys(active.collaborators || {});
            const nextIds = Object.keys(collaborators);
            const removals = existing.filter((id) => !nextIds.includes(id));
            const updates = nextIds.map((userId) => ({ soundtrack_id: active.id, user_id: userId, permission: collaborators[userId], granted_by: currentUser.id }));
            const removed = removals.length
              ? await supabase.from("soundtracker_document_access").delete().eq("soundtrack_id", active.id).in("user_id", removals)
              : { error: null };
            const saved = updates.length
              ? await supabase.from("soundtracker_document_access").upsert(updates)
              : { error: null };
            if (removed.error || saved.error) {
              setAuthMessage(`Could not update sharing access: ${(removed.error || saved.error)?.message}`);
              return;
            }
            patchActive((item) => ({ ...item, collaborators }));
            setModal(null);
            showToast("Sharing access updated");
          }}
        />
      )}
      {appearanceEditor && appearanceTrack && appearanceMotif && (
        <TrackMotifAppearanceEditor
          trackName={appearanceTrack.name}
          trackNameColor={appearanceTrack.nameColor}
          motifName={appearanceMotif.name}
          motifNameColor={appearanceMotif.nameColor}
          initialAppearances={appearanceValues}
          onClose={() => setAppearanceEditor(null)}
          onSave={(values) =>
            saveTrackMotifAppearance(
              appearanceEditor.trackId,
              appearanceEditor.motifId,
              values,
            )
          }
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
              <strong style={{ color: createdItemNotice.entity.nameColor }}>{createdItemNotice.entity.name}</strong>
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
      {authMessage && <button className="toast auth-toast" onClick={() => setAuthMessage("")}>{authMessage}<X size={14} /></button>}
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
                    <option key={soundtrack.id} value={soundtrack.id} style={{ color: soundtrack.nameColor }}>
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
  profiles,
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
  profiles: UserProfile[];
}) {
  const soundtrackEditing =
    modal === "soundtrack" && editing && "ownerId" in editing
      ? (editing as Soundtrack)
      : null;
  const [name, setName] = useState(soundtrackEditing?.name || "");
  const [nameColor, setNameColor] = useState(
    (editing && "nameColor" in editing ? editing.nameColor : "") || "",
  );
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
        nameColor: nameColor || undefined,
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
        nameColor: nameColor || undefined,
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
        nameColor: nameColor || undefined,
        description: entityDescription,
        notationUrl,
        storyItemIds: selectedStories,
        derivedFromIds: derivedFrom,
      });
    if (modal === "track")
      onSaveEntity("track", {
        name: entityName.trim(),
        nameColor: nameColor || undefined,
        description: entityDescription,
        trackNumber: trackNumber ? Number(trackNumber) : null,
        composers: trackComposers
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        listeningUrl: trackLink,
        motifAppearances: selectedMotifs.map((id) => {
          const existing =
            editing && "motifAppearances" in editing
              ? editing.motifAppearances.find(
                  (appearance) => appearance.leitmotifId === id,
                )
              : undefined;
          return (
            existing || {
              leitmotifId: id,
              appearances: [],
            }
          );
        }),
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
              <Field label="Name color">
                <input type="color" value={nameColor || "#222222"} onChange={(e) => setNameColor(e.target.value)} />
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
              <Field label="Name color">
                <input type="color" value={nameColor || "#222222"} onChange={(e) => setNameColor(e.target.value)} />
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
                <Field label="Associated, Instruments" hint="Comma separated">
                  <input
                    value={instruments}
                    onChange={(e) => setInstruments(e.target.value)}
                    placeholder="Piano, violin, synth…"
                  />
                </Field>
              </div>
              <Field label="Associated leitmotifs">
                {active?.leitmotifs.length ? (
                  <CheckList
                    className="associated-check-list"
                    items={active.leitmotifs.map((x) => ({
                      id: x.id,
                      name: x.name,
                      nameColor: x.nameColor,
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
                    className="associated-check-list"
                    items={active.tracks.map((x) => ({
                      id: x.id,
                      name: x.name,
                      nameColor: x.nameColor,
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
              <Field label="Name color">
                <input type="color" value={nameColor || "#222222"} onChange={(e) => setNameColor(e.target.value)} />
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
                      nameColor: x.nameColor,
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
                      .map((x) => ({ id: x.id, name: x.name, nameColor: x.nameColor }))}
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
              <Field label="Name color">
                <input type="color" value={nameColor || "#222222"} onChange={(e) => setNameColor(e.target.value)} />
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
                      nameColor: x.nameColor,
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
            </>
          )}
          {modal === "share" && (
            <>
              <p className="modal-intro">
                Give specific people access to your private soundtrack. Owners
                always keep full control.
              </p>
              {profiles.map((person, i) => {
                const key = person.id;
                return (
                  <div className="share-person" key={person.id}>
                    <div className={`avatar person-${i}`}>
                      {person.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{person.username}</strong>
                      <small>Soundtracker user</small>
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
                People you select can access this soundtrack after signing in.
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

function TrackMotifAppearanceEditor({
  trackName,
  trackNameColor,
  motifName,
  motifNameColor,
  initialAppearances,
  onClose,
  onSave,
}: {
  trackName: string;
  trackNameColor?: string;
  motifName: string;
  motifNameColor?: string;
  initialAppearances: TrackMotifAppearance[];
  onClose: () => void;
  onSave: (appearances: TrackMotifAppearance[]) => void;
}) {
  const [appearances, setAppearances] = useState(initialAppearances);

  function updateAppearance(
    id: string,
    field: "appearanceInTrack" | "appearanceInStory",
    value: string,
  ) {
    setAppearances((all) =>
      all.map((appearance) =>
        appearance.id === id ? { ...appearance, [field]: value } : appearance,
      ),
    );
  }

  function addAppearance() {
    setAppearances((all) => [
      ...all,
      {
        id: `appearance-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        appearanceInTrack: "",
        appearanceInStory: "",
      },
    ]);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-motif-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <div className="eyebrow muted-eyebrow" style={{ color: trackNameColor }}>{trackName}</div>
            <h2 id="track-motif-editor-title">Edit leitmotif appearance</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(
              appearances.map((appearance) => ({
                ...appearance,
                appearanceInTrack: appearance.appearanceInTrack.trim(),
                appearanceInStory: appearance.appearanceInStory.trim(),
              })),
            );
          }}
        >
          <p className="modal-intro" style={{ color: motifNameColor }}>{motifName}</p>
          <div className="appearance-editor-list">
            {appearances.map((appearance, index) => (
              <section className="appearance-editor-item" key={appearance.id}>
                <div className="appearance-editor-heading">
                  <strong>Appearance {index + 1}</strong>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Remove appearance ${index + 1}`}
                    onClick={() =>
                      setAppearances((all) =>
                        all.filter((item) => item.id !== appearance.id),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <Field label="Timestamp in track">
                  <input
                    autoFocus={index === 0}
                    value={appearance.appearanceInTrack}
                    onChange={(event) =>
                      updateAppearance(
                        appearance.id,
                        "appearanceInTrack",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 1:24"
                  />
                </Field>
                <Field label="Description in the story">
                  <textarea
                    value={appearance.appearanceInStory}
                    onChange={(event) =>
                      updateAppearance(
                        appearance.id,
                        "appearanceInStory",
                        event.target.value,
                      )
                    }
                    placeholder="Describe what is happening when this theme appears."
                    rows={2}
                  />
                </Field>
              </section>
            ))}
          </div>
          <button
            className="appearance-add-button"
            type="button"
            onClick={addAppearance}
          >
            <Plus size={15} /> Add appearance
          </button>
          <div className="modal-footer">
            <button
              className="button button-ghost"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save changes <ArrowRight size={15} />
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
  const fieldLabel = (
    <span>
      {label}
      {hint && <small>{hint}</small>}
    </span>
  );

  if (isValidElement(children) && children.type === CheckList) {
    return (
      <div className="field">
        {fieldLabel}
        {children}
      </div>
    );
  }

  return (
    <label className="field">
      {fieldLabel}
      {children}
    </label>
  );
}
function CheckList({
  items,
  selected,
  onChange,
  className = "",
}: {
  items: { id: string; name: string; nameColor?: string }[];
  selected: string[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  return (
    <div className={`check-list ${className}`}>
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
          <span style={{ color: item.nameColor }}>{item.name}</span>
        </label>
      ))}
    </div>
  );
}
