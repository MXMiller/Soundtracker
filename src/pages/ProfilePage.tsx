import { useState } from "react";
import { ArrowLeft, Check, Pencil, Save } from "lucide-react";
import type { Soundtrack } from "../types";
import type { UserProfile } from "../types/supabase";
import { SoundtrackCard } from "../components/EntityCards";

export default function ProfilePage({
  profile,
  isOwnProfile,
  soundtracks,
  onBack,
  onSave,
  onOpenSoundtrack,
  onFavorite,
  favoriteIds,
}: {
  profile: UserProfile;
  isOwnProfile: boolean;
  soundtracks: Soundtrack[];
  onBack: () => void;
  onSave: (values: { username: string; description: string }) => Promise<void>;
  onOpenSoundtrack: (item: Soundtrack) => void;
  onFavorite: (item: Soundtrack) => void;
  favoriteIds: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [description, setDescription] = useState(profile.description || "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSaveError("");
    try {
      await onSave({ username, description });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save profile.");
      setBusy(false);
      return;
    }
    setBusy(false);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="content profile-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back</button>
      <section className="profile-hero">
        <div className="avatar profile-avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
        <div className="profile-copy">
          {editing ? (
            <form className="profile-edit-form" onSubmit={save}>
              <label className="field"><span>Username</span><input required minLength={3} maxLength={50} value={username} onChange={(event) => setUsername(event.target.value)} /></label>
              <label className="field"><span>About</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              {saveError && <p className="form-error">{saveError}</p>}
              <div className="profile-actions"><button className="button button-primary" disabled={busy}><Save size={15} /> Save profile</button><button type="button" className="button button-outline" onClick={() => setEditing(false)}>Cancel</button></div>
            </form>
          ) : <>
            <div className="eyebrow muted-eyebrow">SOUNDTRACKER PROFILE</div>
            <h1>{profile.username}</h1>
            <p>{profile.description || "This profile has not added a description yet."}</p>
            {isOwnProfile && <button className="button button-outline" onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</button>}
            {saved && <span className="profile-saved"><Check size={14} /> Profile saved</span>}
          </>}
        </div>
      </section>
      <div className="section-toolbar"><h2>{isOwnProfile ? "Your soundtracks" : `${profile.username}’s public soundtracks`}</h2></div>
      {soundtracks.length ? <div className="library-grid">{soundtracks.map((item, index) => <SoundtrackCard key={item.id} item={item} index={index} isMine={isOwnProfile} isFavorite={favoriteIds.includes(item.id)} onOpen={() => onOpenSoundtrack(item)} onFavorite={() => onFavorite(item)} />)}</div> : <div className="empty-library"><h3>No soundtracks to show</h3><p>{isOwnProfile ? "Soundtracks you create will appear here." : "This user has no public soundtracks yet."}</p></div>}
    </div>
  );
}
