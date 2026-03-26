"use client";

type AuthScreenProps = {
  authMessage: string | null;
  email: string;
  isSendingLink: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
};

export function AuthScreen({
  authMessage,
  email,
  isSendingLink,
  onEmailChange,
  onSubmit,
}: AuthScreenProps) {
  return (
    <main className="page-shell">
      <section className="mobile-frame">
        <div className="screen">
          <div className="hero-card">
            <h1>Lift Log</h1>
          </div>

          <div className="signin-card">
            <h2>Sign in</h2>

            <form
              className="signin-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                aria-label="Email address"
                className="text-input"
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="name@example.com"
              />
              <button
                className="primary-button"
                type="button"
                onClick={onSubmit}
                disabled={isSendingLink}
              >
                {isSendingLink ? "Sending..." : "Send magic link"}
              </button>
              {authMessage ? <p className="auth-message">{authMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
