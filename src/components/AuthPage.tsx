import { useState } from "react";
import { AudioLines, ArrowRight } from "lucide-react";

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export default function AuthPage({
  onSignIn,
  onSignUp,
}: {
  onSignIn: (values: AuthCredentials) => Promise<string | null>;
  onSignUp: (values: AuthCredentials) => Promise<string | null>;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const error = await (mode === "login" ? onSignIn : onSignUp)(
      mode === "login"
        ? { email, password }
        : { email, password, username },
    );
    setMessage(error || (mode === "signup" ? "Check your email to confirm your account." : ""));
    setBusy(false);
  }

  return (
    <main className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand"><AudioLines size={22} /> Soundtracker</div>
        <div className="eyebrow muted-eyebrow">YOUR MUSIC, CONNECTED TO THE STORY</div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>Sign in to work on your soundtracks from any device.</p>
        {mode === "signup" && (
          <label className="field"><span>Username</span><input required minLength={3} maxLength={50} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        )}
        <label className="field"><span>Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label className="field"><span>Password</span><input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="button button-primary auth-submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={16} />
        </button>
        <button type="button" className="auth-mode-toggle" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? "New to Soundtracker? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
