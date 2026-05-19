import { useEffect } from "react";
import { Navigate } from "react-router";
import { Layout } from "@/components/Layout";
import { SubPageWrapper } from "@/components/SubPageWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/providers/UserContext";

// ─── Auth guard wrapping Layout ───────────────────────────────────────────────

export function AuthGuard() {
  const { isLoggedIn } = useAuth();
  const { initProfile } = useUser();

  useEffect(() => {
    if (isLoggedIn) initProfile();
  }, [isLoggedIn, initProfile]);

  if (!isLoggedIn) return <Navigate to="/welcome" replace />;
  return <Layout />;
}

// ─── Auth wrapper for sub-pages ───────────────────────────────────────────────

export function AuthSubGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export function wrap(Component: React.ComponentType) {
  return function WrappedPage() {
    return (
      <AuthSubGuard>
        <SubPageWrapper>
          <Component />
        </SubPageWrapper>
      </AuthSubGuard>
    );
  };
}

export { router } from "./router";
