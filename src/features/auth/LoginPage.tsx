import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Field, Input, PasswordInput } from "@shared/ui";
import { useAuth } from "@shared/auth/useAuth";
import type { AuthUser } from "@shared/auth/roles";
import { LanguageSwitcher } from "@shared/i18n/LanguageSwitcher";
import "./login.css";

const PERSONAS: { user: AuthUser; roleKey: string }[] = [
  {
    roleKey: "ADMIN",
    user: { id: "u-admin", name: "Hamza Damiri", email: "hamza@louka.ma", roles: ["ADMIN"] },
  },
  {
    roleKey: "CATALOG_MANAGER",
    user: { id: "u-cat", name: "Nadia Bensalah", email: "nadia@louka.ma", roles: ["CATALOG_MANAGER"] },
  },
  {
    roleKey: "PARTNER_MANAGER",
    user: { id: "u-ptr", name: "Karim Idrissi", email: "karim@louka.ma", roles: ["PARTNER_MANAGER"] },
  },
  {
    roleKey: "DISPATCHER",
    user: { id: "u-dsp", name: "Sara El Fassi", email: "sara@louka.ma", roles: ["DISPATCHER"] },
  },
  {
    roleKey: "FINANCE",
    user: { id: "u-fin", name: "Youssef Alaoui", email: "youssef@louka.ma", roles: ["FINANCE"] },
  },
];

export function LoginPage() {
  const { t } = useTranslation(["auth", "common"]);
  const { status, mode, login, loginMock } = useAuth();
  const location = useLocation();

  if (status === "authenticated") {
    // Return to the page that bounced us here (set by RequireAuth), else home.
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  const body =
    mode === "keycloak" ? (
      <Button variant="primary" size="lg" block onClick={login}>
        {t("signInKeycloak")}
      </Button>
    ) : mode === "backend" ? (
      <CredentialForm />
    ) : (
      <>
        <p className="eyebrow login__pick">{t("pickPersona")}</p>
        <ul className="login__personas">
          {PERSONAS.map((p) => (
            <li key={p.user.id}>
              <button type="button" className="persona" onClick={() => loginMock(p.user)}>
                <span className="persona__avatar" aria-hidden="true">
                  {initials(p.user.name)}
                </span>
                <span className="persona__meta">
                  <span className="persona__name">{p.user.name}</span>
                  <span className="persona__role">{t(`roles.${p.roleKey}` as const)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="login__note">{t("mockNote")}</p>
      </>
    );

  return (
    <div className="login">
      <div className="login__top">
        <LanguageSwitcher />
      </div>
      <div className="login__card">
        <div className="login__brand">
          <span className="login__mark" aria-hidden="true">L</span>
          <span className="login__word">Loüka · Admin</span>
        </div>
        <p className="login__lede">{t("signInLede")}</p>
        {body}
      </div>
    </div>
  );
}

function CredentialForm() {
  const { t } = useTranslation(["auth", "common"]);
  const { loginBackend } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await loginBackend(username, password);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login__form" onSubmit={submit}>
      <Field label={t("username")} htmlFor="login-user">
        <Input
          id="login-user"
          value={username}
          autoComplete="username"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </Field>
      <Field
        label={t("password")}
        htmlFor="login-pass"
        error={error ? t("signInError") : undefined}
      >
        <PasswordInput
          id="login-pass"
          value={password}
          autoComplete="current-password"
          invalid={error}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" block disabled={busy}>
        {t("signIn")}
      </Button>
    </form>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
