import { useState } from "react";
import { ArrowRight, AudioLines, Check, KeyRound } from "lucide-react";

export default function PasswordChangePage({
  onVerifyCurrentPassword,
  onSaveNewPassword,
  onComplete,
}: {
  onVerifyCurrentPassword: (password: string) => Promise<string | null>;
  onSaveNewPassword: (password: string) => Promise<string | null>;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"current" | "new" | "done">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function verifyCurrentPassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const message = await onVerifyCurrentPassword(currentPassword);
      if (message) {
        setError(message);
        return;
      }
      setStep("new");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not verify the current password.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNewPassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const message = await onSaveNewPassword(newPassword);
      if (message) {
        setError(message);
        return;
      }
      setStep("done");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card password-change-card">
        <div className="auth-brand"><AudioLines size={22} /> Soundtracker</div>
        {step === "done" ? (
          <>
            <div className="eyebrow muted-eyebrow">PASSWORD UPDATED</div>
            <h1>Password changed</h1>
            <p>Your password has been updated. You can return to Soundtracker now.</p>
            <button className="button button-primary auth-submit" onClick={onComplete}>
              Continue to Soundtracker <Check size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="eyebrow muted-eyebrow">SECURE YOUR ACCOUNT</div>
            <h1>{step === "current" ? "Confirm your current password" : "Choose a new password"}</h1>
            <p>{step === "current" ? "Enter your current password to continue." : "Enter your new password twice to confirm it."}</p>
            {step === "current" ? (
              <form onSubmit={verifyCurrentPassword}>
                <label className="field">
                  <span>Current password</span>
                  <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                </label>
                {error && <p className="auth-message" role="alert">{error}</p>}
                <button className="button button-primary auth-submit" disabled={busy}>
                  {busy ? "Checking…" : "Continue"} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={saveNewPassword}>
                <label className="field">
                  <span>New password</span>
                  <input required minLength={6} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                </label>
                <label className="field">
                  <span>Confirm new password</span>
                  <input required minLength={6} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </label>
                {error && <p className="auth-message" role="alert">{error}</p>}
                <button className="button button-primary auth-submit" disabled={busy}>
                  {busy ? "Saving…" : "Update password"} <KeyRound size={16} />
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}
