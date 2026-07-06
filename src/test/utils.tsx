import type { ReactElement, ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "@shared/i18n";
import { AuthProvider } from "@shared/auth/AuthProvider";
import { ToastProvider } from "@shared/ui";
import { MOCK_SESSION_KEY } from "@shared/auth/config";
import type { AppRole, AuthUser } from "@shared/auth/roles";

export function makeUser(roles: AppRole[]): AuthUser {
  return { id: "u-test", name: "Test Op", email: "t@louka.ma", roles };
}

interface Options {
  /** Seed a mock auth session before render. */
  user?: AuthUser;
}

export function renderWithProviders(ui: ReactElement, { user }: Options = {}) {
  if (user) localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
  // Deterministic locale for assertions.
  if (i18n.resolvedLanguage !== "en") void i18n.changeLanguage("en");

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <QueryClientProvider client={client}>
            <ToastProvider>{children}</ToastProvider>
          </QueryClientProvider>
        </AuthProvider>
      </I18nextProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
