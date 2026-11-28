import { useState } from "react";
import { Check, KeyRound, Pencil, Save } from "lucide-react";
import type { Soundtrack } from "../types";
import type { UserProfile } from "../types/supabase";
import { PageSearch, SoundtrackCard } from "../components/EntityCards";

export default function ProfilePage({
  profile,
  isOwnProfile,
  soundtracks,
  onSave,
  onRequestPasswordChange,
  onOpenSoundtrack,
  onFavorite,
  favoriteIds,
  query,
  onQueryChange,
}: {
  profile: UserProfile;
  isOwnProfile: boolean;
  soundtracks: Soundtrack[];
  onSave: (values: { username: string; description: string }) => Promise<void>;
  onRequestPasswordChange: () => Promise<string | null>;
  onOpenSoundtrack: (item: Soundtrack) => void;
  onFavorite: (item: Soundtrack) => void;
  favoriteIds: string[];
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [description, setDescription] = useState(profile.description || "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [passwordEmailSent, setPasswordEmailSent] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
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

  async function requestPasswordChange() {
    setPasswordBusy(true);
    setSaveError("");
    try {
      const error = await onRequestPasswordChange();
      if (error) {
        setSaveError(error);
        return;
      }
      setPasswordEmailSent(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not send password change email.");
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="content library-page profile-page">
      <div className="welcome-row profile-welcome-row">
        <div className="profile-heading">
          <div className="avatar profile-avatar">{profile.username.slice(0, 2).toUpperCase()}</div>
          <div className="profile-heading-copy">
            <div className="eyebrow muted-eyebrow">SOUNDTRACKER PROFILE</div>
            <h1>{profile.username}</h1>
            <p>{profile.description || "A little space for all the music in this user's head."}</p>
          </div>
        </div>
        {isOwnProfile && !editing && (
          <div className="welcome-actions">
            <button className="button button-outline" onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</button>
          </div>
        )}
      </div>

      {editing && (
        <form className="profile-edit-form" onSubmit={save}>
          <label className="field"><span>Username</span><input required minLength={3} maxLength={50} value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label className="field"><span>About</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <div className="field profile-password-field">
            <span>Password</span>
            <div className="profile-password-action">
              <button type="button" className="button button-outline" onClick={requestPasswordChange} disabled={passwordBusy}>
                <KeyRound size={15} /> {passwordBusy ? "Sending email…" : "Change password"}
              </button>
              {passwordEmailSent && <span className="password-email-sent" role="status">Password change email sent.</span>}
            </div>
            <small>We’ll email you a secure link to update your password.</small>
          </div>
          {saveError && <p className="form-error">{saveError}</p>}
          <div className="profile-actions"><button className="button button-primary" disabled={busy}><Save size={15} /> Save profile</button><button type="button" className="button button-outline" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      )}
      {saved && <p className="profile-saved"><Check size={14} /> Profile saved</p>}

      <div className="section-toolbar">
        <div className="list-title"><h2>{isOwnProfile ? "Your soundtracks" : `${profile.username}’s soundtracks`}</h2></div>
        <PageSearch page="library" query={query} onChange={onQueryChange} />
      </div>
      {(() => {
        const order = (item: Soundtrack) => isOwnProfile
          ? item.userLibraryOrder ?? item.libraryOrder ?? Number.MAX_SAFE_INTEGER
          : item.libraryOrder ?? Number.MAX_SAFE_INTEGER;
        const filtered = [...soundtracks].sort((first, second) => order(first) - order(second)).filter((item) => `${item.name} ${item.composers.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
        return filtered.length ? (
          <div className="library-grid">{filtered.map((item) => <SoundtrackCard key={item.id} item={item} isMine={isOwnProfile} isFavorite={favoriteIds.includes(item.id)} onOpen={() => onOpenSoundtrack(item)} onFavorite={() => onFavorite(item)} />)}</div>
        ) : (
          <div className="empty-library"><h3>{query ? "Nothing matched your search" : "No soundtracks to show"}</h3><p>{query ? "Try another title or composer." : isOwnProfile ? "Soundtracks you create will appear here." : "This user has no public soundtracks yet."}</p></div>
        );
      })()}
      <footer className="page-footer">Soundtracker <span>·</span> Keep the music connected to the story.</footer>
    </div>
  );
}
