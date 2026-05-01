import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Discover } from "./pages/Discover";
import { Profile } from "./pages/Profile";
import { Favorites } from "./pages/Favorites";
import { CalendarPage } from "./pages/CalendarPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AboutPage } from "./pages/AboutPage";
import { CategoryDetail } from "./pages/CategoryDetail";
import { ErrorReportPage } from "./pages/ErrorReportPage";
import { ErrorReportDetailPage } from "./pages/ErrorReportDetailPage";
import { CardDetailPage } from "./pages/CardDetailPage";
import { UserAgreementPage } from "./pages/UserAgreementPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ReportContentPage } from "./pages/ReportContentPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { ProfileEditPage } from "./pages/ProfileEditPage";
import { SubPageWrapper } from "./components/SubPageWrapper";
import { WelcomePage } from "./pages/auth/WelcomePage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { useAuth } from "./context/AuthContext";

// ─── Auth guard wrapping Layout ───────────────────────────────────────────────

function AuthGuard() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/welcome" replace />;
  return <Layout />;
}

// ─── Auth wrapper for sub-pages ───────────────────────────────────────────────

function AuthSubGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function wrap(Component: React.ComponentType) {
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

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Auth routes (always accessible)
  { path: "/welcome",  Component: WelcomePage },
  { path: "/login",    Component: LoginPage },
  { path: "/register", Component: RegisterPage },

  // Main app (protected)
  {
    path: "/",
    Component: AuthGuard,
    children: [
      { index: true,         Component: Home },
      { path: "discover",    Component: Discover },
      { path: "profile",     Component: Profile },
    ],
  },

  // Sub-pages (protected)
  { path: "/profile/edit",      Component: wrap(ProfileEditPage) },
  { path: "/favorites",         Component: wrap(Favorites) },
  { path: "/calendar",          Component: wrap(CalendarPage) },
  { path: "/settings",          Component: wrap(SettingsPage) },
  { path: "/about",             Component: wrap(AboutPage) },
  { path: "/category/:id",      Component: wrap(CategoryDetail) },
  { path: "/card/:id",          Component: wrap(CardDetailPage) },
  { path: "/error-reports",     Component: wrap(ErrorReportPage) },
  { path: "/error-reports/:id", Component: wrap(ErrorReportDetailPage) },
  { path: "/user-agreement",    Component: wrap(UserAgreementPage) },
  { path: "/privacy-policy",    Component: wrap(PrivacyPolicyPage) },
  { path: "/report-content",    Component: wrap(ReportContentPage) },
  { path: "/contact-us",        Component: wrap(ContactUsPage) },
]);
